import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    // Auth via the user's Supabase browser session JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const { session_token } = body;

    if (!session_token || typeof session_token !== "string") {
      return json({ error: "session_token is required" }, 400);
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: record, error: fetchError } = await adminClient
      .from("cli_pending_sessions")
      .select("session_token, status, expires_at")
      .eq("session_token", session_token)
      .single();

    if (fetchError || !record) return json({ error: "Invalid session" }, 404);
    if (record.status !== "pending") return json({ error: "Session already used" }, 409);
    if (new Date(record.expires_at) < new Date()) return json({ error: "Session expired" }, 410);

    // Atomic update — guard against race with eq status check
    const { error: updateError } = await adminClient
      .from("cli_pending_sessions")
      .update({ status: "confirmed", user_id: user.id })
      .eq("session_token", session_token)
      .eq("status", "pending");

    if (updateError) throw new Error(updateError.message);

    console.log("cli-session-confirm: session confirmed for user", user.id);
    return json({ ok: true });
  } catch (err) {
    console.error("cli-session-confirm error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
