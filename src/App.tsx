import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useCustomDomain } from "@/hooks/useCustomDomain";
import LivePreview from "@/components/builder/LivePreview";
import "@/lib/reown"; // Initialize AppKit
import Index from "./pages/Index.tsx";
import Builder from "./pages/Builder.tsx";
import Auth from "./pages/Auth.tsx";
import SiteView from "./pages/SiteView.tsx";
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

const queryClient = new QueryClient();

const CustomDomainHandler = ({ children }: { children: React.ReactNode }) => {
  const { isCustomDomain, siteData, showWatermark, loading, error } = useCustomDomain();

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

    return (
      <div className="min-h-screen">
        <LivePreview data={siteData} showWatermark={showWatermark} />
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CustomDomainHandler>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/builder" element={<Builder />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/site/:id" element={<SiteView />} />
                <Route path="/studio" element={<ContentStudio />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/account" element={<Account />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/launch" element={<LaunchToken />} />
                <Route path="/bags" element={<BagsWallet />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CustomDomainHandler>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
