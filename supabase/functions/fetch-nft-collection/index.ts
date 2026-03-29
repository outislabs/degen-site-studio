import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Extract collection address from various URL formats
function extractAddress(input: string): { address: string; source: string } | null {
  const trimmed = input.trim();

  // Magic Eden URL: https://magiceden.io/marketplace/SYMBOL or /collections/ADDRESS
  const meMarketplace = trimmed.match(/magiceden\.io\/marketplace\/([a-zA-Z0-9_-]+)/);
  if (meMarketplace) {
    return { address: meMarketplace[1], source: "magic_eden" };
  }

  const meCollection = trimmed.match(/magiceden\.io\/collections\/([a-zA-Z0-9]+)/);
  if (meCollection) {
    return { address: meCollection[1], source: "magic_eden" };
  }

  // Magic Eden Solana launchpad
  const meLaunchpad = trimmed.match(/magiceden\.io\/launchpad\/([a-zA-Z0-9_-]+)/);
  if (meLaunchpad) {
    return { address: meLaunchpad[1], source: "magic_eden" };
  }

  // Raw Solana address (base58, 32-44 chars)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
    return { address: trimmed, source: "metaplex" };
  }

  // If it looks like a symbol/slug (short alphanumeric), try Magic Eden
  if (/^[a-zA-Z0-9_-]{2,30}$/.test(trimmed)) {
    return { address: trimmed, source: "magic_eden" };
  }

  return null;
}

// Fetch from Magic Eden API v2
async function fetchFromMagicEden(symbolOrAddress: string) {
  try {
    // Try as collection symbol first
    const res = await fetch(
      `https://api-mainnet.magiceden.dev/v2/collections/${symbolOrAddress}`,
      { headers: { "Accept": "application/json" } }
    );

    if (res.ok) {
      const data = await res.json();
      return {
        collection_name: data.name || null,
        description: data.description || null,
        image_url: data.image || null,
        total_supply: data.totalItems || data.size || null,
        collection_address: data.mint || symbolOrAddress,
        source: "magic_eden" as const,
        source_url: `https://magiceden.io/marketplace/${symbolOrAddress}`,
      };
    }

    // Try collection stats for additional data
    const statsRes = await fetch(
      `https://api-mainnet.magiceden.dev/v2/collections/${symbolOrAddress}/stats`,
      { headers: { "Accept": "application/json" } }
    );

    if (statsRes.ok) {
      const stats = await statsRes.json();
      return {
        collection_name: symbolOrAddress,
        description: null,
        image_url: null,
        total_supply: stats.totalItems || null,
        collection_address: symbolOrAddress,
        floor_price: stats.floorPrice ? stats.floorPrice / 1e9 : null,
        source: "magic_eden" as const,
        source_url: `https://magiceden.io/marketplace/${symbolOrAddress}`,
      };
    }

    return null;
  } catch (e) {
    console.error("Magic Eden fetch error:", e);
    return null;
  }
}

// Fetch from Metaplex / on-chain via Helius DAS API
async function fetchFromMetaplex(address: string) {
  const heliusRpc = Deno.env.get("HELIUS_RPC");
  if (!heliusRpc) {
    console.error("HELIUS_RPC not set");
    return null;
  }

  try {
    // Use Helius DAS API to get asset info
    const res = await fetch(heliusRpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "fetch-nft",
        method: "getAsset",
        params: { id: address },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const asset = data.result;

    if (!asset) return null;

    // Try to get collection info
    const collection = asset.grouping?.find(
      (g: any) => g.group_key === "collection"
    );

    let collectionData: any = null;
    if (collection?.group_value) {
      // Fetch the collection asset
      const colRes = await fetch(heliusRpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "fetch-collection",
          method: "getAsset",
          params: { id: collection.group_value },
        }),
      });

      if (colRes.ok) {
        const colData = await colRes.json();
        collectionData = colData.result;
      }
    }

    const target = collectionData || asset;

    return {
      collection_name: target.content?.metadata?.name || null,
      description: target.content?.metadata?.description || null,
      image_url: target.content?.links?.image || target.content?.files?.[0]?.uri || null,
      total_supply: null, // DAS doesn't directly give supply
      collection_address: collection?.group_value || address,
      source: "metaplex" as const,
      source_url: null,
    };
  } catch (e) {
    console.error("Metaplex/Helius fetch error:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { input } = await req.json();

    if (!input || typeof input !== "string") {
      return json({ error: "input is required (URL or collection address)" }, 400);
    }

    const parsed = extractAddress(input);
    if (!parsed) {
      return json({ error: "Could not parse input. Paste a Magic Eden URL or Solana collection address." }, 400);
    }

    let result = null;

    if (parsed.source === "magic_eden") {
      result = await fetchFromMagicEden(parsed.address);
    }

    // If Magic Eden didn't work, try Metaplex/Helius
    if (!result && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(parsed.address)) {
      result = await fetchFromMetaplex(parsed.address);
    }

    // If still nothing, try Magic Eden as fallback for raw addresses
    if (!result && parsed.source === "metaplex") {
      result = await fetchFromMagicEden(parsed.address);
    }

    if (!result) {
      return json({
        error: "Collection not found. Check the URL or address and try again.",
        parsed_address: parsed.address,
        tried_source: parsed.source,
      }, 404);
    }

    return json({ success: true, data: result });
  } catch (error) {
    console.error("fetch-nft-collection error:", error);
    return json({ error: "Internal error" }, 500);
  }
});
