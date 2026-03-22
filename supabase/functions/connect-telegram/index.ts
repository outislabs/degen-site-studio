import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await req.json();
    const { action } = body;
    const authHeader = req.headers.get("Authorization") || "";

    // ── generate_token ─────────────────────────────────────────────
    // Called from telegram-bot using service role key. No user JWT.
    if (action === "generate_token") {
      if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { chatId } = body;
      if (!chatId) return new Response(JSON.stringify({ error: "Missing chatId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

      const { data, error } = await admin
        .from("telegram_connect_tokens")
        .insert({ chat_id: chatId })
        .select("token")
        .single();

      if (error) throw error;

      const link = `https://degentools.co/connect-telegram?token=${data.token}`;
      return new Response(JSON.stringify({ success: true, link }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── verify_token ────────────────────────────────────────────────
    // Called from the frontend with the user's JWT.
    if (action === "verify_token") {
      if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

      const { token } = body;
      if (!token) return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

      // Validate token — must be unused and not expired
      const { data: tokenRow, error: tokenError } = await admin
        .from("telegram_connect_tokens")
        .select("*")
        .eq("token", token)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (tokenError || !tokenRow) return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

      // Mark token used
      await admin
        .from("telegram_connect_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", tokenRow.id);

      // Save chatId — update if subscription row exists, otherwise insert
      const { data: existing } = await admin
        .from("user_subscriptions")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        await admin
          .from("user_subscriptions")
          .update({ telegram_chat_id: tokenRow.chat_id })
          .eq("user_id", user.id);
      } else {
        await admin
          .from("user_subscriptions")
          .insert({ user_id: user.id, telegram_chat_id: tokenRow.chat_id });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("connect-telegram error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
