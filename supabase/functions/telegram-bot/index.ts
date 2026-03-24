import { createClient } from "npm:@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TG_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// ── Build wizard ──────────────────────────────────────────────────────────────
interface BuildSession {
  step: 1 | 2 | 3;
  tokenData?: {
    name: string;
    symbol: string;
    description: string;
    image_uri: string;
    mint: string;
    chain: string;
    website: string;
    twitter: string;
    telegram: string;
  };
}
async function getSession(chatId: number): Promise<BuildSession | null> {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data } = await admin
    .from("telegram_build_sessions")
    .select("step, token_data")
    .eq("chat_id", chatId)
    .single();
  if (!data) return null;
  return { step: data.step as 1 | 2 | 3, tokenData: data.token_data ?? undefined };
}

async function setSession(chatId: number, session: BuildSession): Promise<void> {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  await admin.from("telegram_build_sessions").upsert({
    chat_id: chatId,
    step: session.step,
    token_data: session.tokenData ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "chat_id" });
}

async function deleteSession(chatId: number): Promise<void> {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  await admin.from("telegram_build_sessions").delete().eq("chat_id", chatId);
}

const TEMPLATES: Record<string, { layout: string; theme: string; label: string }> = {
  "1":  { layout: "classic",       theme: "degen-dark",    label: "Minimal Dark" },
  "2":  { layout: "classic",       theme: "pepe-classic",  label: "Pepe Classic" },
  "3":  { layout: "cartoon",       theme: "golden-ape",    label: "Cartoon Golden" },
  "4":  { layout: "cartoon",       theme: "arctic-whale",  label: "Cartoon Arctic" },
  "5":  { layout: "mascot-hero",   theme: "arctic-whale",  label: "Mascot Hero" },
  "6":  { layout: "cinematic",     theme: "midnight-chrome", label: "Cinematic" },
  "7":  { layout: "cartoon-sky",   theme: "cartoon-sky",   label: "Cartoon Sky" },
  "8":  { layout: "comic-hero",    theme: "golden-ape",    label: "Comic Hero" },
  "9":  { layout: "terminal",      theme: "matrix",        label: "Terminal" },
  "10": { layout: "neon-cyberpunk",theme: "cyber-punk",    label: "Neon Cyberpunk" },
  "11": { layout: "luxury",        theme: "degen-dark",    label: "Luxury" },
  "12": { layout: "retro-8bit",    theme: "degen-dark",    label: "Retro 8-Bit" },
  "13": { layout: "newspaper",     theme: "degen-dark",    label: "Newspaper" },
  "14": { layout: "minimalist",    theme: "degen-dark",    label: "Minimalist" },
};
// ─────────────────────────────────────────────────────────────────────────────

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TG_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

async function checkUserPlan(chatId: number): Promise<string | null> {
  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data } = await admin
      .from("user_subscriptions")
      .select("plan, status")
      .eq("telegram_chat_id", chatId)
      .eq("status", "active")
      .single();
    return data?.plan || null;
  } catch {
    return null;
  }
}

function isPaidPlan(plan: string | null): boolean {
  return plan !== null && plan !== "free" && plan !== "starter";

async function fetchTokenStats(input: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/fetch-pumpfun-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ mint: input }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getUserIdByChatId(chatId: number): Promise<string | null> {
  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data } = await admin
      .from("user_subscriptions")
      .select("user_id")
      .eq("telegram_chat_id", chatId)
      .eq("status", "active")
      .single();
    return data?.user_id || null;
  } catch {
    return null;
  }
}

