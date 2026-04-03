import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function computeSafetyScore(security: any): { score: number; level: string } {
  let score = 100;

  if (security.is_honeypot) score -= 40;
  if (security.can_take_back_ownership) score -= 15;
  if (security.is_mintable) score -= 10;
  if (security.is_proxy) score -= 5;
  if (!security.lp_locked) score -= 15;
  else if (security.lp_lock_pct < 80) score -= 5;
  if (!security.contract_renounced) score -= 10;
  if (security.dev_holding_pct > 30) score -= 25;
  else if (security.dev_holding_pct > 20) score -= 15;
  else if (security.dev_holding_pct > 10) score -= 10;
  if (security.top_holder_pct > 50) score -= 10;
  if (security.sell_tax > 15) score -= 10;
  else if (security.sell_tax > 10) score -= 5;
  if (security.buy_tax > 10) score -= 5;
  if (security.holder_count < 20) score -= 5;

  score = Math.max(0, Math.min(100, score));

  let level: string;
  if (score >= 70) level = "low";
  else if (score >= 40) level = "medium";
  else if (score >= 20) level = "high";
  else level = "rug";

  return { score, level };
}

async function scanSolanaToken(address: string) {
  try {
    // GoPlus Solana
    const goplusRes = await fetch(
      `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${address}`
    );
    const goplusData = await goplusRes.json();
    const gp = goplusData?.result?.[address.toLowerCase()] ?? goplusData?.result?.[address] ?? null;

    // RugCheck
    const rugRes = await fetch(
      `https://api.rugcheck.xyz/v1/tokens/${address}/report`
    );
    const rugData = rugRes.ok ? await rugRes.json() : null;

    // Parse GoPlus data
    const topHolders = gp?.holders ?? [];
    const topHolderPct = topHolders
      .slice(0, 10)
      .reduce((sum: number, h: any) => sum + parseFloat(h.percent ?? "0"), 0) * 100;

    const devHoldingPct = parseFloat(gp?.creator_percent ?? "0") * 100;
    const lpLocked = rugData?.markets?.[0]?.lp?.lpLockedPct > 0 ?? false;
    const lpLockPct = rugData?.markets?.[0]?.lp?.lpLockedPct ?? 0;

    return {
      is_honeypot: gp?.honeypot === "1" || false,
      buy_tax: parseFloat(gp?.buy_tax ?? "0"),
      sell_tax: parseFloat(gp?.sell_tax ?? "0"),
      is_proxy: gp?.is_proxy === "1" || false,
      is_mintable: gp?.mintable === "1" || false,
      can_take_back_ownership: gp?.can_take_back_ownership === "1" || false,
      owner_address: gp?.owner_address ?? null,
      creator_address: gp?.creator_address ?? null,
      contract_renounced: gp?.owner_address === "" || gp?.owner_address === null,
      lp_locked: lpLocked,
      lp_lock_pct: lpLockPct,
      top_holder_pct: topHolderPct,
      dev_holding_pct: devHoldingPct,
      holder_count: parseInt(gp?.holder_count ?? "0"),
    };
  } catch (err) {
    console.error(`Error scanning ${address}:`, err);
    return null;
  }
}

async function scanEVMToken(address: string, chainId: string) {
  try {
    const chainMap: Record<string, string> = {
      base: "8453",
      ethereum: "1",
      bsc: "56",
    };
    const id = chainMap[chainId] ?? "1";

    const goplusRes = await fetch(
      `https://api.gopluslabs.io/api/v1/token_security/${id}?contract_addresses=${address}`
    );
    const goplusData = await goplusRes.json();
    const gp = goplusData?.result?.[address.toLowerCase()] ?? null;

    if (!gp) return null;

    const topHolders = gp?.holders ?? [];
    const topHolderPct = topHolders
      .slice(0, 10)
      .reduce((sum: number, h: any) => sum + parseFloat(h.percent ?? "0"), 0) * 100;

    const devHoldingPct = parseFloat(gp?.creator_percent ?? "0") * 100;
    const lpHolders = gp?.lp_holders ?? [];
    const lpLocked = lpHolders.some((h: any) => h.is_locked === 1);
    const lpLockPct = lpHolders
      .filter((h: any) => h.is_locked === 1)
      .reduce((sum: number, h: any) => sum + parseFloat(h.percent ?? "0"), 0) * 100;

    return {
      is_honeypot: gp?.is_honeypot === "1" || false,
      buy_tax: parseFloat(gp?.buy_tax ?? "0"),
      sell_tax: parseFloat(gp?.sell_tax ?? "0"),
      is_proxy: gp?.is_proxy === "1" || false,
      is_mintable: gp?.is_mintable === "1" || false,
      can_take_back_ownership: gp?.can_take_back_ownership === "1" || false,
      owner_address: gp?.owner_address ?? null,
      creator_address: gp?.creator_address ?? null,
      contract_renounced: gp?.owner_address === "" || gp?.renounced === "1",
      lp_locked: lpLocked,
      lp_lock_pct: lpLockPct,
      top_holder_pct: topHolderPct,
      dev_holding_pct: devHoldingPct,
      holder_count: parseInt(gp?.holder_count ?? "0"),
    };
  } catch (err) {
    console.error(`Error scanning EVM ${address}:`, err);
    return null;
  }
}

Deno.serve(async () => {
  try {
    // Fetch unscanned or stale tokens (no safety_score or last_updated > 5 min ago)
    const { data: tokens, error } = await supabase
      .from("sniper_tokens")
      .select("id, contract_address, chain")
      .or("safety_score.is.null,last_updated.lt." + new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .limit(20);

    if (error) throw error;
    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, scanned: 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Scanning ${tokens.length} tokens`);

    const results = await Promise.allSettled(
      tokens.map(async (token) => {
        const securityData = token.chain === "solana"
          ? await scanSolanaToken(token.contract_address)
          : await scanEVMToken(token.contract_address, token.chain);

        if (!securityData) return null;

        const { score, level } = computeSafetyScore(securityData);

        const update = {
          ...securityData,
          safety_score: score,
          risk_level: level,
          rug_probability: Math.max(0, (100 - score) / 100),
          last_updated: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from("sniper_tokens")
          .update(update)
          .eq("id", token.id);

        if (updateError) {
          console.error(`Update error for ${token.contract_address}:`, updateError);
          return null;
        }

        // Broadcast rug alert
        if (level === "rug") {
          await supabase.channel("sniper").send({
            type: "broadcast",
            event: "rug_alert",
            payload: { contract_address: token.contract_address, chain: token.chain, score },
          });
        }

        return { address: token.contract_address, score, level };
      })
    );

    const scanned = results.filter(
      (r) => r.status === "fulfilled" && r.value !== null
    ).length;

    return new Response(
      JSON.stringify({ success: true, scanned }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sniper-security-scan error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
