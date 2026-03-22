import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hashKey(key: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function generateRawKey(): string {
  const bytes = new Uint8Array(20); // 20 bytes → 40 hex chars
  crypto.getRandomValues(bytes);
  return "dgt_" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    // Service role used for writes so RLS doesn't block us
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // GET /api-keys — list caller's keys (no raw key, only prefix + metadata)
    if (req.method === "GET") {
      const { data, error } = await serviceClient
        .from("api_keys")
        .select("id, name, key_prefix, is_active, requests_per_minute, requests_per_day, created_at, last_used_at, revoked_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return json({ success: true, keys: data });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { action } = body;

      // ---- CREATE ----
      if (action === "create") {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name) return json({ error: "Key name is required" }, 400);

        // Cap at 5 active keys per user
        const { count } = await serviceClient
          .from("api_keys")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_active", true);

        if ((count ?? 0) >= 5) {
          return json({ error: "Maximum of 5 active API keys allowed. Revoke one to create a new key." }, 400);
        }

        // Derive rate limits from active subscription plan
        const { data: sub } = await serviceClient
          .from("user_subscriptions")
          .select("plan")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        const plan = sub?.plan ?? "starter";
        const [requestsPerMinute, requestsPerDay] =
          plan === "pro"   ? [60, 5000] :
          plan === "degen" ? [30, 2000] :
                             [10,  500];

        const rawKey  = generateRawKey();
        const keyHash = await hashKey(rawKey);
        const keyPrefix = rawKey.slice(0, 12); // "dgt_" + 8 hex chars for display

        const { data: newKey, error: insertError } = await serviceClient
          .from("api_keys")
          .insert({
            user_id: user.id,
            name: name.slice(0, 100),
            key_hash: keyHash,
            key_prefix: keyPrefix,
            requests_per_minute: requestsPerMinute,
            requests_per_day: requestsPerDay,
          })
          .select("id, name, key_prefix, is_active, requests_per_minute, requests_per_day, created_at")
          .single();

        if (insertError) throw insertError;

        return json({
          success: true,
          // Raw key is returned ONCE — never stored, cannot be recovered
          key: rawKey,
          keyInfo: newKey,
          message: "Save this API key now — it will not be shown again.",
        });
      }

      // ---- REVOKE ----
      if (action === "revoke") {
        const { id } = body;
        if (!id) return json({ error: "Key id is required" }, 400);

        const { error } = await serviceClient
          .from("api_keys")
          .update({ is_active: false, revoked_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user.id); // ownership enforced even on service client

        if (error) throw error;
        return json({ success: true });
      }

      return json({ error: "Invalid action. Use 'create' or 'revoke'." }, 400);
    }

    return json({ error: "Method not allowed" }, 405);

  } catch (e) {
    console.error("api-keys error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
