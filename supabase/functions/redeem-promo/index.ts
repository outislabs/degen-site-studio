import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_ANON_KEY"),
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { code } = await req.json();
    if (!code) return new Response(JSON.stringify({ error: "Missing promo code" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const cleanCode = code.trim().toUpperCase();

    const { data: promo, error: promoError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", cleanCode)
      .eq("active", true)
      .single();

    if (promoError || !promo) return new Response(JSON.stringify({ error: "Invalid or expired promo code" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    if (promo.uses_count >= promo.max_uses) return new Response(JSON.stringify({ error: "This promo code has reached its maximum uses" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: existing } = await supabase
      .from("promo_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("code", cleanCode)
      .single();

    if (existing) return new Response(JSON.stringify({ error: "You have already used this promo code" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + promo.duration_days);

    const { error: redemptionError } = await supabase
      .from("promo_redemptions")
      .insert({ user_id: user.id, promo_code_id: promo.id, code: cleanCode, expires_at: expiresAt.toISOString() });

    if (redemptionError) throw new Error(redemptionError.message);

    await supabase.from("promo_codes").update({ uses_count: promo.uses_count + 1 }).eq("id", promo.id);

    const { error: subError } = await supabase
      .from("user_subscriptions")
      .upsert({ user_id: user.id, plan: promo.plan, status: "active", billing_period: promo.billing_period, current_period_end: expiresAt.toISOString(), promo_code: cleanCode, payment_id: "promo_" + cleanCode }, { onConflict: "user_id" });

    if (subError) throw new Error(subError.message);

    const spotsLeft = promo.max_uses - (promo.uses_count + 1);

    return new Response(JSON.stringify({
      success: true,
      message: "🎉 Promo code applied! You have been upgraded to " + promo.plan.charAt(0).toUpperCase() + promo.plan.slice(1) + " plan for " + promo.duration_days + " days.",
      plan: promo.plan,
      expiresAt: expiresAt.toISOString(),
      spotsLeft: Math.max(0, spotsLeft),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("redeem-promo error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});