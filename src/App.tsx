import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { BrowserRouter, Route, Routes, useLocation, matchPath } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useEffect, useCallback } from "react";
import { HelmetProvider } from "react-helmet-async";
import { useCustomDomain } from "@/hooks/useCustomDomain";
import { usePageTracking, trackBuyClick } from "@/hooks/useSiteAnalytics";
import LivePreview from "@/components/builder/LivePreview";
import "@/lib/reown"; // Initialize AppKit
import Index from "./pages/Index.tsx";
import Builder from "./pages/Builder.tsx";
import Auth from "./pages/Auth.tsx";
import SiteRedirect from "./pages/SiteRedirect.tsx";
import ContentStudio from "./pages/ContentStudio.tsx";
import Pricing from "./pages/Pricing.tsx";
import Account from "./pages/Account.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Admin from "./pages/Admin.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import NotFound from "./pages/NotFound.tsx";
import LaunchToken from "./pages/LaunchToken.tsx";
import BagsWallet from "./pages/BagsWallet.tsx";
import ApiDashboard from "./pages/ApiDashboard.tsx";
import ConnectTelegram from "./pages/ConnectTelegram.tsx";
import Docs from "./pages/Docs.tsx";
import Affiliate from "./pages/Affiliate.tsx";
import MemeShare from "./pages/MemeShare.tsx";
import Help from "./pages/Help.tsx";
import CliAuthorize from "./pages/CliAuthorize.tsx";
import Plugins from "./pages/Plugins.tsx";

const queryClient = new QueryClient();

type Surface = 'marketing' | 'console' | 'subdomain';

// Paired hosts so redirects stay within the same environment (prod stays on .co,
// local /etc/hosts testing stays on .local) instead of always bouncing to production.
const HOST_PAIRS = [
  { marketing: 'degentools.co', console: 'console.degentools.co' },
  { marketing: 'degentools.local', console: 'console.degentools.local' },
];

function detectSurface(hostname: string): Surface {
  if (HOST_PAIRS.some((p) => p.console === hostname)) return 'console';
  if (hostname === 'www.degentools.co' || hostname === 'localhost' || HOST_PAIRS.some((p) => p.marketing === hostname)) {
    return 'marketing';
  }
  if (hostname.endsWith('.lovable.app') || hostname.endsWith('.vercel.app') || hostname.endsWith('.lovableproject.com')) {
    // Preview deploys behave as console for developer testing.
    return 'console';
  }
  return 'subdomain';
}

function counterpartHost(hostname: string, target: 'marketing' | 'console'): string {
  const pair = HOST_PAIRS.find((p) => p.marketing === hostname || p.console === hostname);
  if (pair) return target === 'console' ? pair.console : pair.marketing;
  // localhost, www, and preview hosts fall back to the production pair.
  return target === 'console' ? 'console.degentools.co' : 'degentools.co';
}

// '/' is intentionally excluded from both lists: Index.tsx already branches on auth state
// (DashboardView when logged in, landing page when logged out) — it's the console home AND
// the marketing home, and is handled as a special case in SurfaceGate below.
//
// '/pricing' is also intentionally excluded: Pricing.tsx is dual-purpose (marketing content +
// the authenticated upgrade flow, e.g. Account -> Pricing). Since auth session lives in
// per-origin localStorage, redirecting a logged-in console user to degentools.co/pricing would
// silently drop their session. It renders unredirected on both hosts.
const CONSOLE_ONLY_ROUTES = ['/builder', '/auth', '/reset-password', '/studio', '/account', '/admin', '/launch', '/bags', '/api-dashboard', '/plugins', '/connect-telegram', '/cli-authorize', '/affiliate', '/site/:id'];
const MARKETING_ONLY_ROUTES = ['/docs', '/terms', '/privacy', '/help', '/meme/:id'];

function matchesAny(patterns: string[], pathname: string) {
  return patterns.some((pattern) => matchPath({ path: pattern, end: true }, pathname));
}

