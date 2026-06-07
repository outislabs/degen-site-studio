import { verifyAnyToken } from "../_shared/cliJWT.ts";
import { generateText, checkRateLimit } from "../_shared/gemini.ts";

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

const FORMAT_PROMPTS: Record<string, string> = {
  thread: `Write a numbered X (Twitter) thread. Rules:
- Each tweet is numbered (1/, 2/, etc.)
- Each tweet is 280 characters or fewer
- Minimum 5 tweets, maximum 20
- Separate tweets with a blank line
- The thread should tell a complete story with a hook, body, and call-to-action`,

  blog: `Write a markdown blog post. Include:
- A compelling H1 title
- An introduction paragraph
- 3–5 sections with H2 headers
- Bullet points or numbered lists where appropriate
- A conclusion paragraph
- Target 600–1200 words
- Crypto/web3 audience tone: informative but accessible`,

  landing: `Write punchy landing page copy. Include these sections:
- HERO: A bold headline (max 10 words) and sub-headline (max 25 words)
- VALUE PROPS: 3 short bullet points (max 15 words each) highlighting key benefits
- SOCIAL PROOF: One testimonial-style quote (fabricated but believable)
- CTA: A call-to-action headline and button text
- ABOUT: 2–3 sentences describing the project

Format each section with its name as a label in CAPS followed by a colon. Keep it punchy, crypto-native, and conversion-focused.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const cliUser = await verifyAnyToken(req);
    if (!cliUser) return json({ error: "Unauthorized" }, 401);

    if (!checkRateLimit(`user:${cliUser.userId}`)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } },
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) return json({ error: "GEMINI_API_KEY not configured" }, 500);

    const body = await req.json();
    const { topic, format } = body;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0)
      return json({ error: "topic is required" }, 400);
    if (!format || !FORMAT_PROMPTS[format])
      return json({ error: "format must be one of: thread, blog, landing" }, 400);

    const system = FORMAT_PROMPTS[format];
    const output = await generateText(topic, system, geminiApiKey);

    return json({ output });

  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Rate limit exceeded")) {
      return json({ error: err.message }, 429);
    }
    console.error("cli-ai-longform error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
