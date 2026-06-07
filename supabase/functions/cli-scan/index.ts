import { verifyAnyToken } from "../_shared/cliJWT.ts";
import { scanSolanaToken, scanEVMToken, computeSafetyScore } from "../_shared/scanner.ts";

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

// Map sniper-security-scan's "rug" level to CLI's "critical"
function toRiskLevel(level: string): "low" | "medium" | "high" | "critical" {
  if (level === "rug") return "critical";
  if (level === "low" || level === "medium" || level === "high") return level;
  return "critical";
}

function buildChecks(security: any): { label: string; passed: boolean; note?: string }[] {
  return [
    { label: "Honeypot", passed: !security.is_honeypot },
    { label: "Mintable", passed: !security.is_mintable },
    { label: "Ownership renounced", passed: !!security.contract_renounced },
    {
      label: "LP locked",
      passed: !!security.lp_locked,
      note: security.lp_locked ? `${security.lp_lock_pct.toFixed(1)}%` : undefined,
    },
    {
      label: "Sell tax",
      passed: security.sell_tax < 10,
      note: `${security.sell_tax}%`,
    },
    {
      label: "Buy tax",
      passed: security.buy_tax < 10,
      note: `${security.buy_tax}%`,
    },
    {
      label: "Dev holdings",
      passed: security.dev_holding_pct < 10,
      note: `${security.dev_holding_pct.toFixed(1)}%`,
    },
    { label: "Proxy contract", passed: !security.is_proxy },
    { label: "No ownership takeback", passed: !security.can_take_back_ownership },
  ];
}

async function fetchDexScreener(
  ca: string,
  chain: string,
): Promise<{ name?: string; symbol?: string; liquidity?: number } | null> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${ca}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pairs: any[] = data.pairs ?? [];

    // Map chain param to DexScreener chainId
    const chainMap: Record<string, string> = { solana: "solana", bnb: "bsc", bsc: "bsc" };
    const dexChain = chainMap[chain.toLowerCase()] ?? chain.toLowerCase();

    const pair = pairs
      .filter((p) => p.chainId?.toLowerCase() === dexChain)
      .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0] ?? pairs[0];

    if (!pair) return null;
    return {
      name: pair.baseToken?.name,
      symbol: pair.baseToken?.symbol,
      liquidity: pair.liquidity?.usd ?? undefined,
    };
  } catch (e) {
    console.error("DexScreener fetch error:", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  try {
    const cliUser = await verifyAnyToken(req);
    if (!cliUser) return json({ error: "Unauthorized" }, 401);

    const url = new URL(req.url);
    const ca = url.searchParams.get("ca");
    const chain = url.searchParams.get("chain");

    if (!ca) return json({ error: "Missing query param: ca" }, 400);
    if (!chain) return json({ error: "Missing query param: chain" }, 400);

    const normalizedChain = chain.toLowerCase();
    if (!["solana", "bnb", "bsc", "ethereum", "base"].includes(normalizedChain))
      return json({ error: "Unsupported chain. Use: solana, bnb, ethereum, base" }, 400);

    // Run security scan and DexScreener lookup in parallel
    const [security, dex] = await Promise.all([
      normalizedChain === "solana"
        ? scanSolanaToken(ca)
        : scanEVMToken(ca, normalizedChain),
      fetchDexScreener(ca, normalizedChain),
    ]);

    if (!security) {
      return json(
        { error: "Could not fetch security data. The token may not exist or the data source is unavailable." },
        404,
      );
    }

    const { score, level } = computeSafetyScore(security);

    return json({
      ca,
      chain: normalizedChain,
      name: dex?.name,
      symbol: dex?.symbol,
      score,
      riskLevel: toRiskLevel(level),
      checks: buildChecks(security),
      liquidity: dex?.liquidity,
      holders: security.holder_count || undefined,
    });

  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Rate limit exceeded")) {
      return json({ error: err.message }, 429);
    }
    console.error("cli-scan error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