const SurfaceGate = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { pathname, search, hash } = location;

  let redirectTo: string | null = null;
  const hostname = window.location.hostname;
  const surface = detectSurface(hostname);
  // Preserve protocol + port so local /etc/hosts testing (http, non-443 port) redirects
  // to the same dev server instead of an unreachable https:// origin.
  const origin = (host: string) => `${window.location.protocol}//${host}${window.location.port ? `:${window.location.port}` : ''}`;

  if (surface === 'marketing') {
    const consoleHost = counterpartHost(hostname, 'console');
    if (matchesAny(CONSOLE_ONLY_ROUTES, pathname)) {
      redirectTo = `${origin(consoleHost)}${pathname}${search}${hash}`;
    } else if (pathname === '/' && user) {
      redirectTo = `${origin(consoleHost)}/${search}${hash}`;
    }
  } else if (surface === 'console' && matchesAny(MARKETING_ONLY_ROUTES, pathname)) {
    redirectTo = `${origin(counterpartHost(hostname, 'marketing'))}${pathname}${search}${hash}`;
  }

  useEffect(() => {
    if (redirectTo) window.location.replace(redirectTo);
  }, [redirectTo]);

  if (redirectTo) return null;

  return (
    <>
      {surface === 'console' && (
        <Helmet>
          <title>DegenTools Console</title>
        </Helmet>
      )}
      {children}
    </>
  );
};

// Capture referral code from URL on any page load
const ReferralCapture = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('referral_code', ref);
    }
  }, []);
  return null;
};

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-J5K5W8F3Y5', {
        page_path: location.pathname,
      });
    }
  }, [location]);
  return null;
};

const CustomDomainHandler = ({ children }: { children: React.ReactNode }) => {
  const { isCustomDomain, siteData, siteId, showWatermark, loading, error } = useCustomDomain();

  // Track analytics for subdomain/custom domain visits
  usePageTracking(isCustomDomain ? siteId : undefined);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('a');
    if (!target || !siteId) return;
    const text = target.textContent?.toLowerCase() || '';
    const href = target.getAttribute('href') || '';
    if (
      text.includes('buy') ||
      href.includes('bags.fm') ||
      href.includes('pump.fun') ||
      href.includes('dexscreener')
    ) {
      trackBuyClick(siteId);
    }
  }, [siteId]);

  useEffect(() => {
    if (isCustomDomain && siteData?.name) {
      document.title = `${siteData.name} ${siteData.ticker ? `(${siteData.ticker})` : ''} | DegenTools`;
    }
  }, [isCustomDomain, siteData]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-degen flex items-center justify-center">
        <div className="text-primary animate-pulse font-display text-sm">Loading...</div>
      </div>
    );
  }

  if (isCustomDomain) {
    if (error || !siteData) {
      return (
        <div className="min-h-screen gradient-degen flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">😵</div>
            <p className="text-foreground font-semibold">Site not found</p>
            <p className="text-sm text-muted-foreground mt-1">No site is configured for this domain</p>
          </div>
        </div>
      );
    }

    const ogImageUrl = siteId
      ? `https://rxrgenpyiydwurvrdyzz.supabase.co/functions/v1/og-image?site_id=${siteId}`
      : undefined;

    const pageTitle = siteData?.name
      ? `${siteData.name}${siteData.ticker ? ` ($${siteData.ticker})` : ''}`
      : 'Token Site';

    return (
      <div className="min-h-screen" onClick={handleContainerClick}>
        {ogImageUrl && (
          <Helmet>
            <title>{pageTitle}</title>
            <meta property="og:title" content={pageTitle} />
            <meta property="og:image" content={ogImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:image" content={ogImageUrl} />
          </Helmet>
        )}
        <LivePreview data={siteData} showWatermark={showWatermark} siteId={siteId} />
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
      <ReferralCapture />
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CustomDomainHandler>
            <BrowserRouter>
              <RouteTracker />
              <SurfaceGate>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/builder" element={<Builder />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/site/:id" element={<SiteRedirect />} />
                  <Route path="/studio" element={<ContentStudio />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/launch" element={<LaunchToken />} />
                  <Route path="/bags" element={<BagsWallet />} />
                  <Route path="/api-dashboard" element={<ApiDashboard />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/connect-telegram" element={<ConnectTelegram />} />
                  <Route path="/docs" element={<Docs />} />
                  <Route path="/affiliate" element={<Affiliate />} />
                  <Route path="/meme/:id" element={<MemeShare />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/cli-authorize" element={<CliAuthorize />} />
                  <Route path="/plugins" element={<Plugins />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SurfaceGate>
            </BrowserRouter>
          </CustomDomainHandler>
        </TooltipProvider>
      </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
