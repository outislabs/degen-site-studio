import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { type, prompt, tokenName, tokenTicker, siteId } = await req.json();

    if (!type || !prompt) throw new Error("Missing type or prompt");

    // For image generation types
    const imageTypes = ["meme", "sticker", "social_post", "dex_header", "x_header"];
    if (imageTypes.includes(type)) {
      let systemPrompt = "";
      if (type === "meme") {
        systemPrompt = `Create a viral, funny meme image for a cryptocurrency token called "${tokenName}" ($${tokenTicker}). The meme should be attention-grabbing, humorous, and crypto-community appropriate. Style: bold text, exaggerated expressions, crypto culture references.`;
      } else if (type === "sticker") {
        systemPrompt = `Create a cute, bold sticker design for a cryptocurrency token called "${tokenName}" ($${tokenTicker}). The sticker should have clean edges, vibrant colors, and work well at small sizes. Style: cartoon/chibi, expressive, on a clean white background. No text unless specifically requested.`;
      } else if (type === "dex_header") {
        systemPrompt = `Create a wide banner header image (1500x500 pixels aspect ratio, 3:1 wide) for a cryptocurrency token called "${tokenName}" ($${tokenTicker}) to be used as a DexScreener profile header. The banner should be visually striking, include the token name/ticker prominently, and have a professional crypto/trading aesthetic. Style: wide panoramic banner, dark or vibrant background, chart/trading motifs, bold typography.`;
      } else if (type === "x_header") {
        systemPrompt = `Create a wide banner header image (1500x500 pixels aspect ratio, 3:1 wide) for a cryptocurrency token called "${tokenName}" ($${tokenTicker}) to be used as a Twitter/X profile header banner. The banner should be clean, branded, and professional. Include the token name and ticker. Style: wide panoramic banner, modern design, crypto branding, suitable for social media profile header.`;
      } else {
        systemPrompt = `Create a professional social media graphic for a cryptocurrency token called "${tokenName}" ($${tokenTicker}). The image should be eye-catching, professional, and suitable for Twitter/X or Telegram. Include the token name and ticker prominently.`;
      }

      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            { role: "user", content: `${systemPrompt}\n\nUser request: ${prompt}` },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!imageResponse.ok) {
        const status = imageResponse.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${status}`);
      }

      const imageData = await imageResponse.json();
      const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      const aiText = imageData.choices?.[0]?.message?.content || "";

      let imageUrl = null;

      if (base64Image) {
        // Extract base64 data and upload to storage
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const fileName = `${user.id}/${type}_${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("generated-content")
          .upload(fileName, binaryData, { contentType: "image/png", upsert: false });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage.from("generated-content").getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      // Save to database
      const { data: record, error: insertError } = await supabase
        .from("generated_content")
        .insert({
          user_id: user.id,
          site_id: siteId || null,
          type,
          title: prompt.slice(0, 100),
          prompt,
          content_text: aiText,
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

    // Marketing copy (text only)
    if (type === "marketing_copy") {
      const systemPrompt = `You are a crypto marketing expert. Generate compelling marketing copy for a cryptocurrency token called "${tokenName}" ($${tokenTicker}). The copy should be engaging, hype-worthy, and suitable for crypto communities on Twitter/X and Telegram. Use emojis, crypto slang, and create FOMO. Keep it concise and punchy.`;

      const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!textResponse.ok) {
        const status = textResponse.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${status}`);
      }

      const textData = await textResponse.json();
      const generatedText = textData.choices?.[0]?.message?.content || "";

      const { data: record, error: insertError } = await supabase
        .from("generated_content")
        .insert({
          user_id: user.id,
          site_id: siteId || null,
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

    throw new Error(`Unknown type: ${type}`);
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
