import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const BAGS_API_KEY = Deno.env.get("BAGS_API_KEY")!;
    const BAGS_PARTNER_CONFIG = Deno.env.get("BAGS_PARTNER_CONFIG");
    const BAGS_PARTNER_WALLET = Deno.env.get("BAGS_PARTNER_WALLET");

    if (!BAGS_API_KEY) throw new Error("BAGS_API_KEY not configured");

    const body = await req.json();
    const { action } = body;

    // --- STEP 1: Create Token Info & Metadata ---
    if (action === "create_token_info") {
      const { name, symbol, description, imageUrl, twitter, telegram, website } = body;

      if (!name || !symbol || !description || !imageUrl) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: name, symbol, description, imageUrl" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (name.length > 32) {
        return new Response(
          JSON.stringify({ error: "Token name must be 32 characters or fewer" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (symbol.replace('$', '').length > 10) {
        return new Response(
          JSON.stringify({ error: "Token symbol must be 10 characters or fewer" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Creating token info for:", name, symbol);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("symbol", symbol.toUpperCase().replace("$", ""));
      formData.append("description", description.slice(0, 1000));
      formData.append("imageUrl", imageUrl);
      if (twitter) formData.append("twitter", twitter);
      if (telegram) formData.append("telegram", telegram);
      if (website) formData.append("website", website);

      const res = await fetch(
        "https://public-api-v2.bags.fm/api/v1/token-launch/create-token-info",
        {
          method: "POST",
          headers: { "x-api-key": BAGS_API_KEY },
          body: formData,
        }
      );

      const resText = await res.text();
      console.log("Bags create-token-info response:", res.status, resText);

      let resData: any;
      try { resData = JSON.parse(resText); } catch {
        throw new Error(`Bags API returned invalid response: ${resText}`);
      }

      if (!res.ok || !resData.success) {
        return new Response(
          JSON.stringify({ error: resData.error || "Failed to create token info" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          tokenMint: resData.response.tokenMint,
          ipfs: resData.response.tokenMetadata,
          tokenLaunch: resData.response.tokenLaunch,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- STEP 2: Create Fee Share Config ---
    if (action === "create_fee_config") {
      const { tokenMint, wallet, initialBuyLamports } = body;

      if (!tokenMint || !wallet) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: tokenMint, wallet" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Creating fee share config for:", tokenMint);

      // Build fee claimers — creator gets all fees
      // Partner key is embedded separately via partner/partnerConfig params
      const feeClaimers = [
        { user: wallet, userBps: 10000 } // Creator gets 100% of user fees
      ];

      // Build request body
      const configBody: any = {
        payer: wallet,
        baseMint: tokenMint,
        feeClaimers,
      };

      // Embed DegenTools partner key if configured
      if (BAGS_PARTNER_WALLET && BAGS_PARTNER_CONFIG) {
        configBody.partner = BAGS_PARTNER_WALLET;
        configBody.partnerConfig = BAGS_PARTNER_CONFIG;
        console.log("Partner key embedded:", BAGS_PARTNER_CONFIG);
      }

      const res = await fetch(
        "https://public-api-v2.bags.fm/api/v1/fee-share/create-config",
        {
          method: "POST",
          headers: {
            "x-api-key": BAGS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(configBody),
        }
      );

      const resText = await res.text();
      console.log("Fee config response:", res.status, resText);

      let resData: any;
      try { resData = JSON.parse(resText); } catch {
        throw new Error(`Bags API returned invalid response: ${resText}`);
      }

      if (!res.ok || !resData.success) {
        return new Response(
          JSON.stringify({ error: resData.error || "Failed to create fee config" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          configKey: resData.response?.meteoraConfigKey || resData.response?.configKey,
          transactions: resData.response?.transactions || [],
          bundles: resData.response?.bundles || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- STEP 3: Create Launch Transaction ---
    if (action === "create_launch_transaction") {
      const { ipfs, tokenMint, wallet, initialBuyLamports, configKey } = body;

      if (!ipfs || !tokenMint || !wallet || !initialBuyLamports || !configKey) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: ipfs, tokenMint, wallet, initialBuyLamports, configKey" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Creating launch transaction for:", tokenMint, "wallet:", wallet);

      const res = await fetch(
        "https://public-api-v2.bags.fm/api/v1/token-launch/create-launch-transaction",
        {
          method: "POST",
          headers: {
            "x-api-key": BAGS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ipfs,
            tokenMint,
            wallet,
            initialBuyLamports,
            configKey,
          }),
        }
      );

      const resText = await res.text();
      console.log("Launch transaction response:", res.status, resText);

      let resData: any;
      try { resData = JSON.parse(resText); } catch {
        throw new Error(`Bags API returned invalid response: ${resText}`);
      }

      if (!res.ok || !resData.success) {
        return new Response(
          JSON.stringify({ error: resData.error || "Failed to create launch transaction" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          transaction: resData.response,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- GET PARTNER STATS ---
    if (action === "get_partner_stats") {
      if (!BAGS_PARTNER_CONFIG) {
        return new Response(
          JSON.stringify({ error: "Partner key not configured" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const res = await fetch(
        `https://public-api-v2.bags.fm/api/v1/partner/stats?partnerConfig=${BAGS_PARTNER_CONFIG}`,
        { headers: { "x-api-key": BAGS_API_KEY } }
      );

      const resText = await res.text();
      let resData: any;
      try { resData = JSON.parse(resText); } catch {
        throw new Error(`Bags API returned invalid response: ${resText}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          stats: resData.response,
          partnerConfig: BAGS_PARTNER_CONFIG,
          partnerWallet: BAGS_PARTNER_WALLET,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- GET USER TOKENS ---
    if (action === "get_user_tokens") {
      const res = await fetch(
        "https://public-api-v2.bags.fm/api/v1/token-launch/feed",
        { headers: { "x-api-key": BAGS_API_KEY } }
      );

      const resText = await res.text();
      let resData: any;
      try { resData = JSON.parse(resText); } catch {
        throw new Error(`Bags API returned invalid response: ${resText}`);
      }

      if (!res.ok || !resData.success) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch tokens" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Filter by wallet if provided
      const { wallet } = body;
      let tokens = resData.response || [];
      if (wallet) {
        tokens = tokens.filter((t: any) =>
          t.launchWallet === wallet ||
          t.userId === wallet ||
          t.accountKeys?.includes(wallet)
        );
      }

      return new Response(
        JSON.stringify({ success: true, tokens }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("launch-on-bags error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
