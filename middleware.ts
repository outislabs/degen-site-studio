const SUPABASE_URL = 'https://rxrgenpyiydwurvrdyzz.supabase.co';

const KNOWN_HOSTS = [
  'degentools.co',
  'www.degentools.co',
  'degen-site-studio.vercel.app',
  'degen-site-studio.lovable.app',
];

const SUBDOMAIN_BASE = 'degentools.co';

const BOT_UA_PATTERNS = [
  /Twitterbot/i,
  /facebookexternalhit/i,
  /TelegramBot/i,
  /Slackbot/i,
  /LinkedInBot/i,
  /Discordbot/i,
  /WhatsApp/i,
  /Googlebot/i,
  /bingbot/i,
  /Pinterestbot/i,
];

function isBot(userAgent: string): boolean {
  return BOT_UA_PATTERNS.some((p) => p.test(userAgent));
}

function isUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

type SiteRow = { id: string; data: Record<string, unknown> };

async function supabaseGet(path: string, anonKey: string): Promise<SiteRow | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  if (!res.ok) return null;
  const rows: SiteRow[] = await res.json();
  return rows?.[0] ?? null;
}

async function fetchSiteByIdOrSlug(id: string, anonKey: string): Promise<SiteRow | null> {
  const field = isUUID(id) ? 'id' : 'slug';
  return supabaseGet(
    `sites?select=id,data&${field}=eq.${encodeURIComponent(id)}&limit=1`,
    anonKey,
  );
}

async function fetchSiteBySlug(slug: string, anonKey: string): Promise<SiteRow | null> {
  return supabaseGet(
    `sites?select=id,data&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    anonKey,
  );
}

async function fetchSiteByDomain(hostname: string, anonKey: string): Promise<SiteRow | null> {
  const site = await supabaseGet(
    `sites?select=id,data&custom_domain=eq.${encodeURIComponent(hostname)}&limit=1`,
    anonKey,
  );
  if (site) return site;

  // Try www/bare variant
  const alt = hostname.startsWith('www.') ? hostname.slice(4) : `www.${hostname}`;
  return supabaseGet(
    `sites?select=id,data&custom_domain=eq.${encodeURIComponent(alt)}&limit=1`,
    anonKey,
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildOgHtml(siteId: string, name: string, ticker: string, description: string): string {
  const title = escapeHtml(`${name}${ticker ? ` ($${ticker})` : ''}`);
  const desc = escapeHtml(description);
  const ogImage = `${SUPABASE_URL}/functions/v1/og-image?site_id=${siteId}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${ogImage}" />
</head>
<body></body>
</html>`;
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  const userAgent = request.headers.get('user-agent') ?? '';
  if (!isBot(userAgent)) return undefined;

  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
  if (!anonKey) return undefined;

  const url = new URL(request.url);
  const { hostname, pathname } = url;

  let site: SiteRow | null = null;

  const isMainDomain =
    KNOWN_HOSTS.includes(hostname) ||
    hostname.endsWith('.vercel.app') ||
    hostname.endsWith('.lovable.app') ||
    hostname.endsWith('.lovableproject.com');

  if (isMainDomain) {
    // /site/:id — UUID or slug
    const match = pathname.match(/^\/site\/([^/?#]+)/);
    if (match) {
      site = await fetchSiteByIdOrSlug(match[1], anonKey);
    }
  } else if (hostname.endsWith(`.${SUBDOMAIN_BASE}`)) {
    // {slug}.degentools.co
    const slug = hostname.slice(0, -(`.${SUBDOMAIN_BASE}`.length));
    if (slug && slug !== 'www') {
      site = await fetchSiteBySlug(slug, anonKey);
    }
  } else {
    // Fully custom domain
    site = await fetchSiteByDomain(hostname, anonKey);
  }

  if (!site) return undefined;

  const d = site.data ?? {};
  const name = String(d.name ?? '');
  const ticker = String(d.ticker ?? '');
  const description = String(d.description ?? d.tagline ?? '');

  const html = buildOgHtml(site.id, name, ticker, description);

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
    },
  });
}

export const config = {
  matcher: '/((?!assets/|_vercel/|favicon\\.ico|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|ico)).*)',
};
