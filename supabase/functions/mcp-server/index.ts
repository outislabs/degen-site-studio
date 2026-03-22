/**
 * DegenTools MCP Server
 *
 * Implements the Model Context Protocol (JSON-RPC 2.0, protocol version 2024-11-05)
 * over HTTP. Authenticate with the X-DegenTools-API-Key header.
 *
 * Supported methods: initialize · tools/list · tools/call
 * Tools: generate_meme · launch_token · get_token_data · generate_shill_copy
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-degentools-api-key",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function hashKey(key: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function rpcResult(id: unknown, result: unknown, status = 200): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function rpcError(id: unknown, code: number, message: string, status = 400): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// API key validation + rate limiting
// ---------------------------------------------------------------------------

interface ApiKeyRecord {
  id: string;
  user_id: string;
  requests_per_minute: number;
  requests_per_day: number;
}

async function validateApiKey(rawKey: string, svc: ReturnType<typeof createClient>): Promise<ApiKeyRecord | null> {
  const hash = await hashKey(rawKey);
  const { data } = await svc
    .from("api_keys")
    .select("id, user_id, requests_per_minute, requests_per_day")
    .eq("key_hash", hash)
    .eq("is_active", true)
    .single();
  return data ?? null;
}

async function checkRateLimits(
  key: ApiKeyRecord,
  svc: ReturnType<typeof createClient>
): Promise<{ ok: boolean; error?: string }> {
  const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
  const dayStart  = new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";

  const [{ count: minCount }, { count: dayCount }] = await Promise.all([
    svc.from("api_usage_logs").select("*", { count: "exact", head: true })
      .eq("api_key_id", key.id).gte("created_at", oneMinAgo),
    svc.from("api_usage_logs").select("*", { count: "exact", head: true })
      .eq("api_key_id", key.id).gte("created_at", dayStart),
  ]);

  if ((minCount ?? 0) >= key.requests_per_minute)
    return { ok: false, error: `Rate limit exceeded: max ${key.requests_per_minute} requests/minute` };
  if ((dayCount ?? 0) >= key.requests_per_day)
    return { ok: false, error: `Rate limit exceeded: max ${key.requests_per_day} requests/day` };

  return { ok: true };
}

/** Fire-and-forget — never awaited so it doesn't block the response */
function logRequest(
  svc: ReturnType<typeof createClient>,
  keyId: string,
  tool: string,
  statusCode: number,
  responseTimeMs: number,
  metadata?: object
): void {
  Promise.all([
    svc.from("api_usage_logs").insert({
      api_key_id: keyId,
      tool,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      metadata: metadata ?? null,
    }),
    svc.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyId),
  ]).catch(console.error);
}

// ---------------------------------------------------------------------------
// Google / Vertex AI auth (same JWT flow as generate-content)
// ---------------------------------------------------------------------------

async function getGoogleAccessToken(): Promise<string> {
  const sa = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY") || "{}");
  const now = Math.floor(Date.now() / 1000);
  const enc = (s: string) =>
    btoa(s).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

  const header  = enc(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = enc(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));

  const sigInput = `${header}.${payload}`;
  const b64 = (sa.private_key ?? "")
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8", binary, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]
  );
  const sig    = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(sigInput));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

  const res  = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${sigInput}.${sigB64}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to obtain Google access token");
  return data.access_token;
}

