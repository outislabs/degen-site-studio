import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  try {
    // Fetch tokens updated more than 30 seconds ago
    const staleThreshold = new Date(Date.now() - 30 * 1000).toISOString();

    const { data: tokens, error } = await supabase
      .from("sniper_tokens")
      .select("id, contract_address, chain, pair_address")
      .lt("last_updated", staleThreshold)
      .limit(30);

    if (error) throw error;
    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, updated: 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Updating prices for ${tokens.length} tokens`);

    const results = await Promise.allSettled(
      tokens.map(async (token) => {
        try {
          const res = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${token.contract_address}`,
            { headers: { Accept: "application/json" } }
          );

          if (!res.ok) return null;

          const data = await res.json();
          const pairs = data.pairs ?? [];

          // Get best pair by liquidity
          const pair = pairs
            .sort((a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

          if (!pair) return null;

          const update = {
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
            last_updated: new Date().toISOString(),
          };

          const { error: updateError } = await supabase
            .from("sniper_tokens")
            .update(update)
            .eq("id", token.id);

          if (updateError) {
            console.error(`Price update error for ${token.contract_address}:`, updateError);
            return null;
          }

          return token.contract_address;
        } catch (err) {
          console.error(`Error updating ${token.contract_address}:`, err);
          return null;
        }
      })
    );

    const updated = results.filter(
      (r) => r.status === "fulfilled" && r.value !== null
    ).length;

    // Broadcast price update event
    await supabase.channel("sniper").send({
      type: "broadcast",
      event: "prices_updated",
      payload: { updated, timestamp: new Date().toISOString() },
    });

    return new Response(
      JSON.stringify({ success: true, updated }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sniper-update-prices error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
