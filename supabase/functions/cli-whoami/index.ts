import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyAnyToken } from "../_shared/cliJWT.ts";

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
    const cliUser = await verifyAnyToken(req);
    if (!cliUser) return json({ error: "Unauthorized" }, 401);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: sub } = await adminClient
      .from("user_subscriptions")
      .select("plan")
      .eq("user_id", cliUser.userId)
      .eq("status", "active")
      .maybeSingle();

    return json({
      userId: cliUser.userId,
      email: cliUser.email,
      plan: sub?.plan ?? "free",
    });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Rate limit exceeded")) {
      return json({ error: err.message }, 429);
    }
    console.error("cli-whoami error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
