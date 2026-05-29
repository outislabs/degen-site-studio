// supabase/functions/copilot-builder-chat/index.ts
// DegenTools builder copilot — Vertex AI (Gemini 2.5 Flash) + credits gating.
// Deploy: supabase functions deploy copilot-builder-chat --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---- Config (tune freely) ----
const MODEL = "gemini-2.5-flash";
const FREE_GENERATIONS_PER_DAY = 10;
const CREDIT_COST_PER_GENERATION = 0.02;
const VERTEX_LOCATION = "us-central1";

// ---- Secrets ----
const SA = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY")!);
const PROJECT = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

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
  const out = await res.json();
  if (!out.access_token) throw new Error("Vertex auth failed: " + JSON.stringify(out));
  return out.access_token;
}

function systemPrompt(ctx: any): string {
  const availableBlocks = ctx?.available_blocks ?? [];
  return `You are the DegenTools builder copilot. You help users add plugin-powered utility blocks to their memecoin/NFT project sites.

RULES:
- The full block library is: swap_widget, lp_stats, trending_feed, holder_gate, claim_page, holder_leaderboard, live_chart, social_cta.
- You can ONLY propose blocks the user has UNLOCKED via their connected plugins. Unlocked blocks: ${JSON.stringify(availableBlocks)}.
- If the user asks for a locked block, tell them which plugin to connect via plugin_suggestions — do NOT propose the block.
- Ask a clarifying question when the request is ambiguous.
- Keep "message" punchy and degen-native — no corporate tone.

BLOCK CONFIG SCHEMAS — propose_block.config MUST match these exactly:

- swap_widget: { "token": string (ticker), "chain": "solana" | "bnb" }
- lp_stats:    { "token": string (ticker or CA) }
- trending_feed: { "chain": "solana" | "bnb", "limit": number }
- holder_gate: { "token": string, "min_balance": number }
- claim_page:  { "token": string, "claim_type": "airdrop" | "whitelist" }
- holder_leaderboard: { "token": string, "limit": number }
- live_chart:  { "token": string, "timeframe": "5m" | "1h" | "1d" }
- social_cta:  { "platforms": ["telegram" | "discord" | "twitter"] }

Do NOT invent fields. Use ONLY the fields above. If the user's project ticker is known, use it for the "token" field.

Site type: ${ctx?.site_type ?? "unknown"}.
Editing page: ${ctx?.active_page ?? "unknown"}.
Project: ${ctx?.name ?? "unnamed"} (${ctx?.ticker ?? "—"}).
Connected plugins: ${JSON.stringify(ctx?.connected_plugins ?? [])}.

Respond ONLY with JSON (no markdown):
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
    contents: history.map((m: any) => ({
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
  const out = await res.json();
  if (out.error) throw new Error("Gemini error: " + JSON.stringify(out.error));
  const text = out?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  try {
    return JSON.parse(text);
  } catch {
    return { message: text, proposed_block: null, plugin_suggestions: [] };
  }
}

async function consumeCredit(userId: string): Promise<{ ok: boolean; reason?: string }> {
  const { data: row } = await supabase
    .from("copilot_credits").select("*").eq("user_id", userId).maybeSingle();

  const today = new Date().toISOString().slice(0, 10);
  let balance = Number(row?.balance ?? 0);
  let freeUsed = Number(row?.free_used_today ?? 0);
  const resetAt = row?.free_reset_at ?? today;
  if (resetAt !== today) freeUsed = 0;

  if (freeUsed < FREE_GENERATIONS_PER_DAY) {
    await supabase.from("copilot_credits").upsert({
      user_id: userId, balance, free_used_today: freeUsed + 1,
      free_reset_at: today, updated_at: new Date().toISOString(),
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
    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr) console.log("auth error:", userErr.message);
    const user = userData?.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    const body = await req.json();
    const message: string = body.message ?? "";
    const context = body.context ?? body.site_context ?? {};
    const history: any[] = Array.isArray(body.history) ? body.history : [];

    if (!message.trim()) {
      return json({ error: "empty_message", message: "Tell me what you want to build." }, 400);
    }

    const gate = await consumeCredit(user.id);
    if (!gate.ok) {
      return json({
        error: gate.reason,
        message: "You're out of credits. Top up with $DEGENTOOLS to keep building.",
        proposed_block: null,
        plugin_suggestions: [],
      }, 402);
    }

    const convo = [...history, { role: "user", content: message }];
    const token = await getAccessToken();
    const result = await callGemini(token, systemPrompt(context), convo);

    // Fire-and-forget persistence — don't block response.
    supabase.from("copilot_messages").insert([
      { session_id: context?.site_id ?? null, role: "user", content: { text: message } },
      { session_id: context?.site_id ?? null, role: "assistant", content: result },
    ]).then(({ error }) => { if (error) console.log("persist err:", error.message); });

    return json(result, 200);
  } catch (e) {
    console.log("handler error:", String(e));
    return json({
      error: "server_error",
      message: "Something broke on my end. Try again?",
      detail: String(e),
      proposed_block: null,
      plugin_suggestions: [],
    }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}
