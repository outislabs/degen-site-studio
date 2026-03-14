import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
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
  const { plan, planId, canCreateSite, loading: planLoading } = usePlan();

  useEffect(() => {
    if (user) fetchSites();
  }, [user]);

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
      <FeaturesGrid />
      <HowItWorks />
      <ContentStudioShowcase />
      <CommunityShowcase />
      <ThemeShowcase />
      <PricingSection onGetStarted={handleNewSite} />
      <CTASection onGetStarted={handleNewSite} />
      <LandingFooter />
    </div>
  );
};

export default Index;
