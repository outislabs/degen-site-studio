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
    const { mint } = await req.json();

    if (!mint || typeof mint !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid mint address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clean the mint address
    const cleanMint = mint.trim();

    // Fetch from pump.fun frontend API
    const response = await fetch(`https://frontend-api-v3.pump.fun/coins/${cleanMint}?sync=true`, {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://pump.fun',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Pump.fun API error [${response.status}]: ${text}`);
      return new Response(JSON.stringify({ error: `Token not found or API error (${response.status})` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tokenData = await response.json();

    // Extract relevant fields
    const result = {
      name: tokenData.name || '',
      symbol: tokenData.symbol || '',
      description: tokenData.description || '',
      image_uri: tokenData.image_uri || tokenData.uri || '',
      mint: tokenData.mint || cleanMint,
      market_cap: tokenData.market_cap || 0,
      usd_market_cap: tokenData.usd_market_cap || 0,
      total_supply: tokenData.total_supply || 0,
      website: tokenData.website || '',
      twitter: tokenData.twitter || '',
      telegram: tokenData.telegram || '',
      bonding_curve: tokenData.bonding_curve || '',
      raydium_pool: tokenData.raydium_pool || '',
      complete: tokenData.complete || false,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
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
