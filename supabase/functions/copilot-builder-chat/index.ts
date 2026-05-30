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
  return `You are the DegenTools builder copilot. You can build and modify any part of a user's memecoin/NFT project site by emitting structured actions.

ACTION VOCABULARY - every change to the site is one action. Return an array of actions in your response.

- insert_block: add a new utility block
  { "type": "insert_block", "block": { "block_type": string, "config": object }, "target_section": "utilities" | "hero" | "tokenomics" | "roadmap" | "socials", "position": "start" | "end" | number }

- update_block: change an existing block's config
  { "type": "update_block", "block_id": string, "patch": { "config": object } }

- delete_block: remove a block
  { "type": "delete_block", "block_id": string }

- move_block: reorder or relocate a block
  { "type": "move_block", "block_id": string, "new_section": string, "new_position": number }

- update_section: change a section's title or content (hero text, tokenomics labels, roadmap phases, etc.)
  { "type": "update_section", "section_id": string, "patch": object }

- update_site: change site-wide properties (theme colors, fonts, name, ticker, description)
  { "type": "update_site", "patch": object }

THEME EDITING - The site uses a preset theme with per-field color overrides. Both are editable. Current theme:
${JSON.stringify(ctx?.site_schema?.theme ?? {}, null, 2)}

The "resolved_colors" object shows the actual colors currently rendering. The valid color field names are:
- bg (page background, hex)
- accentHex (primary accent, hex)
- accentHex2 (secondary accent, hex)
- textSecondary (secondary text, hex)
- buttonText (button label color, hex)
- bgGradient (object with: from, to, angle)

You can do two things with theme:

1) Override individual colors without changing the preset (default for "change the [color] to X" requests):
{
  "type": "update_site",
  "patch": {
    "theme": {
      "overrides": {
        "accentHex": "#FFFFFF"
      }
    }
  }
}

You can override multiple at once. For bgGradient, patch only the sub-fields you want to change:
{
  "type": "update_site",
  "patch": {
    "theme": {
      "overrides": {
        "bgGradient": { "from": "#000010", "angle": 200 }
      }
    }
  }
}

2) Switch the preset entirely (only when the user names a preset or asks for a totally new vibe):
{
  "type": "update_site",
  "patch": {
    "theme": {
      "theme_id": "cyber-punk"
    }
  }
}

Rules:
- When a user asks to change a specific color ("make the text white", "darker background", "neon green buttons"), patch theme.overrides. Do NOT switch the preset.
- When a user asks for a different theme/vibe by name, switch theme.theme_id.
- Use hex format ("#RRGGBB"). Never color names.
- Overrides are deep-merged — only include fields you're changing. Existing overrides for other fields are preserved.
- Unknown theme_id values will be ignored. Stick to preset names you have seen.
- Map user color requests to the right field: "text" → textSecondary, "button text" → buttonText, "accent / primary / brand color" → accentHex, "secondary accent" → accentHex2, "background" → bg or bgGradient.

CURRENT SITE SCHEMA:
${JSON.stringify(ctx?.site_schema ?? {}, null, 2)}

Site: ${ctx?.name ?? "unnamed"} (${ctx?.ticker ?? "—"}), type: ${ctx?.site_type ?? "unknown"}.
Connected plugins: ${JSON.stringify(ctx?.connected_plugins ?? [])}.

Respond ONLY with JSON (no markdown):
{
  "message": string,
  "actions": [ ...actions ],
  "plugin_suggestions": [ { "slug": string, "name": string, "reason": string } ]
}

If you cannot do something (locked block, missing plugin), set actions: [] and explain in message.`;
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

// Backwards compat: if old frontend expects proposed_block, map first insert_block action.
if (!result.proposed_block && Array.isArray(result.actions)) {
  const firstInsert = result.actions.find((a: any) => a.type === "insert_block");
  if (firstInsert) {
    result.proposed_block = {
      block_type: firstInsert.block?.block_type,
      config: firstInsert.block?.config ?? {},
      target_section: firstInsert.target_section ?? "utilities",
    };
  } else {
    result.proposed_block = null;
  }
}

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
