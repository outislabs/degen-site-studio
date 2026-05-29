import { createClient } from "npm:@supabase/supabase-js@2";
import { signCliJWT, hashToken } from "../_shared/cliJWT.ts";

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
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  try {
    const url = new URL(req.url);
    const sessionToken = url.searchParams.get("session");

    if (!sessionToken) return json({ error: "session query param required" }, 400);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: record, error: fetchError } = await adminClient
      .from("cli_pending_sessions")
      .select("session_token, user_id, status, expires_at")
      .eq("session_token", sessionToken)
      .single();

    if (fetchError || !record) return json({ error: "Invalid session" }, 404);
    if (record.status === "consumed") return json({ error: "Session already consumed" }, 410);
    if (new Date(record.expires_at) < new Date()) return json({ error: "Session expired" }, 410);

    // Still waiting for user to authorize in the browser
    if (record.status === "pending") return json({ error: "Pending" }, 404);

    // Confirmed — mint long-lived CLI JWT, create session row, consume pending session
    const jwtSecret = Deno.env.get("CLI_JWT_SECRET")!;
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 30 * 24 * 60 * 60; // 30 days

    const { data: authUser } = await adminClient.auth.admin.getUserById(record.user_id);
    const email = authUser?.user?.email ?? "";

    const { data: sub } = await adminClient
      .from("user_subscriptions")
      .select("plan")
      .eq("user_id", record.user_id)
      .eq("status", "active")
      .maybeSingle();
    const plan = sub?.plan ?? "free";

    const token = await signCliJWT(
      { sub: record.user_id, email, role: "cli", iat: now, exp },
      jwtSecret,
    );

    const tokenHash = await hashToken(token);

    const { error: sessionError } = await adminClient
      .from("cli_sessions")
      .insert({
        user_id: record.user_id,
        token_hash: tokenHash,
        expires_at: new Date(exp * 1000).toISOString(),
      });

    if (sessionError) throw new Error(sessionError.message);

    // Consume the pending session so it can't be polled again
    await adminClient
      .from("cli_pending_sessions")
      .update({ status: "consumed", consumed_at: new Date().toISOString() })
      .eq("session_token", sessionToken);

    console.log("cli-session-poll: token issued for user", record.user_id);
    return json({ token, userId: record.user_id, plan });
  } catch (err) {
    console.error("cli-session-poll error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
