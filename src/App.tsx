import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
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

const queryClient = new QueryClient();

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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CustomDomainHandler>
        </TooltipProvider>
      </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
