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
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Backend generates the session token — CLI never touches it until poll returns it
    const rawBytes = crypto.getRandomValues(new Uint8Array(32));
    const sessionToken = Array.from(rawBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await adminClient
      .from("cli_pending_sessions")
      .insert({ session_token: sessionToken, status: "pending", expires_at: expiresAt });

    if (error) throw new Error(error.message);

    const authorizeUrl = `https://degentools.co/cli-authorize?session=${sessionToken}`;

    console.log("cli-session-start: pending session created");
    return json({ session_token: sessionToken, authorize_url: authorizeUrl });
  } catch (err) {
    console.error("cli-session-start error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
