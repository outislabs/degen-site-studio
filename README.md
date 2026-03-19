# DegenTools 🛠️

> Professional tools for unprofessional coins.

The complete launch stack for meme coin devs. Build it. Brand it. Shill it.

🌐 **Live at:** [degentools.co](https://degentools.co)

---

## What is DegenTools?

DegenTools is an all-in-one platform for meme coin developers — from token launch to website, memes, content, and community tools.

### Features

- **Website Builder** — Launch a meme coin site in 60 seconds. No code, no designer.
- **Token Import** — Paste any pump.fun, DexScreener, or Bags.fm link and auto-populate your site
- **AI Content Studio** — Generate memes, stickers, banners, shill tweets, and marketing copy powered by Gemini
- **Launch on Bags.fm** — Launch a Solana token directly from DegenTools with fee sharing built in
- **My Bags** — Connect your Solana wallet to view, trade, and manage your Bags.fm tokens
- **Custom Domains** — Connect your own domain to your meme coin site
- **Subdomains** — Every token gets a free `$ticker.degentools.co` subdomain

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + TailwindCSS + shadcn/ui |
| Backend | Supabase (Database + Auth + Edge Functions) |
| Hosting | Vercel |
| AI | Google Gemini 2.5 Flash (text + images) |
| Blockchain | Solana via Bags.fm API + Helius RPC |
| Wallet | Reown AppKit (WalletConnect) |
| Email | Resend via Supabase Auth Hook |
| Payments | NowPayments (crypto) |
| DNS | Dynadot + Vercel |

---

## Edge Functions

All backend logic lives in Supabase Edge Functions:

| Function | Purpose |
|---|---|
| `generate-content` | AI image + text generation via Gemini |
| `fetch-pumpfun-token` | Token import from pump.fun, DexScreener, Bags.fm |
| `launch-on-bags` | Full Bags.fm integration — launch, trade, fees, claim |
| `create-subscription` | NowPayments subscription creation |
| `provision-custom-domain` | Vercel API domain provisioning |
| `auth-email-hook` | Custom branded emails via Resend |
| `nowpayments-webhook` | Payment IPN handler |

---

## Local Development

### Prerequisites
- Node.js 18+
- Supabase CLI
- A Supabase project
- A Vercel account

### Setup
```bash
# Clone the repo
git clone https://github.com/outislabs/degen-site-studio

# Install dependencies
cd degen-site-studio
npm install

# Start dev server
npm run dev
```

### Environment Variables

Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Deploy Edge Functions
```bash
# Deploy a specific function
supabase functions deploy launch-on-bags --no-verify-jwt

# Deploy all functions
supabase functions deploy
```

---

## Integrations

- [Bags.fm](https://bags.fm) — Token launch + fee sharing + trading
- [Helius](https://helius.dev) — Solana RPC
- [DexScreener](https://dexscreener.com) — Token data
- [pump.fun](https://pump.fun) — Token import
- [Reown](https://reown.com) — Wallet connection
- [Resend](https://resend.com) — Transactional email
- [NowPayments](https://nowpayments.io) — Crypto payments

---

## Pricing

| Plan | Price |
|---|---|
| Free | $0 — 1 site, watermark, 5 meme downloads/mo |
| Degen | $19/mo — Custom domain, no watermark |
| Creator | $49/mo — Full content studio, 3 sites |
| Pro | $99/mo — Everything + alerts + audit badge |
| Whale | $249/mo — Unlimited sites + API + white label |

---

## Built by

**Legal Alien** ([@legalalien0x](https://x.com/legalalien0x))

Follow DegenTools: [@degentoolshq](https://x.com/degentoolshq)
