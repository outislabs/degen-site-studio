import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Rate Limiting ---
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 300_000; // 5 minutes
const RATE_LIMIT_MAX = 5;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// --- Input Validation ---
const VALID_PLANS = ["degen", "creator", "whale"];
const VALID_BILLING_PERIODS = ["monthly", "annual"];

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

    // Rate limit by user
    if (!checkRateLimit(`user:${user.id}`)) {
      return new Response(JSON.stringify({ error: "Too many subscription requests. Please wait." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "300" },
      });
    }

    const body = await req.json();
    const { plan, billing_period } = body;

    // Validate plan
    if (!plan || typeof plan !== "string" || !VALID_PLANS.includes(plan)) {
      return new Response(JSON.stringify({ error: `Invalid plan. Must be one of: ${VALID_PLANS.join(", ")}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate billing_period
    const period = billing_period || "monthly";
    if (typeof period !== "string" || !VALID_BILLING_PERIODS.includes(period)) {
      return new Response(JSON.stringify({ error: `Invalid billing period. Must be: ${VALID_BILLING_PERIODS.join(", ")}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let price = PLAN_PRICES[plan];
    if (period === 'annual') {
      price = Math.round(price * 12 * 0.8);
    }

    const orderId = `sub_${user.id}_${plan}_${Date.now()}`;

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
        order_description: `DegenTools ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${period === 'annual' ? 'Annual' : 'Monthly'}`,
        success_url: `${req.headers.get("origin") || ""}/pricing?payment=success&plan=${plan}`,
        cancel_url: `${req.headers.get("origin") || ""}/pricing?payment=cancelled`,
      }),
    });

    // Read body once as text then parse
    const invoiceText = await invoiceRes.text();
    let invoiceData: any;

    try {
      invoiceData = JSON.parse(invoiceText);
    } catch {
      throw new Error(`Payment provider returned invalid response: ${invoiceText}`);
    }

    if (!invoiceRes.ok) {
      console.error(`NOWPayments error [${invoiceRes.status}]:`, invoiceText);
      throw new Error(`Payment provider error: ${invoiceRes.status} - ${invoiceText}`);
    }

    // Update subscription to pending
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient
      .from("user_subscriptions")
      .upsert({
        user_id: user.id,
        plan: plan,
        status: "pending",
        billing_period: period,
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Subscription creation failed. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
