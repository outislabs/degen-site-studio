import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyCliToken } from "../_shared/cliJWT.ts";

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

const BAGS_BASE = "https://public-api-v2.bags.fm/api/v1";

const BAGS_FEE_MODES: Record<string, string> = {
  default:      "fa29606e-5e48-4c37-827f-4b03d58ee23d",
  low_pre_high: "d16d3585-6488-4a6c-9a6f-e6c39ca0fda3",
  high_pre_low: "a7c8e1f2-3d4b-5a6c-9e0f-1b2c3d4e5f6a",
  high_flat:    "48e26d2f-0a9d-4625-a3cc-c3987d874b9e",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const cliUser = await verifyCliToken(req);
    if (!cliUser) return json({ error: "Unauthorized" }, 401);

    const BAGS_API_KEY = Deno.env.get("BAGS_API_KEY");
    if (!BAGS_API_KEY) return json({ error: "BAGS_API_KEY not configured" }, 500);

    const BAGS_PARTNER_CONFIG = Deno.env.get("BAGS_PARTNER_CONFIG");
    const BAGS_PARTNER_WALLET = Deno.env.get("BAGS_PARTNER_WALLET");

    const body = await req.json();
    const { chain, action } = body;

    if (!chain) return json({ error: "chain is required (solana | bnb)" }, 400);

    if (chain === "bnb") {
      return json(
        { error: "BNB chain launch (four.meme) is not yet implemented" },
        501,
      );
    }

    if (chain !== "solana") {
      return json({ error: "Unsupported chain. Use 'solana' or 'bnb'" }, 400);
    }

    // --- CREATE TOKEN INFO ---
    if (action === "create_token_info") {
      const { name, symbol, description, imageUrl, twitter, telegram, website } = body;
      if (!name || !symbol || !description || !imageUrl)
        return json({ error: "Missing required fields: name, symbol, description, imageUrl" }, 400);
      if (name.length > 32)
        return json({ error: "Token name must be 32 characters or fewer" }, 400);
      if (symbol.replace("$", "").length > 10)
        return json({ error: "Token symbol must be 10 characters or fewer" }, 400);

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
      let resData: any;
      try { resData = JSON.parse(resText); } catch {
        throw new Error(`Bags API returned invalid response: ${resText}`);
      }
      if (!res.ok || !resData.success)
        return json({ error: resData.error || "Failed to create token info" }, 400);

      const tokenMint = resData.response.tokenMint;
      const metadataUrl = resData.response.tokenMetadata;

      // Save to DB for tracking
      try {
        const adminClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        await adminClient.from("bags_tokens").upsert({
          user_id: cliUser.userId,
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

      return json({
        success: true,
        tokenMint,
        metadataUrl,
        tokenLaunch: resData.response.tokenLaunch,
        // ca is the token mint — return it here for CLI convenience
        ca: tokenMint,
      });
    }

    // --- CREATE FEE CONFIG ---
    if (action === "create_fee_config") {
      const { tokenMint, wallet, feeSharers, feeMode = "default" } = body;
      if (!tokenMint || !wallet)
        return json({ error: "Missing required fields: tokenMint, wallet" }, 400);

      const bagsConfigType = BAGS_FEE_MODES[feeMode] || feeMode || BAGS_FEE_MODES.default;

      let claimersArray: string[] = [];
      let basisPointsArray: number[] = [];

      if (feeSharers && feeSharers.length > 0) {
        const feeSharersBps = feeSharers.reduce((sum: number, f: any) => sum + f.bps, 0);
        const creatorBps = 10000 - feeSharersBps;
        if (creatorBps < 0)
          return json({ error: "Total fee sharer percentages cannot exceed 100%" }, 400);

        if (creatorBps > 0) { claimersArray.push(wallet); basisPointsArray.push(creatorBps); }

        for (const sharer of feeSharers) {
          try {
            const lookupRes = await fetch(
              `${BAGS_BASE}/token-launch/fee-share/wallet/v2?provider=${sharer.platform}&username=${encodeURIComponent(sharer.username)}`,
              { headers: { "x-api-key": BAGS_API_KEY } },
            );
            const lookupData = await lookupRes.json();
            if (lookupData?.success && lookupData?.response?.wallet) {
              claimersArray.push(lookupData.response.wallet);
              basisPointsArray.push(sharer.bps);
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
      let resData: any;
      try { resData = JSON.parse(resText); } catch {
        throw new Error(`Bags API returned invalid response: ${resText}`);
      }
      if (!res.ok || !resData.success)
        return json({ error: resData.error || "Failed to create fee config" }, 400);

      const txs = (resData.response?.transactions || []).map((t: any) =>
        typeof t === "string" ? t : t.transaction,
      );
      const bundles = (resData.response?.bundles || []).map((bundle: any[]) =>
        bundle.map((t: any) => typeof t === "string" ? t : t.transaction),
      );

      return json({
        success: true,
        configKey: resData.response?.meteoraConfigKey,
        feeShareAuthority: resData.response?.feeShareAuthority,
        needsCreation: resData.response?.needsCreation,
        transactions: txs,
        bundles,
      });
    }

    // --- CREATE LAUNCH TRANSACTION ---
    if (action === "create_launch_transaction") {
      const { ipfs, metadataUrl, tokenMint, wallet, initialBuyLamports, configKey } = body;
      const resolvedMetadata = metadataUrl || ipfs;
      if (!resolvedMetadata || !tokenMint || !wallet || !initialBuyLamports || !configKey)
        return json({
          error: "Missing required fields: metadataUrl, tokenMint, wallet, initialBuyLamports, configKey",
        }, 400);

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
      let resData: any;
      try { resData = JSON.parse(resText); } catch {
        throw new Error(`Bags API returned invalid response: ${resText}`);
      }
      if (!res.ok || !resData.success)
        return json({ error: resData.error || "Failed to create launch transaction" }, 400);

      try {
        const adminClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        await adminClient.from("bags_tokens").update({
          status: "LAUNCHING",
          updated_at: new Date().toISOString(),
        }).eq("token_mint", tokenMint);
      } catch (e) { console.error("DB update error:", e); }

      return json({ success: true, transaction: resData.response });
    }

    // --- SAVE TOKEN (record confirmed on-chain launch) ---
    if (action === "save_token") {
      const { tokenMint, wallet, name, symbol, description, imageUrl, status, txSignature } = body;
      if (!tokenMint || !wallet)
        return json({ error: "Missing tokenMint or wallet" }, 400);

      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { error } = await adminClient.from("bags_tokens").upsert({
        user_id: cliUser.userId,
        wallet_address: wallet,
        token_mint: tokenMint,
        name: name || "",
        symbol: symbol || "",
        description: description || "",
        image_url: imageUrl || "",
        status: status || "PRE_GRAD",
      }, { onConflict: "token_mint" });

      if (error) return json({ error: error.message }, 400);

      // Return the full CLI response shape for the final step
      return json({
        success: true,
        ca: tokenMint,
        txSignature: txSignature || null,
        explorerUrl: txSignature
          ? `https://solscan.io/tx/${txSignature}`
          : `https://solscan.io/token/${tokenMint}`,
      });
    }

    return json({ error: "Invalid action. Use: create_token_info | create_fee_config | create_launch_transaction | save_token" }, 400);

  } catch (err) {
    console.error("cli-launch error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
