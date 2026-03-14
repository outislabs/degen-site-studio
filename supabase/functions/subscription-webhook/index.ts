import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-nowpayments-sig",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Subscription webhook received:", JSON.stringify(body));

    const { payment_status, order_id, payment_id } = body;

    if (!order_id || !order_id.startsWith("sub_")) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse order_id: sub_{userId}_{plan}_{timestamp}
    const parts = order_id.split("_");
    if (parts.length < 4) {
      return new Response(JSON.stringify({ error: "Invalid order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = parts[1];
    const plan = parts[2];

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
          .update({ plan: "free", status: "active", payment_id: null })
          .eq("user_id", userId);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
