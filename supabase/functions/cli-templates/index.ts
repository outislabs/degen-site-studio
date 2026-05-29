// Source of truth: src/components/admin/TemplatesTab.tsx (ALL_TEMPLATES constant)
// Category derived from slug: nft-* → "nft", everything else → "memecoin"

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

const TEMPLATES = [
  // Memecoin (15)
  { slug: "classic",        name: "Classic" },
  { slug: "split-hero",     name: "Split Hero" },
  { slug: "bento",          name: "Bento Grid" },
  { slug: "minimal",        name: "Minimal" },
  { slug: "mascot-hero",    name: "Mascot Hero" },
  { slug: "cinematic",      name: "Cinematic" },
  { slug: "cartoon",        name: "Cartoon" },
  { slug: "cartoon-sky",    name: "Cartoon Sky" },
  { slug: "comic-hero",     name: "Comic Hero" },
  { slug: "terminal",       name: "Terminal" },
  { slug: "neon-cyberpunk", name: "Neon Cyberpunk" },
  { slug: "luxury",         name: "Luxury" },
  { slug: "retro-8bit",     name: "Retro 8-Bit" },
  { slug: "newspaper",      name: "Newspaper" },
  { slug: "minimalist",     name: "Minimalist" },
  // NFT (10)
  { slug: "nft-dark",           name: "NFT Dark" },
  { slug: "nft-gallery",        name: "NFT Gallery" },
  { slug: "nft-comic",          name: "NFT Comic" },
  { slug: "nft-retro-pop",      name: "NFT Retro Pop" },
  { slug: "nft-minimal-gallery", name: "NFT Minimal Gallery" },
  { slug: "nft-streetwear",     name: "NFT Streetwear" },
  { slug: "nft-gallery-wall",   name: "NFT Gallery Wall" },
  { slug: "nft-anime",          name: "NFT Anime" },
  { slug: "nft-blueprint",      name: "NFT Blueprint" },
  { slug: "nft-luxury",         name: "NFT Luxury Editorial" },
].map((t) => ({
  slug: t.slug,
  name: t.name,
  category: t.slug.startsWith("nft-") ? "nft" : "memecoin",
}));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  return json(TEMPLATES);
});
