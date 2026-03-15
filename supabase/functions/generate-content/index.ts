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

async function generateImage(prompt: string, geminiApiKey: string): Promise<string | null> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini image error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

async function generateText(prompt: string, system: string, anthropicApiKey: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${system}\n\n${prompt}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
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
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY not configured");
    if (!anthropicApiKey) throw new Error("ANTHROPIC_API_KEY not configured");

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

    // --- IMAGE GENERATION ---
    const imageTypes = ["meme", "sticker", "social_post", "dex_header", "x_header"];
    if (imageTypes.includes(type)) {
      let imagePrompt = "";

      if (type === "meme") {
        imagePrompt = `Create a viral, funny meme image for a cryptocurrency token called "${tokenName}" ($${tokenTicker}). The meme should be attention-grabbing, humorous, and crypto-community appropriate. Style: bold text, exaggerated expressions, crypto culture references. User request: ${prompt}`;
      } else if (type === "sticker") {
        imagePrompt = `Create a cute, bold sticker design for a cryptocurrency token called "${tokenName}" ($${tokenTicker}). Clean edges, vibrant colors, works well at small sizes. Style: cartoon/chibi, expressive, white background. User request: ${prompt}`;
      } else if (type === "dex_header") {
        imagePrompt = `Create a wide banner header (1500x500, 3:1 ratio) for cryptocurrency token "${tokenName}" ($${tokenTicker}) for DexScreener. Visually striking, token name/ticker prominent, professional crypto/trading aesthetic. Dark or vibrant background, chart motifs, bold typography. User request: ${prompt}`;
      } else if (type === "x_header") {
        imagePrompt = `Create a wide banner header (1500x500, 3:1 ratio) for cryptocurrency token "${tokenName}" ($${tokenTicker}) for Twitter/X profile. Clean, branded, professional. Include token name and ticker. Modern design, crypto branding. User request: ${prompt}`;
      } else {
        imagePrompt = `Create a professional social media graphic for cryptocurrency token "${tokenName}" ($${tokenTicker}). Eye-catching, suitable for Twitter/X or Telegram. Include token name and ticker prominently. User request: ${prompt}`;
      }

      const base64Image = await generateImage(imagePrompt, geminiApiKey);
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
          metadata: { tokenName, tokenTicker },
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
      const system = `You are a crypto marketing expert. Generate compelling marketing copy for a cryptocurrency token called "${tokenName}" ($${tokenTicker}). The copy should be engaging, hype-worthy, and suitable for crypto communities on Twitter/X and Telegram. Use emojis, crypto slang, and create FOMO. Keep it concise and punchy.`;

      const generatedText = await generateText(prompt, system, anthropicApiKey);

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
