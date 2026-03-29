import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPrice(price: number): string {
  if (price < 0.000001) return `$${price.toExponential(2)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

function formatMarketCap(mc: number): string {
  if (mc >= 1_000_000_000) return `$${(mc / 1_000_000_000).toFixed(1)}B`;
  if (mc >= 1_000_000) return `$${(mc / 1_000_000).toFixed(1)}M`;
  if (mc >= 1_000) return `$${(mc / 1_000).toFixed(1)}K`;
  return `$${mc.toFixed(0)}`;
}

function generateSvg(
  tokenName: string,
  ticker: string,
  logoUrl: string | null,
  price: number | null,
  marketCap: number | null,
): string {
  const safeName = escapeHtml(tokenName || "Unknown Token");
  const safeTicker = escapeHtml(ticker ? `$${ticker.toUpperCase()}` : "");
  const priceText = price ? formatPrice(price) : "—";
  const mcText = marketCap ? formatMarketCap(marketCap) : "—";

  const logoSection = logoUrl
    ? `<image x="80" y="160" width="200" height="200" href="${escapeHtml(logoUrl)}" clip-path="url(#logoClip)" />`
    : `<rect x="80" y="160" width="200" height="200" rx="24" fill="#1a1a2e"/>
       <text x="180" y="275" font-family="Arial, sans-serif" font-size="64" fill="#4ade80" text-anchor="middle">?</text>`;

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="50%" stop-color="#0d1117"/>
      <stop offset="100%" stop-color="#0a0f0a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>
    <clipPath id="logoClip">
      <rect x="80" y="160" width="200" height="200" rx="24"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Subtle grid pattern -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff06" stroke-width="1"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Top accent line -->
  <rect x="0" y="0" width="1200" height="4" fill="url(#accent)"/>

  <!-- Logo -->
  ${logoSection}

  <!-- Token name -->
  <text x="320" y="230" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="56" fill="#ffffff">${safeName}</text>

  <!-- Ticker -->
  <text x="320" y="280" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#4ade80">${safeTicker}</text>

  <!-- Divider -->
  <line x1="320" y1="310" x2="800" y2="310" stroke="#ffffff15" stroke-width="1"/>

  <!-- Price section -->
  <text x="320" y="360" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#9ca3af">PRICE</text>
  <text x="320" y="400" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="40" fill="#ffffff">${priceText}</text>

  <!-- Market cap section -->
  <text x="620" y="360" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#9ca3af">MARKET CAP</text>
  <text x="620" y="400" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="40" fill="#ffffff">${mcText}</text>

  <!-- Bottom bar -->
  <rect x="0" y="530" width="1200" height="100" fill="#00000040"/>

  <!-- DegenTools branding -->
  <text x="80" y="585" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="24" fill="#4ade80">◻ DEGEN TOOLS</text>
  <text x="80" y="610" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#6b7280">degentools.co</text>

  <!-- CTA -->
  <text x="1120" y="590" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#9ca3af" text-anchor="end">Launch your meme coin ▸</text>
</svg>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const siteId = url.searchParams.get("site_id");

    if (!siteId) {
      return new Response("Missing site_id", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch site data
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, name, ticker, data")
      .eq("id", siteId)
      .single();

    if (siteError || !site) {
      return new Response("Site not found", { status: 404 });
    }

    const tokenName = site.name || site.data?.name || "Unknown Token";
    const ticker = site.ticker || site.data?.ticker || "";
    const logoUrl = site.data?.logoUrl || null;

    // Try to fetch token mint from bags_tokens
    let tokenMint: string | null = null;
    const { data: bagsToken } = await supabase
      .from("bags_tokens")
      .select("token_mint")
      .eq("site_id", siteId)
      .single();

    if (bagsToken?.token_mint) {
      tokenMint = bagsToken.token_mint;
    }

    // Fetch live price from Jupiter if we have a mint
    let price: number | null = null;
    let marketCap: number | null = null;

    if (tokenMint) {
      try {
        const jupRes = await fetch(
          `https://datapi.jup.ag/v1/assets/search?query=${tokenMint}`,
        );
        if (jupRes.ok) {
          const jupData = await jupRes.json();
          if (jupData?.results?.length > 0) {
            const token = jupData.results[0];
            price = token.price ?? null;
            marketCap = token.market_cap ?? null;
          }
        }
      } catch (e) {
        console.error("Jupiter fetch failed:", e);
        // Continue without price data
      }
    }

    const svg = generateSvg(tokenName, ticker, logoUrl, price, marketCap);

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("OG image error:", error);
    return new Response("Internal error", { status: 500 });
  }
});
