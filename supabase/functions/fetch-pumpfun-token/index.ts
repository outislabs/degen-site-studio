import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Chain → Etherscan-compatible API base URLs (free tier, no key needed for basic endpoints)
const etherscanApis: Record<string, string> = {
  ethereum: 'https://api.etherscan.io/api',
  bsc: 'https://api.bscscan.com/api',
  base: 'https://api.basescan.org/api',
  arbitrum: 'https://api.arbiscan.io/api',
  polygon: 'https://api.polygonscan.com/api',
  optimism: 'https://api-optimistic.etherscan.io/api',
  avalanche: 'https://api.snowscan.xyz/api',
};

// GoPlus chain IDs
const goplusChainIds: Record<string, string> = {
  ethereum: '1',
  bsc: '56',
  polygon: '137',
  arbitrum: '42161',
  optimism: '10',
  avalanche: '43114',
  base: '8453',
  solana: 'solana',
};

function buildResult(data: {
  name?: string; symbol?: string; description?: string; image_uri?: string;
  mint?: string; chain?: string; market_cap?: number; total_supply?: number;
  website?: string; twitter?: string; telegram?: string; security?: any;
}) {
  return {
    name: data.name || '',
    symbol: data.symbol || '',
    description: data.description || '',
    image_uri: data.image_uri || '',
    mint: data.mint || '',
    chain: data.chain || '',
    market_cap: data.market_cap || 0,
    usd_market_cap: data.market_cap || 0,
    total_supply: data.total_supply || 0,
    website: data.website || '',
    twitter: data.twitter || '',
    telegram: data.telegram || '',
    complete: false,
    security: data.security || null,
  };
}

async function fetchGoPlus(chain: string, address: string) {
  const chainId = goplusChainIds[chain];
  if (!chainId) return null;
  try {
    // Use alternative GoPlus endpoint that works with Deno's TLS
    const baseUrl = 'https://openapi.gopluslabs.com';
    const url = chainId === 'solana'
      ? `${baseUrl}/api/v1/solana/token_security?contract_addresses=${address}`
      : `${baseUrl}/api/v1/token_security/${chainId}?contract_addresses=${address}`;
    console.log('GoPlus URL:', url);
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const tokenInfo = data?.result?.[address.toLowerCase()] || data?.result?.[address];
    if (!tokenInfo) return null;
    return {
      is_honeypot: tokenInfo.is_honeypot === '1',
      is_open_source: tokenInfo.is_open_source === '1',
      is_proxy: tokenInfo.is_proxy === '1',
      buy_tax: tokenInfo.buy_tax || '0',
      sell_tax: tokenInfo.sell_tax || '0',
      holder_count: parseInt(tokenInfo.holder_count || '0'),
      total_supply: tokenInfo.total_supply || '0',
      token_name: tokenInfo.token_name || '',
      token_symbol: tokenInfo.token_symbol || '',
      owner_address: tokenInfo.owner_address || '',
      creator_address: tokenInfo.creator_address || '',
      is_mintable: tokenInfo.is_mintable === '1',
      can_take_back_ownership: tokenInfo.can_take_back_ownership === '1',
      is_blacklisted: tokenInfo.is_blacklisted === '1',
    };
  } catch (e) {
    console.error('GoPlus error:', e);
    return null;
  }
}

