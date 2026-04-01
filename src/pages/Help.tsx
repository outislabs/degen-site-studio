import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Globe, Image, Link2, BarChart3, CreditCard, Rocket, ArrowLeft, BookOpen, Palette, Shield, Zap } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import { useAuth } from '@/contexts/AuthContext';

interface Article {
  id: string;
  title: string;
  summary: string;
  steps: { title: string; content: string }[];
}

interface Category {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  articles: Article[];
}

const categories: Category[] = [
  {
    id: 'getting-started',
    icon: Rocket,
    label: 'Getting Started',
    description: 'Set up your account and create your first site.',
    articles: [
      {
        id: 'create-account',
        title: 'Creating Your Account',
        summary: 'Sign up and get started with DegenTools in under a minute.',
        steps: [
          { title: 'Go to the sign-in page', content: 'Click "Sign In" in the top-right corner of the landing page, or navigate directly to /auth.' },
          { title: 'Create your account', content: 'Enter your email address and a secure password, then click "Sign Up". You\'ll receive a verification email.' },
          { title: 'Verify your email', content: 'Check your inbox and click the verification link. Once verified, you can sign in and start building.' },
          { title: 'Explore the dashboard', content: 'After signing in you\'ll land on the dashboard where you can see your sites, access the Content Studio, manage your plan, and more.' },
        ],
      },
      {
        id: 'first-site',
        title: 'Creating Your First Website',
        summary: 'A quick overview of the builder flow from start to publish.',
        steps: [
          { title: 'Click "New Site"', content: 'From your dashboard, click the "New Site" button to open the builder wizard.' },
          { title: 'Choose site type', content: 'Select either "Meme Coin" or "NFT Project". The builder will adjust its layout and fields accordingly.' },
          { title: 'Fill in the basics', content: 'Enter your coin/project name, ticker symbol, and a unique slug (this becomes your subdomain, e.g. mytoken.degentools.co).' },
          { title: 'Auto-import data', content: 'Paste a link from Bags.fm, Pump.fun, DexScreener, or Magic Eden to auto-fill tokenomics, contract data, and metadata.' },
          { title: 'Customize & publish', content: 'Walk through the remaining steps (Socials, Roadmap, Theme), then hit Publish. Your site is instantly live on your subdomain!' },
        ],
      },
    ],
  },
  {
    id: 'meme-sites',
    icon: Globe,
    label: 'Meme Coin Sites',
    description: 'Build a professional website for your meme token.',
    articles: [
      {
        id: 'import-token',
        title: 'Importing Token Data',
        summary: 'Auto-fill your site by pasting a token link from supported platforms.',
        steps: [
          { title: 'Supported platforms', content: 'You can import from Bags.fm, Pump.fun, and DexScreener. Just paste the full URL into the import field in Step 1.' },
          { title: 'What gets imported', content: 'The builder auto-fills the token name, ticker, contract address, description, logo, market cap, price, holder count, and social links where available.' },
          { title: 'Edit imported data', content: 'All imported fields are fully editable. Review them and make any changes before moving on.' },
        ],
      },
      {
        id: 'tokenomics',
        title: 'Setting Up Tokenomics',
        summary: 'Configure the tokenomics section with supply, allocation, and charts.',
        steps: [
          { title: 'Navigate to Step 2', content: 'After filling in basics, click "Next" or the "Tokenomics" tab to reach the tokenomics configuration.' },
          { title: 'Add allocation entries', content: 'Define categories like "Liquidity Pool", "Community Rewards", "Team" etc., each with a percentage and optional description.' },
          { title: 'Live chart preview', content: 'A donut chart on the right updates in real-time as you adjust allocations, so you can see exactly how it will look on your published site.' },
        ],
      },
      {
        id: 'choose-theme',
        title: 'Choosing & Customizing Themes',
        summary: 'Pick from 14+ meme coin layouts and make them yours.',
        steps: [
          { title: 'Browse themes', content: 'In the "Theme" step of the builder, scroll through all available layouts: Classic, Split Hero, Bento Grid, Cinematic, Terminal, Neon Cyberpunk, and more.' },
          { title: 'Preview in real-time', content: 'Click any theme card to instantly see a live preview on the right panel with your actual content.' },
          { title: 'Pro-only themes', content: 'Some themes are marked with a crown icon — these require a paid plan. Upgrade from the Pricing page to unlock them.' },
        ],
      },
    ],
  },
  {
    id: 'nft-sites',
    icon: Palette,
    label: 'NFT Project Sites',
    description: 'Create a stunning landing page for your NFT collection.',
    articles: [
      {
        id: 'nft-basics',
        title: 'Setting Up an NFT Project',
        summary: 'Configure mint details, supply, and collection metadata.',
        steps: [
          { title: 'Select "NFT Project" type', content: 'In Step 1 of the builder, toggle the site type to "NFT Project". The builder will switch to NFT-specific fields and layouts.' },
          { title: 'Fill in collection details', content: 'Enter the collection name, description, and optional contract address. Set mint price (in SOL), total supply, and mint status (Upcoming / Live / Sold Out).' },
          { title: 'Add a mint link', content: 'Paste the URL where users can mint (e.g. Magic Eden, LaunchNFT). This becomes the primary CTA button on your site.' },
          { title: 'Import from Magic Eden', content: 'Paste a Magic Eden collection URL to auto-fill metadata, images, and social links.' },
        ],
      },
      {
        id: 'nft-gallery',
        title: 'Managing the NFT Gallery',
        summary: 'Upload and arrange your collection artwork for the gallery.',
        steps: [
          { title: 'Go to Step 2 (Gallery)', content: 'For NFT projects, Step 2 is a gallery upload grid instead of tokenomics.' },
          { title: 'Upload images', content: 'Drag and drop or click to upload up to 12 images. Supported formats: PNG, JPG, GIF, WebP.' },
          { title: 'Reorder and remove', content: 'Drag images to rearrange their order. Click the X to remove any image. The gallery preview updates in real-time.' },
        ],
      },
      {
        id: 'nft-team-faq',
        title: 'Adding Team & FAQ Sections',
        summary: 'Showcase your team and answer common questions.',
        steps: [
          { title: 'Navigate to Step 3', content: 'Step 3 for NFT projects includes both Team and FAQ management.' },
          { title: 'Add team members', content: 'Click "Add Member" and fill in name, role, avatar, and optional social links for each team member.' },
          { title: 'Create FAQ entries', content: 'Click "Add FAQ" and enter a question and answer. These render as expandable accordions on your published site.' },
        ],
      },
      {
        id: 'nft-themes',
        title: 'NFT Layout Themes',
        summary: 'Choose from 10 purpose-built NFT layouts.',
        steps: [
          { title: 'NFT-specific themes', content: 'NFT projects have their own set of 10 layouts: Dark, Gallery, Comic, Retro Pop, Minimal Gallery, Streetwear, Gallery Wall, Anime, Blueprint, and Luxury.' },
          { title: 'Gallery pagination', content: 'All NFT themes include a paginated gallery component — 6 items per page on desktop, 4 on mobile — with navigation controls.' },
          { title: 'Smart CTA buttons', content: 'The main action button on NFT sites automatically prioritizes your Mint Link, then falls back to Magic Eden. The label adapts to mint status (e.g. "Mint Now" vs "View Collection").' },
        ],
      },
    ],
  },
  {
    id: 'content-studio',
    icon: Image,
    label: 'Content Studio',
    description: 'Generate AI-powered memes, copy, and marketing assets.',
    articles: [
      {
        id: 'studio-overview',
        title: 'Content Studio Overview',
        summary: 'What you can create with the AI-powered content tools.',
        steps: [
          { title: 'Access the Studio', content: 'Navigate to /studio from the dashboard sidebar or click "Content Studio" in the navigation.' },
          { title: 'Available tools', content: 'Generate AI memes with custom prompts, create shill copy for tweets and Telegram, and produce marketing images — all from one interface.' },
          { title: 'Link to a site', content: 'Optionally connect the studio to one of your sites. The AI will use your token\'s name, ticker, and branding for more relevant outputs.' },
        ],
      },
      {
        id: 'generate-memes',
        title: 'Generating AI Memes',
        summary: 'Create viral-ready meme images using AI.',
        steps: [
          { title: 'Select "Meme" type', content: 'In the Content Studio, choose the Meme generation tab.' },
          { title: 'Write your prompt', content: 'Describe the meme you want. Be specific about the vibe, characters, and text. Example: "Pepe wearing a crown, sitting on a pile of money, with text WAGMI".' },
          { title: 'Upload a reference (optional)', content: 'You can upload a reference image to guide the AI\'s style and composition.' },
          { title: 'Generate & download', content: 'Click Generate and wait a few seconds. Once ready, download the image or save it to your gallery for later use.' },
        ],
      },
      {
        id: 'nft-mode',
        title: 'NFT Mode in Content Studio',
        summary: 'Switch to NFT-optimized prompts and content types.',
        steps: [
          { title: 'Activate NFT Mode', content: 'When linked to an NFT project, NFT Mode activates automatically. You can also toggle it manually.' },
          { title: 'NFT-specific content', content: 'In NFT Mode, you get specialized text types: Discord welcome messages, mint announcements, whitelist giveaway posts, and floor price reaction copy.' },
          { title: 'Context-aware prompts', content: 'Prompts and placeholders shift to NFT-specific language to produce more relevant outputs.' },
        ],
      },
    ],
  },
  {
    id: 'custom-domains',
    icon: Link2,
    label: 'Custom Domains',
    description: 'Connect your own domain for a professional presence.',
    articles: [
      {
        id: 'subdomain',
        title: 'Using Your Free Subdomain',
        summary: 'Every site gets a free subdomain on degentools.co.',
        steps: [
          { title: 'Automatic subdomain', content: 'When you publish a site, it\'s instantly available at yourslug.degentools.co based on the slug you set in Step 1.' },
          { title: 'Share your link', content: 'Copy your subdomain URL from the publish modal or the dashboard site card and share it anywhere.' },
          { title: 'Change your slug', content: 'Edit your site, update the slug in Step 1, and re-publish. The new subdomain is active immediately; the old one stops working.' },
        ],
      },
      {
        id: 'connect-domain',
        title: 'Connecting a Custom Domain',
        summary: 'Step-by-step guide to pointing your domain to DegenTools.',
        steps: [
          { title: 'Requirements', content: 'You need a paid plan (or a domain add-on) and a domain registered with any registrar (GoDaddy, Namecheap, Cloudflare, etc.).' },
          { title: 'Open domain setup', content: 'In the builder or site settings, click "Custom Domain" to launch the 3-step domain wizard.' },
          { title: 'Add DNS Record 1 — www subdomain', content: 'At your registrar, add a CNAME record with Name set to "www" and Value set to "cname.vercel-dns.com". This handles traffic to www.yourdomain.com.' },
          { title: 'Add DNS Record 2 — root domain', content: 'Add an A record with Name set to "@" and Value set to "216.198.79.1". This handles traffic to yourdomain.com (without www). Most registrars require an A record for the root domain since CNAME is not supported on @.' },
          { title: 'Verify & activate', content: 'Click "Verify" in the wizard. DNS changes can take up to 24 hours to propagate, but usually work within a few minutes. SSL is provisioned automatically.' },
          { title: 'Troubleshooting', content: 'If verification fails, make sure both records are added (CNAME for www and A record for @). Check for conflicting DNS records and try again after waiting. Use tools like DNSChecker.org to verify your settings.' },
        ],
      },
    ],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Site Analytics',
    description: 'Track visits, unique visitors, and buy clicks.',
    articles: [
      {
        id: 'analytics-overview',
        title: 'Understanding Your Analytics',
        summary: 'What metrics are tracked and how to read them.',
        steps: [
          { title: 'Access analytics', content: 'From your dashboard, click on any site card to see its analytics panel. Metrics update in real-time.' },
          { title: 'Page views', content: 'Every time someone visits your site (subdomain or custom domain), a page view is recorded.' },
          { title: 'Unique visitors', content: 'Unique visitors are tracked per-device. The first visit from a new device counts as a unique visit.' },
          { title: 'Buy clicks', content: 'When a visitor clicks any CTA link (Buy, Bags.fm, Pump.fun, DexScreener), it\'s tracked as a buy click — the most important conversion metric.' },
          { title: 'Referrer & source', content: 'Analytics captures where your traffic comes from: the referring domain and any utm_source parameter in the URL.' },
        ],
      },
    ],
  },
  {
    id: 'plans',
    icon: CreditCard,
    label: 'Plans & Billing',
    description: 'Understand plan tiers, limits, and how to upgrade.',
    articles: [
      {
        id: 'plan-tiers',
        title: 'Plan Tiers Explained',
        summary: 'Compare Free, Degen, Creator, and Whale plans.',
        steps: [
          { title: 'Free plan', content: 'Create 1 site with basic themes, access the Content Studio with limited downloads, and use your free subdomain.' },
          { title: 'Degen plan', content: 'Unlock up to 3 sites, all themes, more Content Studio downloads, and remove the DegenTools watermark from your sites.' },
          { title: 'Creator plan', content: 'Up to 10 sites, priority support, custom domains, advanced analytics, and higher API rate limits.' },
          { title: 'Whale plan', content: 'Unlimited sites, all features unlocked, highest API limits, and priority everything.' },
        ],
      },
      {
        id: 'upgrade',
        title: 'How to Upgrade Your Plan',
        summary: 'Upgrade or manage your subscription.',
        steps: [
          { title: 'Navigate to Pricing', content: 'Click the plan badge in your dashboard header, or go to /pricing directly.' },
          { title: 'Select a plan', content: 'Compare features and click "Upgrade" on the plan that fits your needs.' },
          { title: 'Complete payment', content: 'Follow the payment flow to activate your new plan. Changes take effect immediately.' },
          { title: 'Promo codes', content: 'Have a promo code? Enter it on the Pricing page to unlock discounts or free trials of premium plans.' },
        ],
      },
    ],
  },
  {
    id: 'security',
    icon: Shield,
    label: 'Security & Account',
    description: 'Manage your account, password, and wallet.',
    articles: [
      {
        id: 'reset-password',
        title: 'Resetting Your Password',
        summary: 'How to recover or change your password.',
        steps: [
          { title: 'From the sign-in page', content: 'Click "Forgot password?" on the sign-in form. Enter your email and click Send.' },
          { title: 'Check your email', content: 'You\'ll receive a password reset link. Click it to open the reset form.' },
          { title: 'Set a new password', content: 'Enter your new password and confirm. You\'ll be signed in automatically.' },
        ],
      },
      {
        id: 'connect-wallet',
        title: 'Connecting Your Solana Wallet',
        summary: 'Link your wallet for token-gated features and Bags integration.',
        steps: [
          { title: 'Go to Account settings', content: 'Navigate to /account and find the Wallet section.' },
          { title: 'Click Connect Wallet', content: 'Click the wallet button to open the wallet connection modal. Select your preferred wallet (Phantom, Solflare, etc.).' },
          { title: 'Approve the connection', content: 'Approve the connection request in your wallet extension. Your wallet address will appear in your account.' },
        ],
      },
    ],
  },
  {
    id: 'api',
    icon: Zap,
    label: 'API & Integrations',
    description: 'Use the DegenTools API and Telegram bot.',
    articles: [
      {
        id: 'api-keys',
        title: 'Getting Your API Key',
        summary: 'Generate and manage API keys for programmatic access.',
        steps: [
          { title: 'Go to API Dashboard', content: 'Navigate to /api-dashboard from the sidebar.' },
          { title: 'Generate a key', content: 'Click "Generate API Key" to create a new key. Copy it immediately — it won\'t be shown again.' },
          { title: 'Rate limits', content: 'Your plan determines rate limits: Free (10 req/min), Degen (30 req/min), Creator (60 req/min). Check the Docs for full details.' },
        ],
      },
      {
        id: 'telegram-bot',
        title: 'Connecting the Telegram Bot',
        summary: 'Set up automated updates to your Telegram group.',
        steps: [
          { title: 'Navigate to Connect Telegram', content: 'Go to /connect-telegram from your dashboard or the mobile menu.' },
          { title: 'Follow the wizard', content: 'The page guides you through adding the DegenTools bot to your Telegram group and linking it to your site.' },
          { title: 'What it does', content: 'The bot can post updates, alerts, and content directly to your Telegram group based on your site activity.' },
        ],
      },
    ],
  },
];

