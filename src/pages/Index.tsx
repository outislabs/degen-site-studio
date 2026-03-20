import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import BagsFmSection from '@/components/landing/BagsFmSection';
import ThemeShowcase from '@/components/landing/ThemeShowcase';
import HowItWorks from '@/components/landing/HowItWorks';
import ContentStudioShowcase from '@/components/landing/ContentStudioShowcase';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';
import FAQSection from '@/components/landing/FAQSection';
import CommunityShowcase from '@/components/landing/CommunityShowcase';
import DashboardView from '@/components/landing/DashboardView';
import DashboardLayout from '@/components/DashboardLayout';
import { usePlan } from '@/hooks/usePlan';

interface SavedSite {
  id: string;
  name: string;
  ticker: string;
  data: Record<string, any>;
  created_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sites, setSites] = useState<SavedSite[]>([]);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const { plan, planId, canCreateSite, loading: planLoading } = usePlan();

  useEffect(() => {
    if (user) fetchSites();
  }, [user]);

  useEffect(() => {
    supabase
      .from('promo_codes')
      .select('max_uses, uses_count')
      .eq('code', 'DEGEN50')
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSpotsLeft(data.max_uses - data.uses_count);
      });
  }, []);

  const fetchSites = async () => {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (!error && data) setSites(data as SavedSite[]);
  };

  const deleteSite = async (id: string) => {
    const { error } = await supabase.from('sites').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete site');
    } else {
      setSites(prev => prev.filter(s => s.id !== id));
      toast.success('Site deleted');
    }
  };

  const handleNewSite = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!canCreateSite(sites.length)) {
      toast.error(`Your ${plan.name} plan allows up to ${plan.maxSites} site${plan.maxSites === 1 ? '' : 's'}. Upgrade to create more.`);
      navigate('/pricing');
      return;
    }
    navigate('/builder');
  };

  if (user) {
    return (
      <DashboardLayout onNewSite={handleNewSite}>
        <DashboardView sites={sites} onDelete={deleteSite} onNewSite={handleNewSite} planId={planId} plan={plan} />
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen gradient-degen overflow-x-hidden">
      <LandingHeader
        isLoggedIn={false}
        onSignIn={() => navigate('/auth')}
        onSignOut={signOut}
      />
      <HeroSection onGetStarted={handleNewSite} />

      {/* Promo Banner */}
      <div className="section-padding pt-0">
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎁</span>
            <div>
              <p className="text-sm font-medium text-foreground">First 50 users get 30 days free on Degen Plan</p>
              <p className="text-xs text-muted-foreground">
                Use code <span className="text-primary font-mono font-bold">DEGEN50</span> at signup
                {spotsLeft !== null && (
                  <span className="text-yellow-400 ml-1">· {spotsLeft} spots left</span>
                )}
              </p>
            </div>
          </div>
          <a href="/auth" className="shrink-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
            Claim Now
          </a>
        </div>
      </div>

      <FeaturesGrid />
      <BagsFmSection />
      <HowItWorks />
      <ContentStudioShowcase />
      <CommunityShowcase />
      <ThemeShowcase />
      <PricingSection onGetStarted={handleNewSite} />
      <FAQSection />
      <CTASection onGetStarted={handleNewSite} />
      <LandingFooter />
    </div>
  );
};

export default Index;
