import { createClient } from "npm:@supabase/supabase-js@2";

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

// The sniper_tokens table uses "bsc" internally; the CLI param uses "bnb"
const CHAIN_ALIAS: Record<string, string> = { bnb: "bsc" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  try {
    const url = new URL(req.url);
    const chainParam = url.searchParams.get("chain") ?? "all";
    const limitParam = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const limit = Math.min(Math.max(1, isNaN(limitParam) ? 20 : limitParam), 100);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let query = adminClient
      .from("sniper_tokens")
      .select("contract_address, chain, name, symbol, price_usd, price_change_24h, volume_24h, market_cap")
      .not("price_usd", "is", null)
      .gt("volume_24h", 0)
      .order("volume_24h", { ascending: false })
      .limit(limit);

    if (chainParam !== "all") {
      const dbChain = CHAIN_ALIAS[chainParam] ?? chainParam;
      query = query.eq("chain", dbChain);
    }

    const { data: tokens, error } = await query;
    if (error) throw new Error(error.message);

    const result = (tokens ?? []).map((t, i) => ({
      rank: i + 1,
      symbol: t.symbol ?? "",
      name: t.name ?? "",
      ca: t.contract_address,
      chain: t.chain,
      priceUsd: t.price_usd ?? 0,
      change24h: t.price_change_24h ?? 0,
      volume24h: t.volume_24h ?? 0,
      marketCap: t.market_cap ?? 0,
    }));

    return json(result);
  } catch (err) {
    console.error("cli-trending error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
