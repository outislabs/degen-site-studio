// supabase/functions/copilot-builder-chat/index.ts
// DegenTools builder copilot — Vertex AI (Gemini 2.5 Flash) + credits gating.
// Deploy: supabase functions deploy copilot-builder-chat --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- Config (tune freely) ----
const MODEL = "gemini-2.5-flash";
const FREE_GENERATIONS_PER_DAY = 10;
const CREDIT_COST_PER_GENERATION = 0.02; // USD-equiv credits per generation
const VERTEX_LOCATION = "us-central1";

// ---- Secrets ----
// GCP_SERVICE_ACCOUNT  -> full service-account JSON (string)
// GCP_PROJECT_ID       -> Vertex project id
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY -> auto-injected by Supabase
const SA = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY")!);
const PROJECT = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

// ---- Google OAuth: sign a JWT with the SA private key, exchange for access token ----
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

function b64url(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: SA.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(SA.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned)),
  );
  const jwt = `${unsigned}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error("Vertex auth failed: " + JSON.stringify(json));
  return json.access_token;
}

// ---- System prompt: scoped to the DegenTools block library ----
function systemPrompt(siteContext: any): string {
  return `You are the DegenTools builder copilot. You help users add plugin-powered utility blocks to their memecoin/NFT project sites.

RULES:
- You can ONLY propose blocks from this library: swap_widget (Jupiter), lp_stats (DexScreener), trending_feed (Birdeye), holder_gate, claim_page, holder_leaderboard, live_chart, social_cta.
- Prefer plugins the user has already connected. Never invent plugins or blocks that don't exist.
- Ask a clarifying question when the request is ambiguous instead of guessing.
- Keep "message" punchy and degen-native — no corporate tone.

The user is editing: ${siteContext?.active_page ?? "unknown page"}.
Existing blocks on this page: ${JSON.stringify(siteContext?.existing_blocks ?? [])}.
Connected plugins: ${JSON.stringify(siteContext?.connected_plugins ?? [])}.

Respond ONLY with JSON matching this schema (no markdown, no prose outside JSON):
{
  "message": string,
  "proposed_block": { "block_type": string, "config": object, "target_section": string } | null,
  "plugin_suggestions": [ { "slug": string, "name": string, "reason": string } ]
}`;
}

async function callGemini(token: string, system: string, history: any[]): Promise<any> {
  const url = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${VERTEX_LOCATION}/publishers/google/models/${MODEL}:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
    })),
    generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  try {
    return JSON.parse(text);
  } catch {
    return { message: text, proposed_block: null, plugin_suggestions: [] };
  }
}

// ---- Credits: check free quota, else debit balance. Returns null if blocked. ----
async function consumeCredit(userId: string): Promise<{ ok: boolean; reason?: string }> {
  const { data: row } = await supabase
    .from("copilot_credits").select("*").eq("user_id", userId).maybeSingle();

  const today = new Date().toISOString().slice(0, 10);
  let balance = row?.balance ?? 0;
  let freeUsed = row?.free_used_today ?? 0;
  const resetAt = row?.free_reset_at ?? today;
  if (resetAt !== today) freeUsed = 0; // new day -> reset free counter

  if (freeUsed < FREE_GENERATIONS_PER_DAY) {
    await supabase.from("copilot_credits").upsert({
      user_id: userId,
      balance,
      free_used_today: freeUsed + 1,
      free_reset_at: today,
      updated_at: new Date().toISOString(),
    });
    await supabase.from("copilot_credit_ledger").insert({
      user_id: userId, kind: "free_grant", amount: 0,
      meta: { note: "free daily generation", index: freeUsed + 1 },
    });
    return { ok: true };
  }

  if (balance < CREDIT_COST_PER_GENERATION) {
    return { ok: false, reason: "out_of_credits" };
  }

  balance -= CREDIT_COST_PER_GENERATION;
  await supabase.from("copilot_credits").upsert({
    user_id: userId, balance, free_used_today: freeUsed,
    free_reset_at: today, updated_at: new Date().toISOString(),
  });
  await supabase.from("copilot_credit_ledger").insert({
    user_id: userId, kind: "generation_spend",
    amount: -CREDIT_COST_PER_GENERATION,
  });
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const { data: userData } = await supabase.auth.getUser(jwt);
    const user = userData?.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    const { session_id, message, site_context } = await req.json();

    // Gate on credits BEFORE spending compute.
    const gate = await consumeCredit(user.id);
    if (!gate.ok) {
      return json({ error: gate.reason, message: "You're out of credits. Top up with $DEGENTOOLS to keep building." }, 402);
    }

    // Persist user message + load history.
    await supabase.from("copilot_messages").insert({
      session_id, role: "user", content: { text: message },
    });
    const { data: history } = await supabase
      .from("copilot_messages").select("role, content")
      .eq("session_id", session_id).order("created_at", { ascending: true }).limit(40);

    const token = await getAccessToken();
    const result = await callGemini(
      token,
      systemPrompt(site_context),
      (history ?? []).map((m: any) => ({ role: m.role, content: m.content?.text ?? m.content })),
    );

    await supabase.from("copilot_messages").insert({
      session_id, role: "assistant", content: result,
    });

    return json(result, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}
