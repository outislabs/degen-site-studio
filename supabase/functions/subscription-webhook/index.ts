import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-nowpayments-sig, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Rate Limiting (IP-based for webhook) ---
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

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
const VALID_STATUSES = ["waiting", "confirming", "confirmed", "sending", "partially_paid", "finished", "failed", "refunded", "expired"];
const VALID_PLANS = ["starter", "degen", "creator", "pro", "whale"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`ip:${clientIp}`)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { payment_status, order_id, payment_id } = body;

    // Validate order_id format
    if (!order_id || typeof order_id !== "string" || !(order_id as string).startsWith("sub_")) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate payment_status
    if (!payment_status || typeof payment_status !== "string" || !VALID_STATUSES.includes(payment_status as string)) {
      return new Response(JSON.stringify({ error: "Invalid payment_status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse order_id: sub_{userId}_{plan}_{timestamp}
    const parts = (order_id as string).split("_");
    if (parts.length < 4) {
      return new Response(JSON.stringify({ error: "Invalid order_id format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = parts[1];
    const plan = parts[2];

    // Validate extracted plan
    if (!VALID_PLANS.includes(plan)) {
      return new Response(JSON.stringify({ error: "Invalid plan in order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate userId format (UUID)
    if (!/^[0-9a-f-]{36}$/.test(userId)) {
      return new Response(JSON.stringify({ error: "Invalid user ID in order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (
      payment_status === "finished" ||
      payment_status === "confirmed" ||
      payment_status === "sending" ||
      payment_status === "partially_paid"
    ) {
      await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: userId,
          plan: plan,
          status: "active",
          payment_id: payment_id?.toString(),
        }, { onConflict: 'user_id' });

      console.log(`Subscription activated: ${userId} -> ${plan}`);
    } else if (payment_status === "failed" || payment_status === "expired") {
      // Only revert if this payment_id matches
      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("payment_id, status")
        .eq("user_id", userId)
        .single();

      if (sub && sub.payment_id === payment_id?.toString() && sub.status === "pending") {
        await supabase
          .from("user_subscriptions")
          .update({ plan: "starter", status: "active", payment_id: null })
          .eq("user_id", userId);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
