import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAN_PRICES: Record<string, number> = {
  degen: 19,
  creator: 49,
  pro: 99,
  whale: 249,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NOWPAYMENTS_API_KEY = Deno.env.get("NOWPAYMENTS_API_KEY");
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error("NOWPAYMENTS_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { plan, billing_period } = await req.json();

    if (!plan || !PLAN_PRICES[plan]) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let price = PLAN_PRICES[plan];
    if (billing_period === 'annual') {
      price = Math.round(price * 12 * 0.8); // 20% discount, billed annually
    }

    const orderId = `sub_${user.id}_${plan}_${Date.now()}`;

    // Create NOWPayments invoice
    const invoiceRes = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: price,
        price_currency: "usd",
        order_id: orderId,
        order_description: `DegenTools ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${billing_period === 'annual' ? 'Annual' : 'Monthly'}`,
        success_url: `${req.headers.get("origin") || ""}/pricing?payment=success&plan=${plan}`,
        cancel_url: `${req.headers.get("origin") || ""}/pricing?payment=cancelled`,
      }),
    });

    const invoiceData = await invoiceRes.json();

    if (!invoiceRes.ok) {
      throw new Error(`NOWPayments error [${invoiceRes.status}]: ${JSON.stringify(invoiceData)}`);
    }

    // Update subscription to pending
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upsert subscription
    await serviceClient
      .from("user_subscriptions")
      .upsert({
        user_id: user.id,
        plan: plan,
        status: "pending",
        billing_period: billing_period || "monthly",
        payment_id: invoiceData.id?.toString(),
      }, { onConflict: 'user_id' });

    return new Response(
      JSON.stringify({
        invoice_url: invoiceData.invoice_url,
        payment_id: invoiceData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error creating subscription:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
