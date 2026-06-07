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

const VOICE_PROMPTS: Record<string, string> = {
  degen: "You write in crypto degen style: WAGMI, gm, LFG, moon, aping in, based, ngmi, touch grass. Use crypto slang, emojis, and community memes. Every tweet should feel like it came from a true degen.",
  professional: "You write in a professional, institutional tone. Clear, concise, credible. No slang. Suitable for fintech audiences and sophisticated investors.",
  hype: "You write high-energy, FOMO-inducing crypto hype. Urgency, excitement, big claims. Make people feel like they're missing the biggest opportunity. Heavy emojis and caps for emphasis.",
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
    const { topic, count, voice } = body;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0)
      return json({ error: "topic is required" }, 400);
    if (!count || typeof count !== "number" || count < 1 || count > 20)
      return json({ error: "count must be a number between 1 and 20" }, 400);
    if (!voice || !VOICE_PROMPTS[voice])
      return json({ error: "voice must be one of: degen, professional, hype" }, 400);

    const system = `${VOICE_PROMPTS[voice]}

Generate exactly ${count} tweet variants about the given topic. Each tweet must:
- Be a standalone tweet (no numbering prefix in the tweet text itself)
- Be 280 characters or fewer
- Be separated by the delimiter: ---TWEET---

Output ONLY the tweets separated by ---TWEET---. No intro text, no explanations.`;

    const raw = await generateText(topic, system, geminiApiKey);

    // Split on delimiter and clean up
    const variants = raw
      .split(/---TWEET---/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, count);

    // If Gemini gave fewer than requested, pad to requested count using what we have
    while (variants.length < count && variants.length > 0) {
      variants.push(variants[variants.length - 1]);
    }

    return json({
      output: variants[0] ?? "",
      variants,
    });

  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Rate limit exceeded")) {
      return json({ error: err.message }, 429);
    }
    console.error("cli-ai-tweet error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