// ---------------------------------------------------------------------------
// MCP Tool definitions
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: "generate_meme",
    description: "Generate a meme, sticker, or banner image for a meme coin token using AI (Vertex AI Gemini).",
    inputSchema: {
      type: "object",
      properties: {
        prompt:              { type: "string", description: "Description of what to generate" },
        token_name:          { type: "string", description: "Token name, e.g. 'Degen Cat'" },
        token_ticker:        { type: "string", description: "Token ticker, e.g. 'DGCAT'" },
        type:                { type: "string", enum: ["meme", "sticker", "dex_header", "x_header"], description: "Image format" },
        reference_image_url: { type: "string", description: "Optional URL of token logo to incorporate" },
      },
      required: ["prompt", "token_name", "token_ticker", "type"],
    },
  },
  {
    name: "launch_token",
    description: "Register a new meme coin on Bags.fm and receive the token mint address + IPFS metadata URL. The caller must still sign and submit the launch transaction from their Solana wallet.",
    inputSchema: {
      type: "object",
      properties: {
        name:        { type: "string", description: "Token name (max 32 chars)" },
        symbol:      { type: "string", description: "Token symbol (max 10 chars)" },
        description: { type: "string", description: "Token description" },
        image_url:   { type: "string", description: "Token logo URL" },
        twitter:     { type: "string", description: "Twitter/X handle or URL (optional)" },
        telegram:    { type: "string", description: "Telegram group URL (optional)" },
        website:     { type: "string", description: "Website URL (optional)" },
      },
      required: ["name", "symbol", "description", "image_url"],
    },
  },
  {
    name: "get_token_data",
    description: "Fetch metadata and status for a Solana meme coin by its mint address. Checks DegenTools DB then pump.fun as fallback.",
    inputSchema: {
      type: "object",
      properties: {
        token_mint: { type: "string", description: "Solana token mint address" },
      },
      required: ["token_mint"],
    },
  },
  {
    name: "generate_shill_copy",
    description: "Generate marketing copy for a meme coin — shill tweets, Telegram welcome messages, token descriptions, or FOMO announcements.",
    inputSchema: {
      type: "object",
      properties: {
        token_name:   { type: "string", description: "Token name" },
        token_ticker: { type: "string", description: "Token ticker symbol" },
        copy_type: {
          type: "string",
          enum: ["shill_tweets", "telegram_welcome", "token_description", "fomo_announcement"],
          description: "Type of copy to generate",
        },
        count:   { type: "number",  description: "Number of tweets to generate (shill_tweets only, default 5)" },
        context: { type: "string",  description: "Extra context about the token (optional)" },
      },
      required: ["token_name", "token_ticker", "copy_type"],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

async function toolGenerateMeme(
  args: Record<string, unknown>,
  userId: string,
  svc: ReturnType<typeof createClient>
): Promise<string> {
  const { prompt, token_name, token_ticker, type, reference_image_url } = args as Record<string, string>;

  const validTypes = ["meme", "sticker", "dex_header", "x_header"];
  if (!validTypes.includes(type)) throw new Error(`type must be one of: ${validTypes.join(", ")}`);

  const refNote = reference_image_url
    ? "Use the provided reference image as the token's logo/mascot, incorporating its visual identity and colors."
    : "";

  const imagePrompts: Record<string, string> = {
    meme:       `Create a viral, funny meme for crypto token "${token_name}" (${token_ticker}). ${refNote} Bold text, exaggerated expressions, crypto culture references. Request: ${prompt}`,
    sticker:    `Create a cute sticker design for crypto token "${token_name}" (${token_ticker}). ${refNote} Vibrant colors, cartoon style, clean white background. Request: ${prompt}`,
    dex_header: `Create a wide 16:9 banner for DexScreener for token "${token_name}" (${token_ticker}). ${refNote} Dark background, token name prominent, professional trading aesthetic. Request: ${prompt}`,
    x_header:   `Create a wide 16:9 Twitter/X profile banner for token "${token_name}" (${token_ticker}). ${refNote} Clean, modern, branded with token name and ticker. Request: ${prompt}`,
  };

  const parts: unknown[] = [{ text: imagePrompts[type] }];

  // Optionally attach reference image
  if (reference_image_url) {
    try {
      const imgRes = await fetch(reference_image_url, { signal: AbortSignal.timeout(10_000) });
      if (imgRes.ok) {
        const mimeType = imgRes.headers.get("content-type")?.split(";")[0] ?? "image/png";
        if (mimeType.startsWith("image/")) {
          const buf = await imgRes.arrayBuffer();
          if (buf.byteLength <= 4 * 1024 * 1024) {
            const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
            parts.push({ inlineData: { mimeType, data: b64 } });
          }
        }
      }
    } catch { /* skip reference image on error, proceed with text-only prompt */ }
  }

  const accessToken = await getGoogleAccessToken();
  const genRes = await fetch(
    `https://aiplatform.googleapis.com/v1/projects/${Deno.env.get("GOOGLE_CLOUD_PROJECT_ID")}/locations/us-central1/publishers/google/models/gemini-3.1-flash-image-preview:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: { aspectRatio: (type === "dex_header" || type === "x_header") ? "16:9" : "1:1" },
        },
      }),
    }
  );

  if (!genRes.ok) throw new Error(`Vertex AI error: ${genRes.status}`);

  const genData = await genRes.json();
  const responseParts: unknown[] = genData.candidates?.[0]?.content?.parts ?? [];

  let base64Image: string | null = null;
  let mimeType = "image/png";
  for (const part of responseParts as Record<string, unknown>[]) {
    const inline = part.inlineData as Record<string, string> | undefined;
    if (inline?.mimeType?.startsWith("image/")) {
      base64Image = inline.data;
      mimeType    = inline.mimeType;
      break;
    }
  }

  if (!base64Image) {
    throw new Error("Image generation was blocked or returned no image. Try rephrasing your prompt — avoid real people, brands, or sensitive content.");
  }

  // Upload to Supabase storage
  const binary   = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
  const fileName = `${userId}/api_${type}_${Date.now()}.png`;

  const { error: uploadError } = await svc.storage
    .from("generated-content")
    .upload(fileName, binary, { contentType: mimeType, upsert: false });

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  const { data: urlData } = svc.storage.from("generated-content").getPublicUrl(fileName);

  // Persist to generated_content table (same as generate-content function)
  const { data: record } = await svc
    .from("generated_content")
    .insert({
      user_id: userId,
      type,
      title:     (prompt as string).slice(0, 100),
      prompt,
      image_url: urlData.publicUrl,
      metadata:  { tokenName: token_name, tokenTicker: token_ticker, source: "mcp_api" },
    })
    .select("id")
    .single();

  return JSON.stringify({ image_url: urlData.publicUrl, content_id: record?.id ?? null });
}

async function toolLaunchToken(args: Record<string, unknown>): Promise<string> {
  const { name, symbol, description, image_url, twitter, telegram, website } =
    args as Record<string, string>;

  if (!name || !symbol || !description || !image_url)
    throw new Error("name, symbol, description, and image_url are required");
  if (name.length > 32)
    throw new Error("Token name must be 32 characters or fewer");
  if (symbol.replace("$", "").length > 10)
    throw new Error("Token symbol must be 10 characters or fewer");

  const BAGS_API_KEY = Deno.env.get("BAGS_API_KEY");
  if (!BAGS_API_KEY) throw new Error("BAGS_API_KEY not configured");

  const formData = new FormData();
  formData.append("name",        name);
  formData.append("symbol",      symbol.toUpperCase().replace("$", ""));
  formData.append("description", description.slice(0, 1000));
  formData.append("imageUrl",    image_url);
  if (twitter)  formData.append("twitter",  twitter);
  if (telegram) formData.append("telegram", telegram);
  if (website)  formData.append("website",  website);

  const res  = await fetch("https://public-api-v2.bags.fm/api/v1/token-launch/create-token-info", {
    method: "POST",
    headers: { "x-api-key": BAGS_API_KEY },
    body: formData,
  });
  const data = await res.json();

  if (!res.ok || !data.success)
    throw new Error(data.error || "Bags.fm rejected the token creation request");

  return JSON.stringify({
    token_mint: data.response.tokenMint,
    ipfs_url:   data.response.tokenMetadata,
    note: "Token registered. Sign and submit the launch transaction from your Solana wallet to complete the launch.",
  });
}

async function toolGetTokenData(
  args: Record<string, unknown>,
  svc: ReturnType<typeof createClient>
): Promise<string> {
  const { token_mint } = args as Record<string, string>;
  if (!token_mint) throw new Error("token_mint is required");

  // 1. Check DegenTools DB
  const { data: dbToken } = await svc
    .from("bags_tokens")
    .select("token_mint, name, symbol, description, image_url, status, twitter, telegram, website, created_at")
    .eq("token_mint", token_mint)
    .single();

  if (dbToken) {
    return JSON.stringify({ ...dbToken, source: "degentools" });
  }

  // 2. Fallback: pump.fun public API
  const pfRes = await fetch(
    `https://frontend-api.pump.fun/coins/${token_mint}`,
    { signal: AbortSignal.timeout(8_000) }
  );

  if (pfRes.ok) {
    const d = await pfRes.json();
    return JSON.stringify({
      token_mint,
      name:        d.name,
      symbol:      d.symbol,
      description: d.description,
      image_url:   d.image_uri,
      market_cap:  d.usd_market_cap,
      source:      "pump.fun",
    });
  }

  throw new Error(`Token not found: ${token_mint}`);
}

async function toolGenerateShillCopy(args: Record<string, unknown>): Promise<string> {
  const { token_name, token_ticker, copy_type, count = 5, context = "" } =
    args as Record<string, unknown>;

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

  const ctx = context ? `\n\nAdditional context: ${context}` : "";

  const systemPrompts: Record<string, string> = {
    shill_tweets:       `You are a crypto marketing expert. Write exactly ${count} shill tweets for ${token_name} (${token_ticker}). Number each tweet 1–${count}. Max 280 chars each. Use crypto slang, emojis, and FOMO.${ctx}`,
    telegram_welcome:   `You are a crypto marketing expert. Write a Telegram community welcome message for ${token_name} (${token_ticker}). Include: warm welcome, what the token is, how to buy, key links section, and community rules. Use emojis.${ctx}`,
    token_description:  `You are a crypto marketing expert. Write a compelling token description for ${token_name} (${token_ticker}). 2–3 paragraphs, professional yet hype, suitable for a website and DEX listings.${ctx}`,
    fomo_announcement:  `You are a crypto marketing expert. Write a single FOMO-inducing announcement post for ${token_name} (${token_ticker}). Suitable for Telegram and Twitter. Max 200 words. Heavy emojis.${ctx}`,
  };

  const system = systemPrompts[copy_type as string];
  if (!system) throw new Error(`copy_type must be one of: ${Object.keys(systemPrompts).join(", ")}`);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: system }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 8190 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  // ---- Auth: require X-DegenTools-API-Key ----
  const rawApiKey = req.headers.get("X-DegenTools-API-Key");
  if (!rawApiKey) return rpcError(null, -32001, "Missing X-DegenTools-API-Key header", 401);

  const svc = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const keyRecord = await validateApiKey(rawApiKey, svc);
  if (!keyRecord) return rpcError(null, -32001, "Invalid or revoked API key", 401);

  const rateCheck = await checkRateLimits(keyRecord, svc);
  if (!rateCheck.ok) {
    logRequest(svc, keyRecord.id, "rate_limited", 429, Date.now() - startTime);
    return rpcError(null, -32029, rateCheck.error!, 429);
  }

  // ---- Parse JSON-RPC 2.0 ----
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, "Parse error: request body must be valid JSON", 400);
  }

  const { jsonrpc, method, params, id } = body;

  if (jsonrpc !== "2.0") {
    return rpcError(id ?? null, -32600, "Invalid Request: jsonrpc must be '2.0'", 400);
  }

  // ---- initialize ----
  if (method === "initialize") {
    logRequest(svc, keyRecord.id, "initialize", 200, Date.now() - startTime);
    return rpcResult(id, {
      protocolVersion: "2024-11-05",
      capabilities:    { tools: {} },
      serverInfo:      { name: "DegenTools MCP", version: "1.0.0" },
    });
  }

  // ---- tools/list ----
  if (method === "tools/list") {
    logRequest(svc, keyRecord.id, "tools/list", 200, Date.now() - startTime);
    return rpcResult(id, { tools: TOOLS });
  }

  // ---- tools/call ----
  if (method === "tools/call") {
    const p       = params as Record<string, unknown> ?? {};
    const tool    = p.name as string;
    const args    = (p.arguments ?? {}) as Record<string, unknown>;

    let text: string;
    try {
      if      (tool === "generate_meme")       text = await toolGenerateMeme(args, keyRecord.user_id, svc);
      else if (tool === "launch_token")        text = await toolLaunchToken(args);
      else if (tool === "get_token_data")      text = await toolGetTokenData(args, svc);
      else if (tool === "generate_shill_copy") text = await toolGenerateShillCopy(args);
      else return rpcError(id, -32601, `Unknown tool: ${tool}`, 404);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      logRequest(svc, keyRecord.id, tool ?? "unknown", 500, Date.now() - startTime, { error: msg });
      // MCP spec: tool errors are returned as result.isError, not as JSON-RPC errors
      return rpcResult(id, { content: [{ type: "text", text: `Error: ${msg}` }], isError: true });
    }

    logRequest(svc, keyRecord.id, tool, 200, Date.now() - startTime, { argsKeys: Object.keys(args) });
    return rpcResult(id, { content: [{ type: "text", text }], isError: false });
  }

  return rpcError(id ?? null, -32601, `Method not found: ${method}`, 404);
});
