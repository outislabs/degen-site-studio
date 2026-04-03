
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const DEXSCREENER_URL = "https://api.dexscreener.com/token-profiles/latest/v1";
const MIN_LIQUIDITY = 1000;
const MAX_AGE_HOURS = 1;

interface DexScreenerPair {
  chainId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  dexId: string;
  liquidity?: { usd?: number };
  volume?: { m5?: number; h1?: number; h24?: number };
  priceUsd?: string;
  marketCap?: number;
  priceChange?: { m5?: number; h1?: number; h24?: number };
  txns?: { m5?: { buys?: number; sells?: number } };
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    websites?: { url: string }[];
    socials?: { type: string; url: string }[];
  };
}

function normalizeChain(chainId: string): string {
  const map: Record<string, string> = {
    solana: "solana",
    base: "base",
    ethereum: "ethereum",
    bsc: "bsc",
  };
  return map[chainId.toLowerCase()] ?? chainId.toLowerCase();
}

function isRecent(pairCreatedAt?: number): boolean {
  if (!pairCreatedAt) return true;
  const ageMs = Date.now() - pairCreatedAt;
  return ageMs < MAX_AGE_HOURS * 60 * 60 * 1000;
}

Deno.serve(async () => {
  try {
    // Fetch latest token profiles from DexScreener
    const res = await fetch(DEXSCREENER_URL, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`DexScreener error: ${res.status}`);
    }

    const profiles = await res.json();

    // DexScreener token profiles gives us token addresses
    // Now fetch pair data for each
    const tokens = Array.isArray(profiles) ? profiles : [];
    
    // Filter to Solana and Base only for now
    const filtered = tokens.filter((t: any) =>
      ["solana", "base"].includes(t.chainId?.toLowerCase())
    );

    console.log(`Fetched ${filtered.length} token profiles`);

    // For each token, fetch pair data
    const results = await Promise.allSettled(
      filtered.slice(0, 20).map(async (profile: any) => {
        const pairRes = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${profile.tokenAddress}`,
          { headers: { Accept: "application/json" } }
        );

        if (!pairRes.ok) return null;
        const pairData = await pairRes.json();
        const pairs: DexScreenerPair[] = pairData.pairs ?? [];

        // Take the pair with highest liquidity
        const pair = pairs
          .filter((p) => (p.liquidity?.usd ?? 0) >= MIN_LIQUIDITY)
          .filter((p) => isRecent(p.pairCreatedAt))
          .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

        if (!pair) return null;

        const chain = normalizeChain(pair.chainId);
        const socials = pair.info?.socials ?? [];
        const twitter = socials.find((s) => s.type === "twitter")?.url;
        const telegram = socials.find((s) => s.type === "telegram")?.url;
        const website = pair.info?.websites?.[0]?.url;

        return {
          contract_address: pair.baseToken.address,
          chain,
          name: pair.baseToken.name,
          symbol: pair.baseToken.symbol,
          pair_address: pair.pairAddress,
          dex: pair.dexId,
          price_usd: pair.priceUsd ? parseFloat(pair.priceUsd) : null,
          liquidity_usd: pair.liquidity?.usd ?? null,
          market_cap: pair.marketCap ?? null,
          volume_5m: pair.volume?.m5 ?? null,
          volume_1h: pair.volume?.h1 ?? null,
          volume_24h: pair.volume?.h24 ?? null,
          price_change_5m: pair.priceChange?.m5 ?? null,
          price_change_1h: pair.priceChange?.h1 ?? null,
          price_change_24h: pair.priceChange?.h24 ?? null,
          buys_5m: pair.txns?.m5?.buys ?? null,
          sells_5m: pair.txns?.m5?.sells ?? null,
          logo_url: pair.info?.imageUrl ?? null,
          website: website ?? null,
          twitter: twitter ?? null,
          telegram: telegram ?? null,
          discovered_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        };
      })
    );

    const tokensToInsert = results
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    console.log(`Inserting ${tokensToInsert.length} tokens`);

    if (tokensToInsert.length > 0) {
      const { error } = await supabase
        .from("sniper_tokens")
        .upsert(tokensToInsert, {
          onConflict: "contract_address,chain",
          ignoreDuplicates: false,
        });

      if (error) {
        console.error("Upsert error:", error);
        throw error;
      }

      // Broadcast to Realtime
      await supabase.channel("sniper").send({
        type: "broadcast",
        event: "new_token",
        payload: { count: tokensToInsert.length },
      });
    }

    return new Response(
      JSON.stringify({ success: true, inserted: tokensToInsert.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sniper-discover error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
