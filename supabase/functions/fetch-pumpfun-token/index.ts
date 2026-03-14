import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mint, chain = 'solana' } = await req.json();

    if (!mint || typeof mint !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid mint address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanMint = mint.trim();
    const isSolana = chain === 'solana';

    // Try pump.fun API first (Solana only)
    let tokenData = null;
    if (isSolana) {
      const pumpResponse = await fetch(`https://frontend-api-v3.pump.fun/coins/${cleanMint}?sync=true`, {
        headers: {
          'Accept': 'application/json',
          'Origin': 'https://pump.fun',
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (pumpResponse.ok) {
        tokenData = await pumpResponse.json();
        if (tokenData?.name) {
          const result = {
            name: tokenData.name || '',
            symbol: tokenData.symbol || '',
            description: tokenData.description || '',
            image_uri: tokenData.image_uri || tokenData.uri || '',
            mint: tokenData.mint || cleanMint,
            chain: 'solana',
            market_cap: tokenData.market_cap || 0,
            usd_market_cap: tokenData.usd_market_cap || 0,
            total_supply: tokenData.total_supply || 0,
            website: tokenData.website || '',
            twitter: tokenData.twitter || '',
            telegram: tokenData.telegram || '',
            complete: tokenData.complete || false,
          };
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // DexScreener API — supports all chains
    const dexChain = chain === 'bsc' ? 'bsc' : chain;
    console.log(`Trying DexScreener for ${dexChain}/${cleanMint}...`);
    const dexResponse = await fetch(`https://api.dexscreener.com/tokens/v1/${dexChain}/${cleanMint}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (dexResponse.ok) {
      const dexData = await dexResponse.json();
      const pair = Array.isArray(dexData) ? dexData[0] : dexData?.pairs?.[0] || dexData[0];
      if (pair) {
        const baseToken = pair.baseToken || {};
        const info = pair.info || {};
        const socials = info.socials || [];
        const twitter = socials.find((s: any) => s.type === 'twitter')?.url || '';
        const telegram = socials.find((s: any) => s.type === 'telegram')?.url || '';

        const result = {
          name: baseToken.name || '',
          symbol: baseToken.symbol || '',
          description: '',
          image_uri: info.imageUrl || '',
          mint: baseToken.address || cleanMint,
          chain: pair.chainId || chain,
          market_cap: pair.marketCap || 0,
          usd_market_cap: pair.marketCap || 0,
          total_supply: 0,
          website: info.websites?.[0]?.url || '',
          twitter,
          telegram,
          complete: false,
        };
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Token not found on any platform' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching pump.fun token:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
