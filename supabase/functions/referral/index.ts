import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BASE_URL = "https://degentools.co";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateCode(seed: string): string {
  const prefix = seed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6).padEnd(6, "X");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes).map(b => chars[b % chars.length]).join("");
  return prefix + suffix;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { action } = body;
    if (!action) return json({ error: "action is required" }, 400);

    // ── Auth-required actions ─────────────────────────────────────────────────
    if (["get_or_create_code", "get_stats", "set_payout_wallet"].includes(action)) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return json({ error: "Unauthorized" }, 401);

      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authError } = await userClient.auth.getUser();
      if (authError || !user) return json({ error: "Unauthorized" }, 401);

      // get_or_create_code
      if (action === "get_or_create_code") {
        const { data: existing } = await admin
          .from("referral_codes")
          .select("code, clicks")
          .eq("user_id", user.id)
          .single();

        if (existing) {
          return json({ code: existing.code, referralUrl: `${BASE_URL}?ref=${existing.code}`, clicks: existing.clicks });
        }

        const seed = user.user_metadata?.full_name || user.user_metadata?.name || user.email || user.id;
        let code = generateCode(seed);

        // Collision retry
        for (let i = 0; i < 5; i++) {
          const { data: collision } = await admin
            .from("referral_codes").select("code").eq("code", code).maybeSingle();
          if (!collision) break;
          code = generateCode(user.id.slice(i * 4));
        }

        const { data: newCode, error: insertError } = await admin
          .from("referral_codes")
          .upsert({ user_id: user.id, code, clicks: 0 }, { onConflict: "user_id", ignoreDuplicates: false })
          .select("code, clicks")
          .single();

        if (insertError) throw insertError;

        return json({ code: newCode.code, referralUrl: `${BASE_URL}?ref=${newCode.code}`, clicks: newCode.clicks });
      }

      // get_stats
      if (action === "get_stats") {
        const { data: codeRow } = await admin
          .from("referral_codes").select("code, clicks").eq("user_id", user.id).single();

        if (!codeRow) {
          return json({ code: null, clicks: 0, totalReferrals: 0, convertedCount: 0, pendingEarnings: 0, totalEarned: 0, recentReferrals: [] });
        }

        const { data: referrals } = await admin
          .from("referrals")
          .select("id, referred_user_id, status, created_at")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false });

        const totalReferrals = referrals?.length ?? 0;
        const convertedCount = referrals?.filter(r => r.status === "converted").length ?? 0;

        const { data: earnings } = await admin
          .from("affiliate_earnings")
          .select("amount, status")
          .eq("referrer_id", user.id);

        const pendingEarnings = earnings?.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0) ?? 0;
        const totalEarned = earnings?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

        return json({
          code: codeRow.code,
          referralUrl: `${BASE_URL}?ref=${codeRow.code}`,
          clicks: codeRow.clicks,
          totalReferrals,
          convertedCount,
          pendingEarnings,
          totalEarned,
          recentReferrals: referrals?.slice(0, 20) ?? [],
        });
      }

      // set_payout_wallet
      if (action === "set_payout_wallet") {
        const { walletAddress } = body;
        if (!walletAddress || typeof walletAddress !== "string") {
          return json({ error: "walletAddress is required" }, 400);
        }

        const { error } = await admin
          .from("affiliate_earnings")
          .update({ payout_wallet: walletAddress.trim() })
          .eq("referrer_id", user.id)
          .eq("status", "pending");

        if (error) throw error;
        return json({ success: true });
      }
    }

    // ── track_click (no auth) ─────────────────────────────────────────────────
    if (action === "track_click") {
      const { code } = body;
      if (!code || typeof code !== "string") return json({ error: "code is required" }, 400);

      const sanitizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);

      const { data: codeRow } = await admin
        .from("referral_codes").select("clicks").eq("code", sanitizedCode).single();

      if (codeRow) {
        await admin
          .from("referral_codes")
          .update({ clicks: codeRow.clicks + 1 })
          .eq("code", sanitizedCode);
      }

      return json({ success: true });
    }

    // ── track_signup (no auth) ────────────────────────────────────────────────
    if (action === "track_signup") {
      const { code, referredUserId } = body;
      if (!code || !referredUserId) return json({ error: "code and referredUserId are required" }, 400);
      if (!/^[0-9a-f-]{36}$/.test(referredUserId)) return json({ error: "Invalid referredUserId" }, 400);

      const sanitizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);

      const { data: codeRow } = await admin
        .from("referral_codes").select("user_id").eq("code", sanitizedCode).single();

      if (!codeRow) return json({ error: "Invalid referral code" }, 400);
      if (codeRow.user_id === referredUserId) return json({ error: "Cannot refer yourself" }, 400);

      const { error } = await admin
        .from("referrals")
        .insert({ referrer_id: codeRow.user_id, referred_user_id: referredUserId, code: sanitizedCode, status: "pending" });

      if (error && error.code !== "23505") throw error; // ignore duplicate signups
      return json({ success: true });
    }

    // ── track_conversion (service role only) ─────────────────────────────────
    if (action === "track_conversion") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
        return json({ error: "Forbidden" }, 403);
      }

      const { referredUserId, paymentAmount } = body;
      if (!referredUserId || typeof paymentAmount !== "number") {
        return json({ error: "referredUserId and paymentAmount are required" }, 400);
      }
      if (!/^[0-9a-f-]{36}$/.test(referredUserId)) return json({ error: "Invalid referredUserId" }, 400);

      const { data: referral } = await admin
        .from("referrals")
        .select("id, referrer_id, status")
        .eq("referred_user_id", referredUserId)
        .eq("status", "pending")
        .single();

      if (!referral) return json({ success: true, message: "No pending referral found" });

      const reward = paymentAmount * 0.20;

      await admin.from("referrals").update({ status: "converted" }).eq("id", referral.id);

      const { error: earningsError } = await admin
        .from("affiliate_earnings")
        .insert({ referrer_id: referral.referrer_id, referral_id: referral.id, amount: reward, status: "pending" });

      if (earningsError) throw earningsError;
      return json({ success: true, reward });
    }

    return json({ error: "Invalid action" }, 400);

  } catch (e) {
    console.error("referral error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