async function geminiGenerate(prompt: string): Promise<string | null> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
  if (!GEMINI_API_KEY) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
        signal: AbortSignal.timeout(20000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

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

async function generateMemeImage(prompt: string): Promise<string | null> {
  try {
    const accessToken = await getGoogleAccessToken();
    const projectId = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID");
    const res = await fetch(
      `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-3.1-flash-image-preview:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"], imageConfig: { aspectRatio: "1:1" } },
        }),
        signal: AbortSignal.timeout(90000),
      }
    );
    if (!res.ok) { console.error("Vertex image error:", res.status, await res.text()); return null; }
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("generateMemeImage error:", e);
    return null;
  }
}

async function uploadImageToStorage(dataUrl: string): Promise<string | null> {
  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const fileName = `telegram/meme_${Date.now()}_${Math.random().toString(36).slice(2)}.png`;
    const { error } = await admin.storage
      .from("generated-content")
      .upload(fileName, binaryData, { contentType: "image/png", upsert: false });
    if (error) { console.error("Storage upload error:", error); return null; }
    const { data: urlData } = admin.storage.from("generated-content").getPublicUrl(fileName);
    return urlData.publicUrl;
  } catch (e) {
    console.error("uploadImageToStorage error:", e);
    return null;
  }
}

async function sendPhoto(chatId: number, photoUrl: string, caption: string) {
  await fetch(`${TG_API}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption, parse_mode: "Markdown" }),
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });

  try {
    const update = await req.json();
    const message = update?.message;
    if (!message?.text) return new Response("ok", { status: 200 });

    const chatId: number = message.chat.id;
    const text = message.text.trim();
    const parts = text.split(/\s+/);
    const command = parts[0].toLowerCase().split("@")[0];
    const args = parts.slice(1);

    // ── Build wizard: intercept free-text replies for active sessions ─────────
    const session = await getSession(chatId);
    if (session && !text.startsWith("/")) {
      if (session.step === 1) {
        await sendMessage(chatId, "🔍 Looking up your token...");
        const tokenData = await fetchTokenStats(text);
        if (!tokenData || tokenData.error) {
          await sendMessage(chatId, "❌ Token not found. Paste a valid contract address or Bags.fm link, or send /build to start over.");
          return new Response("ok", { status: 200 });
        }
        await setSession(chatId, { step: 2, tokenData });
        const mcap = tokenData.market_cap > 0 ? `$${(tokenData.market_cap / 1000).toFixed(1)}K` : "N/A";
        await sendMessage(chatId, [
          `*${tokenData.name}* ($${tokenData.symbol})`,
          tokenData.description ? `📝 ${tokenData.description.slice(0, 120)}${tokenData.description.length > 120 ? "…" : ""}` : "",
          `📊 Market Cap: ${mcap}`,
          "",
          "Is this your token? Reply *yes* or *no*.",
        ].filter(Boolean).join("\n"));

      } else if (session.step === 2) {
        const reply = text.toLowerCase();
        if (reply === "yes" || reply === "y") {
          await setSession(chatId, { ...session, step: 3 });
          await sendMessage(chatId, [
            "🎨 Choose a template:",
            "",
            "1. Minimal Dark",
            "2. Pepe Classic",
            "3. Cartoon Golden",
            "4. Cartoon Arctic",
            "5. Mascot Hero",
            "6. Cinematic",
            "7. Cartoon Sky",
            "8. Comic Hero",
            "9. Terminal",
            "10. Neon Cyberpunk",
            "11. Luxury",
            "12. Retro 8-Bit",
            "13. Newspaper",
            "14. Minimalist",
            "",
            "Reply with the number.",
          ].join("\n"));
        } else {
          await deleteSession(chatId);
          await sendMessage(chatId, "No problem! Send /build again with a different address.");
        }

      } else if (session.step === 3) {
        const tpl = TEMPLATES[text];
        if (!tpl) {
          await sendMessage(chatId, "❌ Please reply with a number from 1 to 14.");
          return new Response("ok", { status: 200 });
        }
        await deleteSession(chatId);

        const userId = await getUserIdByChatId(chatId);
        if (!userId) {
          await sendMessage(chatId, "❌ Your Telegram isn't linked to an active DegenTools account. Use /connect first, then run /build again.");
          return new Response("ok", { status: 200 });
        }

        const td = session.tokenData!;
        const ticker = td.symbol.toLowerCase();
        const siteData = {
          name: td.name,
          ticker: td.symbol,
          tagline: "",
          description: td.description || "",
          logoUrl: td.image_uri || "",
          blockchain: td.chain || "solana",
          contractAddress: td.mint || "",
          totalSupply: "1,000,000,000",
          buyTax: 0,
          sellTax: 0,
          distribution: { lp: 50, team: 10, marketing: 15, burn: 25 },
          liquidityStatus: "locked",
          socials: {
            telegram: td.telegram || "",
            twitter: td.twitter || "",
            discord: "",
            dex: "",
          },
          roadmap: [
            { id: "1", title: "Phase 1: Launch", items: ["Token launch", "Community building", "Initial marketing push"] },
            { id: "2", title: "Phase 2: Growth", items: ["CEX listings", "Partnerships", "Utility development"] },
            { id: "3", title: "Phase 3: Moon", items: ["Major exchange listing", "Global marketing", "Ecosystem expansion"] },
          ],
          theme: tpl.theme,
          layout: tpl.layout,
          showCountdown: false,
          launchDate: null,
        };

        const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { error: insertError } = await admin.from("sites").insert({
          user_id: userId,
          name: td.name,
          ticker: td.symbol,
          slug: ticker,
          data: siteData,
        });

        if (insertError) {
          console.error("sites insert error:", insertError);
          if (insertError.code === "23505") {
            await sendMessage(chatId, `⚠️ A site for *$${td.symbol}* already exists at https://${ticker}.degentools.co\n\nVisit [degentools.co](https://degentools.co) to edit it.`);
          } else {
            await sendMessage(chatId, "❌ Failed to create your site. Please try again or visit degentools.co.");
          }
          return new Response("ok", { status: 200 });
        }

        await sendMessage(chatId, [
          `🌐 Your site is live at https://${ticker}.degentools.co`,
          "",
          `Template: *${tpl.label}*`,
          "",
          "Visit [degentools.co](https://degentools.co) to customise it.",
        ].join("\n"));
      }

      return new Response("ok", { status: 200 });
    }
    // ─────────────────────────────────────────────────────────────────────────

    switch (command) {
      case "/start":
        await sendMessage(chatId, [
          "👋 *Welcome to DegenTools Bot!*",
          "",
          "Your on-chain toolkit, right in Telegram.",
          "",
          "🔧 *Commands:*",
          "/stats `<mint_or_ticker>` — Token stats",
          "/shill `<ticker>` — Generate shill copy _(Degen+)_",
          "/meme `<ticker> <prompt>` — Meme caption _(Degen+)_",
          "/site `<ticker>` — Get token site URL",
          "/build — Build a token website",
          "/fees — How to check claimable fees",
          "/connect — Link your DegenTools account",
          "/help — Show this menu",
          "",
          "Powered by [DegenTools](https://degentools.co) 🚀",
        ].join("\n"));
        break;

      case "/help":
        await sendMessage(chatId, [
          "🛠 *DegenTools Bot Commands*",
          "",
          "/stats `<mint_or_ticker>` — Token data from pump.fun, Bags.fm, or DexScreener",
          "/shill `<ticker>` — AI-generated shill copy _(Degen+)_",
          "/meme `<ticker> <prompt>` — Meme caption + studio link _(Degen+)_",
          "/site `<ticker>` — Your token's DegenTools site URL",
          "/build — Build a token website step-by-step",
          "/fees — How to check and claim LP fees",
          "/connect — Link your DegenTools account",
          "/help — Show this menu",
        ].join("\n"));
        break;

      case "/connect": {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/connect-telegram`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ action: "generate_token", chatId }),
          signal: AbortSignal.timeout(10000),
        });
        const data = await res.json();
        if (!data.link) { await sendMessage(chatId, "❌ Failed to generate connection link. Try again."); break; }
        await sendMessage(chatId, [
          "🔗 *Connect your DegenTools account*",
          "",
          "Click the link below to link your Telegram to DegenTools.",
          "The link expires in *15 minutes*.",
          "",
          data.link,
        ].join("\n"));
        break;
      }

      case "/stats": {
        const input = args[0];
        if (!input) { await sendMessage(chatId, "❌ Usage: `/stats <mint_address_or_ticker>`"); break; }
        await sendMessage(chatId, "🔍 Fetching token data...");
        const data = await fetchTokenStats(input);
        if (!data || data.error) { await sendMessage(chatId, `❌ Token not found for: \`${input}\``); break; }
        const mcap = data.market_cap > 0 ? `$${(data.market_cap / 1000).toFixed(1)}K` : "N/A";
        await sendMessage(chatId, [
          `*${data.name}* ($${data.symbol})`,
          "",
          `📊 Market Cap: ${mcap}`,
          `⛓ Chain: ${data.chain}`,
          data.description ? `📝 ${data.description.slice(0, 120)}${data.description.length > 120 ? "…" : ""}` : "",
          data.twitter ? `🐦 [Twitter](${data.twitter})` : "",
          data.website ? `🌐 [Website](${data.website})` : "",
          data.mint ? `📋 \`${data.mint}\`` : "",
        ].filter(Boolean).join("\n"));
        break;
      }

      case "/shill": {
        const ticker = args[0]?.replace("$", "").toUpperCase();
        if (!ticker) { await sendMessage(chatId, "❌ Usage: `/shill <ticker>`"); break; }
        const plan = await checkUserPlan(chatId);
        if (!isPaidPlan(plan)) {
          await sendMessage(chatId, "🔒 `/shill` requires a *Degen* plan or higher.\n\nUpgrade at [degentools.co/pricing](https://degentools.co/pricing) then link your account with /connect");
          break;
        }
        await sendMessage(chatId, "✍️ Generating shill copy...");
        const tokenData = await fetchTokenStats(ticker);
        const tokenName = tokenData?.name || ticker;
        const copy = await geminiGenerate(
          `Write viral crypto shill copy for ${tokenName} ($${ticker}). Make it hype, bullish, and include emojis. Keep it under 280 characters. No hashtags.`
        );
        if (!copy) { await sendMessage(chatId, "❌ Failed to generate shill copy. Try again later."); break; }
        await sendMessage(chatId, `🚀 *Shill copy for $${ticker}:*\n\n${copy}`);
        break;
      }

      case "/meme": {
        const ticker = args[0]?.replace("$", "").toUpperCase();
        const prompt = args.slice(1).join(" ");
        if (!ticker || !prompt) {
          await sendMessage(chatId, "❌ Usage: `/meme <ticker> <prompt>`\nExample: `/meme DEGEN giga brain ape buying the dip`");
          break;
        }
        const plan = await checkUserPlan(chatId);
        if (!isPaidPlan(plan)) {
          await sendMessage(chatId, "🔒 `/meme` requires a *Degen* plan or higher.\n\nUpgrade at [degentools.co/pricing](https://degentools.co/pricing) then link your account with /connect");
          break;
        }
        await sendMessage(chatId, "🎨 Generating your meme...");
        const tokenData = await fetchTokenStats(ticker);
        const tokenName = tokenData?.name || ticker;
        const imagePrompt = `Create a viral, funny meme image for a cryptocurrency token called "${tokenName}" ($${ticker}). The meme should be attention-grabbing, humorous, and crypto-community appropriate. Style: bold text, exaggerated expressions, crypto culture references. Theme: ${prompt}`;
        const [caption, dataUrl] = await Promise.all([
          geminiGenerate(`Write a funny crypto meme caption for ${tokenName} ($${ticker}). Theme: ${prompt}. Include emojis. Short and punchy, max 2 lines.`),
          generateMemeImage(imagePrompt),
        ]);
        if (!dataUrl) {
          await sendMessage(chatId, [
            `🎭 *Meme caption for $${ticker}:*`,
            "",
            caption || "No caption generated.",
            "",
            `🖼 Generate the full meme image at [DegenTools Studio](https://degentools.co/studio)`,
          ].join("\n"));
          break;
        }
        const photoUrl = await uploadImageToStorage(dataUrl);
        if (!photoUrl) {
          await sendMessage(chatId, "❌ Failed to upload image. Try again later.");
          break;
        }
        const finalCaption = [
          `🎭 *$${ticker}* meme`,
          caption ? `\n${caption}` : "",
          `\n🖼 [More at DegenTools Studio](https://degentools.co/studio)`,
        ].join("");
        await sendPhoto(chatId, photoUrl, finalCaption);
        break;
      }

      case "/site": {
        const ticker = args[0]?.replace("$", "").toLowerCase();
        if (!ticker) { await sendMessage(chatId, "❌ Usage: `/site <ticker>`"); break; }
        await sendMessage(chatId, `🌐 *$${ticker.toUpperCase()} on DegenTools:*\n\nhttps://${ticker}.degentools.co`);
        break;
      }

      case "/fees":
        await sendMessage(chatId, [
          "💰 *Check Your Claimable Fees*",
          "",
          "To view and claim your Bags.fm LP fees:",
          "",
          "1️⃣ Go to [degentools.co/bags](https://degentools.co/bags)",
          "2️⃣ Connect your wallet",
          "3️⃣ Open any token → tap the *Fees* tab",
          "4️⃣ Hit *Claim All Fees* to collect",
        ].join("\n"));
        break;

      case "/build": {
        const userId = await getUserIdByChatId(chatId);
        if (!userId) {
          await sendMessage(chatId, "❌ You need a DegenTools account to build a site. Sign up free at degentools.co then use /connect to link your account.");
          break;
        }
        const plan = await checkUserPlan(chatId);
        const validPlans = ["free", "degen", "creator", "whale"];
        if (!plan || !validPlans.includes(plan)) {
          await sendMessage(chatId, "❌ You need a DegenTools account to build a site. Sign up free at degentools.co then use /connect to link your account.");
          break;
        }
        await setSession(chatId, { step: 1 });
        await sendMessage(chatId, "🏗 *Let's build your token site!*\n\nWhat's your token contract address or Bags.fm link?");
        break;
      }
    }
  } catch (e) {
    console.error("telegram-bot error:", e);
  }

  return new Response("ok", { status: 200 });
});
