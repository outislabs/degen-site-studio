import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CoinData, defaultCoinData } from '@/types/coin';

const KNOWN_HOSTS = [
  'localhost',
  'degentools.co',
  'www.degentools.co',
  'degen-site-studio.lovable.app',
];

interface CustomDomainResult {
  isCustomDomain: boolean;
  siteData: CoinData | null;
  showWatermark: boolean;
  loading: boolean;
  error: boolean;
}

export const useCustomDomain = (): CustomDomainResult => {
  const [state, setState] = useState<CustomDomainResult>({
    isCustomDomain: false,
    siteData: null,
    showWatermark: true,
    loading: true,
    error: false,
  });

  useEffect(() => {
    const hostname = window.location.hostname;

    // Check if this is a known/main domain
    if (KNOWN_HOSTS.some(h => hostname === h || hostname.endsWith('.lovableproject.com') || hostname.endsWith('.lovable.app'))) {
      setState(prev => ({ ...prev, isCustomDomain: false, loading: false }));
      return;
    }

    // It's a custom domain — look it up
    const fetchSite = async () => {
      const { data: site, error } = await supabase
        .from('sites')
        .select('data, user_id')
        .eq('custom_domain', hostname)
        .single();

      if (error || !site) {
        // Also try with www prefix/without
        const altHost = hostname.startsWith('www.') ? hostname.slice(4) : `www.${hostname}`;
        const { data: altSite, error: altErr } = await supabase
          .from('sites')
          .select('data, user_id')
          .eq('custom_domain', altHost)
          .single();

        if (altErr || !altSite) {
          setState({ isCustomDomain: true, siteData: null, showWatermark: true, loading: false, error: true });
          return;
        }

        const coinData = { ...defaultCoinData, ...(altSite.data as unknown as CoinData) };
        const { data: plan } = await supabase.rpc('get_user_plan', { _user_id: altSite.user_id });
        setState({ isCustomDomain: true, siteData: coinData, showWatermark: plan === 'free', loading: false, error: false });
        return;
      }

      const coinData = { ...defaultCoinData, ...(site.data as unknown as CoinData) };
      const { data: plan } = await supabase.rpc('get_user_plan', { _user_id: site.user_id });
      setState({ isCustomDomain: true, siteData: coinData, showWatermark: plan === 'free', loading: false, error: false });
    };

    fetchSite();
  }, []);

  return state;
};
