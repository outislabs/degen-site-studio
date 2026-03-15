const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

function extractMintAndChain(input: string): { mint: string; chain: string; isPair: boolean } | null {
  const trimmed = input.trim();

  const pumpFunMatch = trimmed.match(/pump\.fun\/(?:coin\/)?([A-Za-z0-9]{32,})/);
  if (pumpFunMatch) return { mint: pumpFunMatch[1], chain: 'solana', isPair: false };

  const dexScreenerMatch = trimmed.match(/dexscreener\.com\/([a-z]+)\/([A-Za-z0-9]{32,})/);
  if (dexScreenerMatch) {
    const chain = VALID_CHAINS.includes(dexScreenerMatch[1]) ? dexScreenerMatch[1] : 'solana';
    return { mint: dexScreenerMatch[2], chain, isPair: true };
  }

  if (/^0x[A-Fa-f0-9]{40}$/.test(trimmed)) return { mint: trimmed, chain: 'ethereum', isPair: false };
  if (/^[A-Za-z0-9]{32,50}$/.test(trimmed)) return { mint: trimmed, chain: 'solana', isPair: false };

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
    const text = await res.text();
    if (!text || text.trim().length === 0) return null;
    let d: any;
    try { d = JSON.parse(text); } catch { return null; }
    if (!d?.name) return null;
    return {
      name: d.name, symbol: d.symbol, description: d.description || '',
      image_uri: d.image_uri || d.uri || '', mint: d.mint || mint,
      chain: 'solana', market_cap: d.usd_market_cap || d.market_cap || 0,
      total_supply: d.total_supply || 0, website: d.website || '',
      twitter: d.twitter || '', telegram: d.telegram || '',
    };
  } catch (e) {
    console.error('fetchFromPumpFun error:', e);
    return null;
  }
}

async function fetchFromDexScreener(chain: string, mint: string, isPair = false) {
  try {
    // Use pairs endpoint for DexScreener URLs, tokens endpoint for contract addresses
    const url = isPair
      ? `https://api.dexscreener.com/latest/dex/pairs/${encodeURIComponent(chain)}/${encodeURIComponent(mint)}`
      : `https://api.dexscreener.com/tokens/v1/${encodeURIComponent(chain)}/${encodeURIComponent(mint)}`;

    console.log('DexScreener URL:', url);

    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) { await res.text(); return null; }
    const text = await res.text();
    if (!text || text.trim().length === 0) return null;
    let dexData: any;
    try { dexData = JSON.parse(text); } catch { return null; }

    const pair = isPair
      ? (dexData?.pair || dexData?.pairs?.[0])
      : (Array.isArray(dexData) ? dexData[0] : dexData?.pairs?.[0] || dexData[0]);

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
  } catch (e) {
    console.error('fetchFromDexScreener error:', e);
    return null;
  }
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
  } catch (e) {
    console.error('fetchFromEtherscan error:', e);
    return null;
  }
}

Deno.serve(async (req) => {
  console.log('fetch-pumpfun-token called:', req.method);

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
    console.log('Request body:', JSON.stringify(body));

    const rawInput = (body.mint as string)?.trim() || (body.input as string)?.trim();
    const chainOverride = (body.chain as string)?.trim();

    console.log('rawInput:', rawInput, 'chainOverride:', chainOverride);

    if (!rawInput || rawInput.length === 0) {
      return new Response(JSON.stringify({ error: "Missing mint address, contract address, or URL" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let cleanMint = rawInput;
    let detectedChain = chainOverride || 'solana';
    let isPairAddress = false;

    if (rawInput.includes('.')) {
      const extracted = extractMintAndChain(rawInput);
      if (!extracted) {
        return new Response(JSON.stringify({ error: "Invalid URL. Paste a pump.fun URL, dexscreener URL, or contract address." }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      cleanMint = extracted.mint;
      detectedChain = chainOverride || extracted.chain;
      isPairAddress = extracted.isPair;
    } else {
      if (/^0x[A-Fa-f0-9]{40}$/.test(rawInput)) {
        detectedChain = chainOverride || 'ethereum';
      } else {
        detectedChain = chainOverride || 'solana';
      }
    }

    console.log('cleanMint:', cleanMint, 'detectedChain:', detectedChain, 'isPairAddress:', isPairAddress);

    const chain = detectedChain;
    const isSolana = chain === 'solana';
    let tokenData = null;

    // 1. Pump.fun (Solana only, not for pair addresses)
    if (isSolana && !isPairAddress) {
      console.log('Trying pump.fun...');
      tokenData = await fetchFromPumpFun(cleanMint);
      if (tokenData) {
        console.log('Found on pump.fun:', tokenData.name);
        return new Response(JSON.stringify(buildResult(tokenData)), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. DexScreener — pass isPairAddress flag
    console.log('Trying DexScreener isPair:', isPairAddress);
    tokenData = await fetchFromDexScreener(chain, cleanMint, isPairAddress);
    if (tokenData) {
      console.log('Found on DexScreener:', tokenData.name);
      return new Response(JSON.stringify(buildResult(tokenData)), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2b. Try other EVM chains via DexScreener
    if (!isSolana && cleanMint.startsWith('0x')) {
      const evmChains = ['ethereum', 'base', 'bsc', 'arbitrum', 'polygon', 'optimism', 'avalanche'].filter(c => c !== chain);
      for (const tryChain of evmChains) {
        tokenData = await fetchFromDexScreener(tryChain, cleanMint, false);
        if (tokenData) {
          console.log('Found on DexScreener chain:', tryChain, tokenData.name);
          return new Response(JSON.stringify(buildResult(tokenData)), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // 3. Etherscan-compatible explorers
    if (!isSolana) {
      console.log('Trying Etherscan...');
      tokenData = await fetchFromEtherscan(chain, cleanMint);
      if (tokenData) {
        console.log('Found on Etherscan:', tokenData.name);
        return new Response(JSON.stringify(buildResult(tokenData)), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Token not found anywhere for:', cleanMint);
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
