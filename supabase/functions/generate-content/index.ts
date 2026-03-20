import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

const VALID_TYPES = ["meme", "sticker", "social_post", "marketing_copy", "dex_header", "x_header"];
const MAX_PROMPT_LENGTH = 1000;
const MAX_TOKEN_NAME_LENGTH = 100;
const MAX_TOKEN_TICKER_LENGTH = 20;

function validateInput(body: Record<string, unknown>): { valid: boolean; error?: string } {
  const { type, prompt, tokenName, tokenTicker, siteId } = body;
  if (!type || typeof type !== "string" || !VALID_TYPES.includes(type)) {
    return { valid: false, error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` };
  }
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return { valid: false, error: "Prompt is required" };
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer` };
  }
  if (tokenName && (typeof tokenName !== "string" || tokenName.length > MAX_TOKEN_NAME_LENGTH)) {
    return { valid: false, error: `Token name must be ${MAX_TOKEN_NAME_LENGTH} characters or fewer` };
  }
  if (tokenTicker && (typeof tokenTicker !== "string" || tokenTicker.length > MAX_TOKEN_TICKER_LENGTH)) {
    return { valid: false, error: `Token ticker must be ${MAX_TOKEN_TICKER_LENGTH} characters or fewer` };
  }
  if (siteId && (typeof siteId !== "string" || !/^[0-9a-f-]{36}$/.test(siteId))) {
    return { valid: false, error: "Invalid site ID format" };
  }
  return { valid: true };
}

function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

// Fetch image from URL and convert to base64
async function getGoogleAccessToken(): Promise<string> {
  const raw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY") || "{}";
  const sa = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payload = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signingInput = header + "." + payload;
  const pem = sa.private_key || "";
  const b64 = pem.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\s/g, "");
  const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", binary, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = signingInput + "." + sigB64;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + jwt,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("No access token: " + JSON.stringify(data));
  return data.access_token;
}

async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000); // 10s timeout
    const res = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/png';
    const mimeType = contentType.split(';')[0].trim();
    if (!mimeType.startsWith('image/')) return null;
    const arrayBuffer = await res.arrayBuffer();
    // Skip very large images (>4MB) to avoid timeout
    if (arrayBuffer.byteLength > 4 * 1024 * 1024) {
      console.log('Reference image too large, skipping');
      return null;
    }
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);
    return { data: base64, mimeType };
  } catch (e) {
    console.error('fetchImageAsBase64 error:', e);
    return null;
  }
}

