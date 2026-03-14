import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Rate Limiting ---
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 300_000; // 5 minutes
const RATE_LIMIT_MAX = 5; // max 5 payment creations per 5 min

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NOWPAYMENTS_API_KEY = Deno.env.get("NOWPAYMENTS_API_KEY");
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error("NOWPAYMENTS_API_KEY is not configured");
    }

    // Authenticate user
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
      return new Response(JSON.stringify({ error: "Too many payment requests. Please wait a few minutes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "300" },
      });
    }

    const body = await req.json();
    const { site_id } = body;

    // Validate site_id format (UUID)
    if (!site_id || typeof site_id !== "string" || !/^[0-9a-f-]{36}$/.test(site_id)) {
      return new Response(JSON.stringify({ error: "Valid site_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user owns this site
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, domain_payment_status")
      .eq("id", site_id)
      .eq("user_id", user.id)
      .single();

    if (siteError || !site) {
      return new Response(JSON.stringify({ error: "Site not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (site.domain_payment_status === "paid") {
      return new Response(JSON.stringify({ error: "Already paid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create NOWPayments invoice
    const invoiceRes = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: 10,
        price_currency: "usd",
        order_id: site_id,
        order_description: "Custom Domain Add-on for Degen Tools",
        success_url: `${req.headers.get("origin") || ""}/builder?id=${site_id}&payment=success`,
        cancel_url: `${req.headers.get("origin") || ""}/builder?id=${site_id}&payment=cancelled`,
      }),
    });

    const invoiceData = await invoiceRes.json();

    if (!invoiceRes.ok) {
      console.error(`NOWPayments API error [${invoiceRes.status}]`);
      throw new Error("Payment provider error. Please try again.");
    }

    // Store payment ID
    await supabase
      .from("sites")
      .update({
        domain_payment_status: "pending",
        domain_payment_id: invoiceData.id?.toString(),
      })
      .eq("id", site_id);

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
    console.error("Error creating payment:", error);
    return new Response(JSON.stringify({ error: "Payment creation failed. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
