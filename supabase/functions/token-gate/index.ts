import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const DEGENTOOLS_MINT = "DyTPvbT4AAP7s8LBGmAcmU98UVJDqxRAKnZgoXkHBAGS";
const REQUIRED_BALANCE = 15_000_000; // 15M tokens
const DEGEN_PLAN = "degen";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get user from JWT
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const { action } = await req.json();

    // ── CHECK BALANCE ──
    if (action === "check") {
      const { wallet_address } = await req.json().catch(() => ({}));

      // Get wallet from body or user metadata
      const wallet = wallet_address || user.user_metadata?.wallet_address;
      if (!wallet) {
        return json({ error: "No wallet address. Connect your wallet first." }, 400);
      }

      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
        return json({ error: "Invalid Solana wallet address" }, 400);
      }

      const heliusRpc = Deno.env.get("HELIUS_RPC");
      if (!heliusRpc) {
        return json({ error: "RPC not configured" }, 500);
      }

      // Fetch token accounts for this wallet
      let balance = 0;
      try {
        const res = await fetch(heliusRpc, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "token-gate",
            method: "getTokenAccountsByOwner",
            params: [
              wallet,
              { mint: DEGENTOOLS_MINT },
              { encoding: "jsonParsed" },
            ],
          }),
        });

        const data = await res.json();
        const accounts = data.result?.value || [];

        for (const account of accounts) {
          const parsed = account.account?.data?.parsed?.info;
          if (parsed?.mint === DEGENTOOLS_MINT) {
            const amount = parsed.tokenAmount?.uiAmount || 0;
            balance += amount;
          }
        }
      } catch (e) {
        console.error("Helius RPC error:", e);
        return json({ error: "Failed to check token balance" }, 500);
      }

      const eligible = balance >= REQUIRED_BALANCE;

      return json({
        success: true,
        wallet,
        balance,
        required: REQUIRED_BALANCE,
        eligible,
        message: eligible
          ? `You hold ${balance.toLocaleString()} $DEGENTOOLS — eligible for free Degen plan!`
          : `You hold ${balance.toLocaleString()} $DEGENTOOLS — need ${REQUIRED_BALANCE.toLocaleString()} for free Degen plan.`,
      });
    }

    // ── CLAIM UPGRADE ──
    if (action === "claim") {
      const body = await req.json().catch(() => ({}));
      const wallet = body.wallet_address || user.user_metadata?.wallet_address;

      if (!wallet) {
        return json({ error: "No wallet address" }, 400);
      }

      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
        return json({ error: "Invalid wallet address" }, 400);
      }

      const heliusRpc = Deno.env.get("HELIUS_RPC");
      if (!heliusRpc) {
        return json({ error: "RPC not configured" }, 500);
      }

      // Verify balance on-chain (don't trust client)
      let balance = 0;
      try {
        const res = await fetch(heliusRpc, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "token-gate-claim",
            method: "getTokenAccountsByOwner",
            params: [
              wallet,
              { mint: DEGENTOOLS_MINT },
              { encoding: "jsonParsed" },
            ],
          }),
        });

        const data = await res.json();
        const accounts = data.result?.value || [];

        for (const account of accounts) {
          const parsed = account.account?.data?.parsed?.info;
          if (parsed?.mint === DEGENTOOLS_MINT) {
            balance += parsed.tokenAmount?.uiAmount || 0;
          }
        }
      } catch (e) {
        console.error("Helius RPC error:", e);
        return json({ error: "Failed to verify token balance" }, 500);
      }

      if (balance < REQUIRED_BALANCE) {
        return json({
          error: `Insufficient balance. You hold ${balance.toLocaleString()} but need ${REQUIRED_BALANCE.toLocaleString()} $DEGENTOOLS.`,
          balance,
          required: REQUIRED_BALANCE,
        }, 400);
      }

      // Check if user already has an active paid subscription
      const { data: existingSub } = await supabase
        .from("user_subscriptions")
        .select("plan, status, token_gated")
        .eq("user_id", user.id)
        .single();

      // Don't downgrade if they're on a higher plan via payment
      if (existingSub && !existingSub.token_gated) {
        const paidPlanRank: Record<string, number> = {
          free: 0, degen: 1, creator: 2, whale: 3,
        };
        if ((paidPlanRank[existingSub.plan] || 0) >= (paidPlanRank[DEGEN_PLAN] || 0) && existingSub.status === "active") {
          return json({
            success: true,
            message: `You're already on the ${existingSub.plan} plan via subscription. No change needed.`,
            already_upgraded: true,
          });
        }
      }

      // Upsert subscription to Degen plan
      const { error: subError } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          plan: DEGEN_PLAN,
          status: "active",
          token_gated: true,
          token_gate_wallet: wallet,
          token_gate_last_check: new Date().toISOString(),
          current_period_end: null, // no expiry for token-gated
        }, { onConflict: "user_id" });

      if (subError) {
        console.error("Subscription upsert error:", subError);
        return json({ error: "Failed to upgrade subscription" }, 500);
      }

      return json({
        success: true,
        message: `Upgraded to Degen plan! You hold ${balance.toLocaleString()} $DEGENTOOLS.`,
        plan: DEGEN_PLAN,
        balance,
      });
    }

    // ── REVALIDATE (for cron or periodic check) ──
    if (action === "revalidate") {
      // Only callable by service role / admin
      const { data: tokenGatedUsers } = await supabase
        .from("user_subscriptions")
        .select("user_id, token_gate_wallet")
        .eq("token_gated", true)
        .eq("status", "active");

      if (!tokenGatedUsers || tokenGatedUsers.length === 0) {
        return json({ success: true, checked: 0 });
      }

      const heliusRpc = Deno.env.get("HELIUS_RPC");
      let downgraded = 0;

      for (const sub of tokenGatedUsers) {
        if (!sub.token_gate_wallet) continue;

        try {
          const res = await fetch(heliusRpc!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: `revalidate-${sub.user_id}`,
              method: "getTokenAccountsByOwner",
              params: [
                sub.token_gate_wallet,
                { mint: DEGENTOOLS_MINT },
                { encoding: "jsonParsed" },
              ],
            }),
          });

          const data = await res.json();
          let balance = 0;
          for (const account of (data.result?.value || [])) {
            const parsed = account.account?.data?.parsed?.info;
            if (parsed?.mint === DEGENTOOLS_MINT) {
              balance += parsed.tokenAmount?.uiAmount || 0;
            }
          }

          if (balance < REQUIRED_BALANCE) {
            await supabase
              .from("user_subscriptions")
              .update({
                plan: "free",
                status: "active",
                token_gated: false,
                token_gate_last_check: new Date().toISOString(),
              })
              .eq("user_id", sub.user_id);
            downgraded++;
          } else {
            await supabase
              .from("user_subscriptions")
              .update({ token_gate_last_check: new Date().toISOString() })
              .eq("user_id", sub.user_id);
          }
        } catch (e) {
          console.error(`Revalidate error for ${sub.user_id}:`, e);
        }
      }

      return json({ success: true, checked: tokenGatedUsers.length, downgraded });
    }

    return json({ error: "Invalid action. Use: check, claim, revalidate" }, 400);
  } catch (error) {
    console.error("Token gate error:", error);
    return json({ error: "Internal error" }, 500);
  }
});