async function generateImage(
  prompt: string,
  geminiApiKey: string,
  referenceImageUrl?: string,
  contentType?: string
): Promise<string | null> {
  // Build parts array — text prompt first, then optional reference image
  const parts: any[] = [{ text: prompt }];

  if (referenceImageUrl) {
    console.log('Fetching reference image:', referenceImageUrl);
    const imageData = await fetchImageAsBase64(referenceImageUrl);
    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data,
        }
      });
      console.log('Reference image attached successfully');
    } else {
      console.log('Could not fetch reference image, proceeding without it');
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90_000); // 90s timeout
  const accessToken = await getGoogleAccessToken();
  const response = await fetch(
    `https://aiplatform.googleapis.com/v1/projects/${Deno.env.get("GOOGLE_CLOUD_PROJECT_ID")}/locations/us-central1/publishers/google/models/gemini-3.1-flash-image-preview:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"], imageConfig: { aspectRatio: (contentType === "dex_header" || contentType === "x_header") ? "16:9" : "1:1" } },
      }),
    }
  );
  clearTimeout(timeoutId);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini image error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const responseParts = data.candidates?.[0]?.content?.parts || [];

  const candidate = data.candidates?.[0];
  console.log('Gemini finish reason:', candidate?.finishReason);
  console.log('Gemini safety ratings:', JSON.stringify(candidate?.safetyRatings));
  console.log('Gemini response parts count:', responseParts.length);
  for (const part of responseParts) {
    console.log('Part type:', part.text ? 'text' : part.inlineData ? 'image' : 'unknown');
    if (part.text) console.log('Text response:', part.text.slice(0, 200));
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  console.log('No image returned by Gemini');
  return null;
}

async function generateText(prompt: string, system: string, geminiApiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${system}\n\n${prompt}` }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 8190,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini text error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!checkRateLimit(`user:${user.id}`)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
      });
    }

    const body = await req.json();
    const validation = validateInput(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const type = body.type as string;
    const prompt = sanitize(body.prompt as string);
    const tokenName = sanitize((body.tokenName as string) || "My Token");
    const tokenTicker = sanitize((body.tokenTicker as string) || "TOKEN");
    const siteId = (body.siteId as string) || null;

    // Optional reference image — can be token logo URL or user uploaded image URL
    const referenceImageUrl = (body.referenceImageUrl as string) || null;

    // --- IMAGE GENERATION ---
    const imageTypes = ["meme", "sticker", "social_post", "dex_header", "x_header"];
    if (imageTypes.includes(type)) {
      let imagePrompt = "";
      const referenceNote = referenceImageUrl
        ? `Use the provided reference image as the token's logo/mascot and incorporate its visual identity, colors, and character into the generated image.`
        : '';

      if (type === "meme") {
        imagePrompt = `Create a viral, funny meme image for a cryptocurrency token called "${tokenName}" (${tokenTicker}). ${referenceNote} The meme should be attention-grabbing, humorous, and crypto-community appropriate. Style: bold text, exaggerated expressions, crypto culture references. User request: ${prompt}`;
      } else if (type === "sticker") {
        imagePrompt = `Create a cute, bold sticker design for a cryptocurrency token called "${tokenName}" (${tokenTicker}). ${referenceNote} Clean edges, vibrant colors, works well at small sizes. Style: cartoon/chibi, expressive, white background. User request: ${prompt}`;
      } else if (type === "dex_header") {
        imagePrompt = `Create a wide banner header (1500x500, 3:1 ratio) for cryptocurrency token "${tokenName}" (${tokenTicker}) for DexScreener. ${referenceNote} Visually striking, token name/ticker prominent, professional crypto/trading aesthetic. Dark or vibrant background, chart motifs, bold typography. User request: ${prompt}`;
      } else if (type === "x_header") {
        imagePrompt = `Create a wide banner header (1500x500, 3:1 ratio) for cryptocurrency token "${tokenName}" (${tokenTicker}) for Twitter/X profile. ${referenceNote} Clean, branded, professional. Include token name and ticker. Modern design, crypto branding. User request: ${prompt}`;
      } else {
        imagePrompt = `Create a professional social media graphic for cryptocurrency token "${tokenName}" (${tokenTicker}). ${referenceNote} Eye-catching, suitable for Twitter/X or Telegram. Include token name and ticker prominently. User request: ${prompt}`;
      }

      const base64Image = await generateImage(imagePrompt, geminiApiKey, referenceImageUrl || undefined, type);
      if (!base64Image) {
        return new Response(JSON.stringify({ error: "Image generation was blocked or failed. Try rephrasing your prompt — avoid real people's names, brands, or sensitive content." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      let imageUrl = null;

      if (base64Image) {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const fileName = `${user.id}/${type}_${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("generated-content")
          .upload(fileName, binaryData, { contentType: "image/png", upsert: false });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from("generated-content")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const { data: record, error: insertError } = await supabase
        .from("generated_content")
        .insert({
          user_id: user.id,
          site_id: siteId,
          type,
          title: prompt.slice(0, 100),
          prompt,
          image_url: imageUrl,
          metadata: { tokenName, tokenTicker, referenceImageUrl },
        })
        .select()
        .single();

      if (insertError) throw new Error(`Save failed: ${insertError.message}`);

      return new Response(JSON.stringify({ success: true, data: record }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- TEXT GENERATION (marketing copy) ---
    if (type === "marketing_copy") {
      // Detect content type from prompt
      const lowerPrompt = prompt.toLowerCase();
      let system = "";
      if (lowerPrompt.includes("telegram welcome")) {
        system = `You are a crypto marketing expert. Write ONLY a Telegram welcome message for the token ${tokenName} (${tokenTicker}). Include: warm welcome, what the token is, how to buy, key links section, and community rules. Use emojis. Do not write tweets or any other content type.`;
      } else if (lowerPrompt.includes("shill tweet") || lowerPrompt.includes("shill tweets")) {
        system = `You are a crypto marketing expert. Write ONLY ${prompt.match(/\d+/)?.[0] || 5} shill tweets for ${tokenName} (${tokenTicker}). Number each tweet. Max 280 chars each. Use crypto slang, emojis, and FOMO. Do not include Telegram messages or other content.`;
      } else if (lowerPrompt.includes("token description")) {
        system = `You are a crypto marketing expert. Write ONLY a concise token description for ${tokenName} (${tokenTicker}). 2-3 paragraphs. Professional yet hype. Suitable for website and DEX listings.`;
      } else if (lowerPrompt.includes("fomo announcement") || lowerPrompt.includes("announcement")) {
        system = `You are a crypto marketing expert. Write ONLY a single FOMO-inducing announcement post for ${tokenName} (${tokenTicker}). Suitable for Telegram and Twitter. Max 200 words. Heavy emojis.`;
      } else {
        system = `You are a crypto marketing expert. Generate compelling marketing copy for ${tokenName} (${tokenTicker}) based on this request: "${prompt}". Be specific to the request type only. Use emojis and crypto slang.`;
      }

      const generatedText = await generateText(prompt, system, geminiApiKey);

      const { data: record, error: insertError } = await supabase
        .from("generated_content")
        .insert({
          user_id: user.id,
          site_id: siteId,
          type,
          title: prompt.slice(0, 100),
          prompt,
          content_text: generatedText,
          metadata: { tokenName, tokenTicker },
        })
        .select()
        .single();

      if (insertError) throw new Error(`Save failed: ${insertError.message}`);

      return new Response(JSON.stringify({ success: true, data: record }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid content type" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