const Help = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const filteredCategories = search.trim()
    ? categories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(
          a =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.summary.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.articles.length > 0)
    : categories;

  const currentCategory = activeCategory
    ? categories.find(c => c.id === activeCategory)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader
        isLoggedIn={!!user}
        onSignIn={() => navigate('/auth')}
        onSignOut={signOut}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-16">
        {/* Header */}
        {!activeArticle && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-10"
          >
            {activeCategory && (
              <button
                onClick={() => { setActiveCategory(null); setActiveArticle(null); }}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to all topics
              </button>
            )}
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-[11px] text-muted-foreground tracking-[0.2em] font-medium uppercase border border-[hsla(0,0%,100%,0.08)] rounded-full px-4 py-1.5">
                Help Center
              </span>
            </div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight mb-3">
              {currentCategory ? currentCategory.label : 'How can we help?'}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-6">
              {currentCategory
                ? currentCategory.description
                : 'Guides and tutorials to help you get the most out of DegenTools.'}
            </p>

            {!activeCategory && (
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsla(0,0%,100%,0.03)] border border-[hsla(0,0%,100%,0.08)] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-colors"
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Article detail view */}
        {activeArticle ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <button
              onClick={() => setActiveArticle(null)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to {currentCategory?.label || 'articles'}
            </button>

            <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground tracking-tight mb-2">
              {activeArticle.title}
            </h1>
            <p className="text-sm text-muted-foreground mb-8">{activeArticle.summary}</p>

            <div className="space-y-4">
              {activeArticle.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 p-4 rounded-xl bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)]"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : activeCategory && currentCategory ? (
          /* Articles list for a category */
          <div className="space-y-3">
            {currentCategory.articles.map((article, i) => (
              <motion.button
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveArticle(article)}
                className="w-full text-left p-4 sm:p-5 rounded-xl bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-[hsla(0,0%,100%,0.12)] transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground/40">
                  {article.steps.length} step{article.steps.length !== 1 ? 's' : ''}
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          /* Category grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCategories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
                className="text-left p-5 rounded-xl bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-[hsla(0,0%,100%,0.12)] transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <cat.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{cat.description}</p>
                <span className="text-[10px] text-muted-foreground/40">
                  {cat.articles.length} article{cat.articles.length !== 1 ? 's' : ''}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <LandingFooter />
    </div>
  );
};

export default Help;
