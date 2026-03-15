const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// --- Rate Limiting ---
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

const VALID_CHAINS = ["solana", "ethereum", "base", "bsc", "arbitrum", "polygon", "optimism", "avalanche", "ton"];

// --- Extract mint address from URL or raw address ---
function extractMintAndChain(input: string): { mint: string; chain: string } | null {
  const trimmed = input.trim();

  // Pump.fun URL: https://pump.fun/coin/MINTADDRESS
  const pumpFunMatch = trimmed.match(/pump\.fun\/(?:coin\/)?([A-Za-z0-9]{32,})/);
  if (pumpFunMatch) {
    return { mint: pumpFunMatch[1], chain: 'solana' };
  }

  // DexScreener URL: https://dexscreener.com/solana/MINTADDRESS
  const dexScreenerMatch = trimmed.match(/dexscreener\.com\/([a-z]+)\/([A-Za-z0-9]{32,})/);
  if (dexScreenerMatch) {
    const chain = VALID_CHAINS.includes(dexScreenerMatch[1]) ? dexScreenerMatch[1] : 'solana';
    return { mint: dexScreenerMatch[2], chain };
  }

  // Raw Solana address (base58, 32-44 chars)
  if (/^[A-Za-z0-9]{32,44}$/.test(trimmed)) {
    return { mint: trimmed, chain: 'solana' };
  }

  // Raw EVM address (0x...)
  if (/^0x[A-Fa-f0-9]{40}$/.test(trimmed)) {
    return { mint: trimmed, chain: 'ethereum' };
  }

  return null;
}

const etherscanApis: Record<string, string> = {
  ethereum: 'https://api.etherscan.io/api',
  bsc: 'https://api.bscscan.com/api',
  base: 'https://api.basescan.org/api',
  arbitrum: 'https://api.arbiscan.io/api',
  polygon: 'https://api.polygonscan.com/api',
  optimism: 'https://api-optimistic.etherscan.io/api',
  avalanche: 'https://api.snowscan.xyz/api',
};

function buildResult(data: {
  name?: string; symbol?: string; description?: string; image_uri?: string;
  mint?: string; chain?: string; market_cap?: number; total_supply?: number;
  website?: string; twitter?: string; telegram?: string;
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
  };
}

async function fetchFromPumpFun(mint: string) {
  try {
    const res = await fetch(`https://frontend-api-v3.pump.fun/coins/${encodeURIComponent(mint)}?sync=true`, {
      headers: { 'Accept': 'application/json', 'Origin': 'https://pump.fun', 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) { await res.text(); return null; }
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
    const res = await fetch(`https://api.dexscreener.com/tokens/v1/${encodeURIComponent(chain)}/${encodeURIComponent(mint)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) { await res.text(); return null; }
    const dexData = await res.json();
    const pair = Array.isArray(dexData) ? dexData[0] : dexData?.pairs?.[0] || dexData[0];
    if (!pair || !pair.baseToken?.name) return null;
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
    const supplyRes = await fetch(`${apiBase}?module=stats&action=tokensupply&contractaddress=${encodeURIComponent(mint)}`);
    if (!supplyRes.ok) { await supplyRes.text(); return null; }
    const supplyData = await supplyRes.json();
    const totalSupply = supplyData?.result || '0';

    const srcRes = await fetch(`${apiBase}?module=contract&action=getsourcecode&address=${encodeURIComponent(mint)}`);
    let contractName = '';
    if (srcRes.ok) {
      const srcData = await srcRes.json();
      contractName = srcData?.result?.[0]?.ContractName || '';
    } else {
      await srcRes.text();
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`ip:${clientIp}`)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait and try again." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
      });
    }

    const body = await req.json();
    const input = (body.mint as string)?.trim() || (body.input as string)?.trim();

    if (!input || input.length === 0) {
      return new Response(JSON.stringify({ error: "Missing mint address, contract address, or URL" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract mint and chain from URL or raw address
    const extracted = extractMintAndChain(input);
    if (!extracted) {
      return new Response(JSON.stringify({ error: "Invalid input. Paste a pump.fun URL, dexscreener URL, or contract address." }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { mint: cleanMint, chain: detectedChain } = extracted;
    const chain = (body.chain as string) || detectedChain;
    const isSolana = chain === 'solana';
    let tokenData = null;

    // 1. Pump.fun (Solana only)
    if (isSolana) {
      tokenData = await fetchFromPumpFun(cleanMint);
      if (tokenData) {
        return new Response(JSON.stringify(buildResult(tokenData)), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. DexScreener
    tokenData = await fetchFromDexScreener(chain, cleanMint);
    if (tokenData) {
      return new Response(JSON.stringify(buildResult(tokenData)), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2b. Try other EVM chains via DexScreener
    if (!isSolana && cleanMint.startsWith('0x')) {
      const evmChains = ['ethereum', 'base', 'bsc', 'arbitrum', 'polygon', 'optimism', 'avalanche'].filter(c => c !== chain);
      for (const tryChain of evmChains) {
        tokenData = await fetchFromDexScreener(tryChain, cleanMint);
        if (tokenData) {
          return new Response(JSON.stringify(buildResult(tokenData)), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // 3. Etherscan-compatible explorers
    if (!isSolana) {
      tokenData = await fetchFromEtherscan(chain, cleanMint);
      if (tokenData) {
        return new Response(JSON.stringify(buildResult(tokenData)), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Token not found. Try pasting the contract address directly.' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching token:', error);
    return new Response(JSON.stringify({ error: 'Internal error fetching token data.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
