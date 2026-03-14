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
import CTASection from '@/components/landing/CTASection';
import DashboardView from '@/components/landing/DashboardView';

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
    navigate('/builder');
  };

  return (
    <div className="min-h-screen gradient-degen">
      <LandingHeader
        isLoggedIn={!!user}
        email={user?.email}
        onSignIn={() => navigate('/auth')}
        onSignOut={signOut}
      />

      {user ? (
        <DashboardView sites={sites} onDelete={deleteSite} onNewSite={handleNewSite} />
      ) : (
        <>
          <HeroSection onGetStarted={handleNewSite} />
          <FeaturesGrid />
          <ThemeShowcase />
          <CTASection onGetStarted={handleNewSite} />
        </>
      )}

      <LandingFooter />
    </div>
  );
};

export default Index;
