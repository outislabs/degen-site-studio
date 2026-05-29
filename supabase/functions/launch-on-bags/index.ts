import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const BAGS_BASE = "https://public-api-v2.bags.fm/api/v1";

const BAGS_FEE_MODES: Record<string, string> = {
  default:      "fa29606e-5e48-4c37-827f-4b03d58ee23d",
  low_pre_high: "d16d3585-6488-4a6c-9a6f-e6c39ca0fda3",
  high_pre_low: "a7c8e1f2-3d4b-5a6c-9e0f-1b2c3d4e5f6a",
  high_flat:    "48e26d2f-0a9d-4625-a3cc-c3987d874b9e",
};

Deno.serve(async (req) => {
  console.log("launch-on-bags called:", req.method, req.url);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const BAGS_API_KEY = Deno.env.get("BAGS_API_KEY")!;
    const BAGS_PARTNER_CONFIG = Deno.env.get("BAGS_PARTNER_CONFIG");
    const BAGS_PARTNER_WALLET = Deno.env.get("BAGS_PARTNER_WALLET");
    if (!BAGS_API_KEY) throw new Error("BAGS_API_KEY not configured");

    const body = await req.json();
    const { action } = body;
    console.log("Action:", action);

    // CREATE TOKEN INFO
    if (action === "create_token_info") {
      const { name, symbol, description, imageUrl, twitter, telegram, website } = body;
      if (!name || !symbol || !description || !imageUrl)
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (name.length > 32)
        return new Response(JSON.stringify({ error: "Token name must be 32 characters or fewer" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (symbol.replace("$", "").length > 10)
        return new Response(JSON.stringify({ error: "Token symbol must be 10 characters or fewer" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const formData = new FormData();
      formData.append("name", name);
      formData.append("symbol", symbol.toUpperCase().replace("$", ""));
      formData.append("description", description.slice(0, 1000));
      formData.append("imageUrl", imageUrl);
      if (twitter) formData.append("twitter", twitter);
      if (telegram) formData.append("telegram", telegram);
      if (website) formData.append("website", website);

      const res = await fetch(`${BAGS_BASE}/token-launch/create-token-info`, {
        method: "POST",
        headers: { "x-api-key": BAGS_API_KEY },
        body: formData,
      });
      const resText = await res.text();
      console.log("Bags create-token-info response:", res.status, resText);
      let resData: any;
      try { resData = JSON.parse(resText); } catch { throw new Error(`Bags API returned invalid response: ${resText}`); }
      if (!res.ok || !resData.success)
        return new Response(JSON.stringify({ error: resData.error || "Failed to create token info" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const tokenMint = resData.response.tokenMint;
      const metadataUrl = resData.response.tokenMetadata;

      try {
        await supabase.from("bags_tokens").upsert({
          user_id: user.id,
          wallet_address: body.wallet || "",
          token_mint: tokenMint,
          name,
          symbol: symbol.toUpperCase().replace("$", ""),
          description,
          image_url: imageUrl,
          twitter: twitter || null,
          telegram: telegram || null,
          website: website || null,
          ipfs_url: metadataUrl,
          status: "PRE_GRAD",
        }, { onConflict: "token_mint" });
      } catch (e) { console.error("DB save error:", e); }

      return new Response(JSON.stringify({
        success: true,
        tokenMint,
        metadataUrl,
        ipfs: metadataUrl,
        tokenLaunch: resData.response.tokenLaunch,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // CREATE FEE CONFIG
    if (action === "create_fee_config") {
      const { tokenMint, wallet, feeSharers, feeMode = "default" } = body;
      if (!tokenMint || !wallet)
        return new Response(JSON.stringify({ error: "Missing required fields: tokenMint, wallet" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const bagsConfigType = BAGS_FEE_MODES[feeMode] || feeMode || BAGS_FEE_MODES.default;
      console.log("Fee mode:", feeMode, "-> config UUID:", bagsConfigType);

      let claimersArray: string[] = [];
      let basisPointsArray: number[] = [];

      if (feeSharers && feeSharers.length > 0) {
        const feeSharersBps = feeSharers.reduce((sum: number, f: any) => sum + f.bps, 0);
        const creatorBps = 10000 - feeSharersBps;
        if (creatorBps < 0)
          return new Response(JSON.stringify({ error: "Total fee sharer percentages cannot exceed 100%" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

        if (creatorBps > 0) { claimersArray.push(wallet); basisPointsArray.push(creatorBps); }

        for (const sharer of feeSharers) {
          try {
            const lookupRes = await fetch(
              `${BAGS_BASE}/token-launch/fee-share/wallet/v2?provider=${sharer.platform}&username=${encodeURIComponent(sharer.username)}`,
              { headers: { "x-api-key": BAGS_API_KEY } }
            );
            const lookupData = await lookupRes.json();
            if (lookupData?.success && lookupData?.response?.wallet) {
              claimersArray.push(lookupData.response.wallet);
              basisPointsArray.push(sharer.bps);
            } else {
              console.warn(`Could not resolve wallet for ${sharer.username} on ${sharer.platform}`);
            }
          } catch (e) { console.error(`Error looking up wallet for ${sharer.username}:`, e); }
        }

        const totalBps = basisPointsArray.reduce((sum, bps) => sum + bps, 0);
        if (totalBps !== 10000) {
          const idx = claimersArray.indexOf(wallet);
          if (idx >= 0) basisPointsArray[idx] += (10000 - totalBps);
        }

        if (claimersArray.length === 0) { claimersArray = [wallet]; basisPointsArray = [10000]; }
      } else {
        claimersArray = [wallet];
        basisPointsArray = [10000];
      }

      const configBody: any = {
        payer: wallet,
        baseMint: tokenMint,
        claimersArray,
        basisPointsArray,
        bagsConfigType,
      };
      if (BAGS_PARTNER_WALLET && BAGS_PARTNER_CONFIG) {
        configBody.partner = BAGS_PARTNER_WALLET;
        configBody.partnerConfig = BAGS_PARTNER_CONFIG;
      }

      const res = await fetch(`${BAGS_BASE}/fee-share/config`, {
        method: "POST",
        headers: { "x-api-key": BAGS_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(configBody),
      });
      const resText = await res.text();
      console.log("Fee config response:", res.status, resText);
      let resData: any;
      try { resData = JSON.parse(resText); } catch { throw new Error(`Bags API returned invalid response: ${resText}`); }
      if (!res.ok || !resData.success)
        return new Response(JSON.stringify({ error: resData.error || "Failed to create fee config" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const txs = (resData.response?.transactions || []).map((t: any) => typeof t === "string" ? t : t.transaction);
      const bundles = (resData.response?.bundles || []).map((bundle: any[]) => bundle.map((t: any) => typeof t === "string" ? t : t.transaction));

      return new Response(JSON.stringify({
        success: true,
        configKey: resData.response?.meteoraConfigKey,
        feeShareAuthority: resData.response?.feeShareAuthority,
        needsCreation: resData.response?.needsCreation,
        transactions: txs,
        bundles,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // CREATE LAUNCH TRANSACTION
    if (action === "create_launch_transaction") {
      const { ipfs, metadataUrl, tokenMint, wallet, initialBuyLamports, configKey } = body;
      const resolvedMetadata = metadataUrl || ipfs;
      if (!resolvedMetadata || !tokenMint || !wallet || !initialBuyLamports || !configKey)
        return new Response(JSON.stringify({ error: "Missing required fields: metadataUrl, tokenMint, wallet, initialBuyLamports, configKey" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const res = await fetch(`${BAGS_BASE}/token-launch/create-launch-transaction`, {
        method: "POST",
        headers: { "x-api-key": BAGS_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          metadataUrl: resolvedMetadata,
          tokenMint,
          launchWallet: wallet,
          initialBuyLamports,
          configKey,
        }),
      });
      const resText = await res.text();
      console.log("Launch transaction response:", res.status, resText);
      let resData: any;
      try { resData = JSON.parse(resText); } catch { throw new Error(`Bags API returned invalid response: ${resText}`); }
      if (!res.ok || !resData.success)
        return new Response(JSON.stringify({ error: resData.error || "Failed to create launch transaction" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      try {
        await supabase.from("bags_tokens").update({
          status: "LAUNCHING",
          updated_at: new Date().toISOString(),
        }).eq("token_mint", tokenMint);
      } catch (e) { console.error("DB update error:", e); }

      return new Response(JSON.stringify({
        success: true,
        transaction: resData.response,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // SAVE TOKEN
    if (action === "save_token") {
      const { tokenMint, wallet, name, symbol, description, imageUrl, status } = body;
      if (!tokenMint || !wallet)
        return new Response(JSON.stringify({ error: "Missing tokenMint or wallet" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { error } = await supabase.from("bags_tokens").upsert({
        user_id: user.id, wallet_address: wallet, token_mint: tokenMint,
        name: name || "", symbol: symbol || "", description: description || "",
        image_url: imageUrl || "", status: status || "PRE_GRAD",
      }, { onConflict: "token_mint" });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET TRADE QUOTE
    if (action === "get_trade_quote") {
      const { inputMint, outputMint, amount, slippageMode = "auto", slippageBps } = body;
      if (!inputMint || !outputMint || !amount)
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      let url = `${BAGS_BASE}/trade/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageMode=${slippageMode}`;
      if (slippageMode === "manual" && slippageBps) url += `&slippageBps=${slippageBps}`;
      const res = await fetch(url, { headers: { "x-api-key": BAGS_API_KEY } });
      const resText = await res.text();
      let resData: any;
      try { resData = JSON.parse(resText); } catch { throw new Error(`Bags API returned invalid response: ${resText}`); }
      if (!res.ok || !resData.success)
        return new Response(JSON.stringify({ error: resData.error || "Failed to get trade quote" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true, quote: resData.response }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // CREATE SWAP
    if (action === "create_swap") {
      const { quoteResponse, userPublicKey } = body;
      if (!quoteResponse || !userPublicKey)
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const res = await fetch(`${BAGS_BASE}/trade/swap`, {
        method: "POST",
        headers: { "x-api-key": BAGS_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ quoteResponse, userPublicKey }),
      });
      const resText = await res.text();
      let resData: any;
      try { resData = JSON.parse(resText); } catch { throw new Error(`Bags API returned invalid response: ${resText}`); }
      if (!res.ok || !resData.success)
        return new Response(JSON.stringify({ error: resData.error || "Failed to create swap" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({
        success: true,
        swapTransaction: resData.response.swapTransaction,
        lastValidBlockHeight: resData.response.lastValidBlockHeight,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET TOKEN FEES
    if (action === "get_token_fees") {
      const { tokenMint } = body;
      if (!tokenMint)
        return new Response(JSON.stringify({ error: "Missing tokenMint" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const res = await fetch(`${BAGS_BASE}/analytics/token-lifetime-fees?tokenMint=${tokenMint}`, { headers: { "x-api-key": BAGS_API_KEY } });
      const resText = await res.text();
      let resData: any;
      try { resData = JSON.parse(resText); } catch { throw new Error(`Bags API returned invalid response: ${resText}`); }
      if (!res.ok || !resData.success)
        return new Response(JSON.stringify({ error: resData.error || "Failed to get token fees" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true, fees: resData.response }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET CLAIMABLE POSITIONS
    if (action === "get_claimable_positions") {
      const { wallet } = body;
      if (!wallet)
        return new Response(JSON.stringify({ error: "Missing wallet" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const res = await fetch(`${BAGS_BASE}/token-launch/claimable-positions?wallet=${wallet}`, { headers: { "x-api-key": BAGS_API_KEY } });
      const resText = await res.text();
      console.log("Claimable positions response:", res.status, resText.slice(0, 300));
      let resData: any;
      try { resData = JSON.parse(resText); } catch { throw new Error(`Bags API returned invalid response: ${resText}`); }
      if (!res.ok || !resData.success)
        return new Response(JSON.stringify({ error: resData.error || "Failed to get claimable positions" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ success: true, positions: resData.response }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET CLAIM TRANSACTIONS
    if (action === "get_claim_transactions") {
      const { wallet, tokenMints } = body;
      if (!wallet)
        return new Response(JSON.stringify({ error: "Missing wallet" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const allTxs: string[] = [];
      const mints = tokenMints && tokenMints.length > 0 ? tokenMints : [];
      for (const tokenMint of mints) {
        try {
          const res = await fetch(`${BAGS_BASE}/token-launch/claim-txs/v3`, {
            method: "POST",
            headers: { "x-api-key": BAGS_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ feeClaimer: wallet, tokenMint }),
            signal: AbortSignal.timeout(25000),
          });
          const resText = await res.text();
          console.log("Claim txs for", tokenMint, ":", res.status, resText.slice(0, 200));
          let resData: any;
          try { resData = JSON.parse(resText); } catch { continue; }
          if (resData?.success && Array.isArray(resData.response)) {
            const txs = resData.response.map((t: any) => t.tx || t.transaction || t).filter(Boolean);
            allTxs.push(...txs);
          }
        } catch (e: any) {
          if (e?.name === "TimeoutError") {
            return new Response(JSON.stringify({ error: "Claim transaction request timed out. Please try again." }), { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          console.error("Claim tx error for", tokenMint, e);
        }
      }
      return new Response(JSON.stringify({ success: true, transactions: allTxs }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET PARTNER STATS
    if (action === "get_partner_stats") {
      if (!BAGS_PARTNER_CONFIG)
        return new Response(JSON.stringify({ error: "Partner key not configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const res = await fetch(`${BAGS_BASE}/partner/stats?partnerConfig=${BAGS_PARTNER_CONFIG}`, { headers: { "x-api-key": BAGS_API_KEY } });
      const resText = await res.text();
      let resData: any;
      try { resData = JSON.parse(resText); } catch { throw new Error(`Bags API returned invalid response: ${resText}`); }
      return new Response(JSON.stringify({
        success: true,
        stats: resData.response,
        partnerConfig: BAGS_PARTNER_CONFIG,
        partnerWallet: BAGS_PARTNER_WALLET,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET USER TOKENS
    if (action === "get_user_tokens") {
      const { wallet } = body;
      const { data: dbTokens, error: dbError } = await supabase
        .from("bags_tokens").select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      console.log("DB tokens found:", dbTokens?.length || 0, dbError?.message || "");

      if (dbTokens && dbTokens.length > 0) {
        const tokens = dbTokens.map((t: any) => ({
          tokenMint: t.token_mint, name: t.name, symbol: t.symbol, ticker: t.symbol,
          image: t.image_url, logoUrl: t.image_url, description: t.description,
          status: t.status || "PRE_GRAD", twitter: t.twitter,
          telegram: t.telegram, website: t.website, accountKeys: [],
        }));
        return new Response(JSON.stringify({ success: true, tokens }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const res = await fetch(`${BAGS_BASE}/token-launch/feed`, { headers: { "x-api-key": BAGS_API_KEY } });
      const resText = await res.text();
      let resData: any;
      try { resData = JSON.parse(resText); } catch { throw new Error(`Bags API returned invalid response: ${resText}`); }
      if (!res.ok || !resData.success)
        return new Response(JSON.stringify({ error: "Failed to fetch tokens" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      let tokens = resData.response || [];
      if (wallet) {
        const walletLower = wallet.toLowerCase();
        tokens = tokens.filter((t: any) => {
          const keys = t.accountKeys || [];
          return t.launchWallet === wallet || t.launchWallet?.toLowerCase() === walletLower
            || t.userId === wallet || keys.includes(wallet)
            || keys.some((k: string) => k.toLowerCase() === walletLower);
        });
      }
      return new Response(JSON.stringify({ success: true, tokens }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("launch-on-bags error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
