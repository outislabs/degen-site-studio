import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyCliToken, hashToken } from "../_shared/cliJWT.ts";

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
    const cliUser = await verifyCliToken(req);
    if (!cliUser) return json({ error: "Unauthorized" }, 401);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Revoke this specific session by its id (resolved during token verification)
    const { error } = await adminClient
      .from("cli_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", cliUser.sessionId)
      .is("revoked_at", null); // idempotent

    if (error) throw new Error(error.message);

    console.log("cli-auth-revoke: session revoked for user", cliUser.userId);
    return json({ ok: true });
  } catch (err) {
    console.error("cli-auth-revoke error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