async function fetchFromPumpFun(mint: string) {
  try {
    const res = await fetch(`https://frontend-api-v3.pump.fun/coins/${mint}?sync=true`, {
      headers: { 'Accept': 'application/json', 'Origin': 'https://pump.fun', 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.name) return null;
    return {
      name: d.name, symbol: d.symbol, description: d.description || '',
      image_uri: d.image_uri || d.uri || '', mint: d.mint || mint,
      chain: 'solana', market_cap: d.usd_market_cap || d.market_cap || 0,
      total_supply: d.total_supply || 0, website: d.website || '',
      twitter: d.twitter || '', telegram: d.telegram || '',
    };
  } catch { return null; }
}

async function fetchFromDexScreener(chain: string, mint: string) {
  try {
    const res = await fetch(`https://api.dexscreener.com/tokens/v1/${chain}/${mint}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const dexData = await res.json();
    const pair = Array.isArray(dexData) ? dexData[0] : dexData?.pairs?.[0] || dexData[0];
    if (!pair) return null;
    const baseToken = pair.baseToken || {};
    const info = pair.info || {};
    const socials = info.socials || [];
    return {
      name: baseToken.name || '', symbol: baseToken.symbol || '',
      description: '', image_uri: info.imageUrl || '',
      mint: baseToken.address || mint, chain: pair.chainId || chain,
      market_cap: pair.marketCap || 0, total_supply: 0,
      website: info.websites?.[0]?.url || '',
      twitter: socials.find((s: any) => s.type === 'twitter')?.url || '',
      telegram: socials.find((s: any) => s.type === 'telegram')?.url || '',
    };
  } catch { return null; }
}

async function fetchFromEtherscan(chain: string, mint: string) {
  const apiBase = etherscanApis[chain];
  if (!apiBase) return null;
  try {
    // Fetch token info via supply endpoint (no key needed for basic calls)
    const supplyRes = await fetch(`${apiBase}?module=stats&action=tokensupply&contractaddress=${mint}`);
    if (!supplyRes.ok) return null;
    const supplyData = await supplyRes.json();
    const totalSupply = supplyData?.result || '0';

    // Fetch contract source to get token name (ABI contains it)
    const srcRes = await fetch(`${apiBase}?module=contract&action=getsourcecode&address=${mint}`);
    let contractName = '';
    if (srcRes.ok) {
      const srcData = await srcRes.json();
      contractName = srcData?.result?.[0]?.ContractName || '';
    }

    if (!contractName && totalSupply === '0') return null;

    return {
      name: contractName, symbol: '', description: '',
      image_uri: '', mint, chain, market_cap: 0,
      total_supply: parseFloat(totalSupply) || 0,
      website: '', twitter: '', telegram: '',
    };
  } catch { return null; }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mint, chain = 'solana' } = await req.json();

    if (!mint || typeof mint !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid mint address' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanMint = mint.trim();
    const isSolana = chain === 'solana';
    let tokenData = null;

    // 1. Pump.fun (Solana only)
    if (isSolana) {
      tokenData = await fetchFromPumpFun(cleanMint);
      if (tokenData) {
        const security = await fetchGoPlus('solana', cleanMint);
        return new Response(JSON.stringify(buildResult({ ...tokenData, security })), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. DexScreener (all chains)
    tokenData = await fetchFromDexScreener(chain, cleanMint);
    if (tokenData) {
      const security = await fetchGoPlus(chain, cleanMint);
      return new Response(JSON.stringify(buildResult({ ...tokenData, security })), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Etherscan-compatible explorers (EVM chains)
    if (!isSolana) {
      tokenData = await fetchFromEtherscan(chain, cleanMint);
      if (tokenData) {
        const security = await fetchGoPlus(chain, cleanMint);
        // Enrich with GoPlus token name/symbol if etherscan didn't provide it
        if (security && !tokenData.name && security.token_name) {
          tokenData.name = security.token_name;
        }
        if (security && !tokenData.symbol && security.token_symbol) {
          tokenData.symbol = security.token_symbol;
        }
        return new Response(JSON.stringify(buildResult({ ...tokenData, security })), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 4. GoPlus alone as last resort (EVM)
      const security = await fetchGoPlus(chain, cleanMint);
      if (security?.token_name) {
        return new Response(JSON.stringify(buildResult({
          name: security.token_name, symbol: security.token_symbol,
          mint: cleanMint, chain,
          total_supply: parseFloat(security.total_supply) || 0,
          security,
        })), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Token not found on any platform' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching token:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
