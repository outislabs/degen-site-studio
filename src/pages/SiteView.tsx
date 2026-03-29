import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LivePreview from '@/components/builder/LivePreview';
import { CoinData, defaultCoinData } from '@/types/coin';
import { usePageTracking, trackBuyClick } from '@/hooks/useSiteAnalytics';

const SiteView = () => {
  const { id } = useParams();
  const [data, setData] = useState<CoinData | null>(null);
  const [siteUuid, setSiteUuid] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);

  // Track page view once we know the site UUID
  usePageTracking(siteUuid);

  useEffect(() => {
    if (!id) return;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = isUUID
      ? supabase.from('sites').select('id, data, user_id').eq('id', id).single()
      : supabase.from('sites').select('id, data, user_id').eq('slug', id).single();

    query.then(async ({ data: site, error: err }) => {
      if (err || !site) {
        setError(true);
        setLoading(false);
        return;
      }

      setSiteUuid(site.id);
      setData({ ...defaultCoinData, ...(site.data as unknown as CoinData) });

      const { data: plan } = await supabase.rpc('get_user_plan', { _user_id: site.user_id });
      setShowWatermark(!plan || plan === 'free');
      setShowWatermark(plan === 'free');
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-degen flex items-center justify-center">
        <div className="text-primary animate-pulse font-display text-sm">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen gradient-degen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😵</div>
          <p className="text-foreground font-semibold">Site not found</p>
          <p className="text-sm text-muted-foreground mt-1">This meme coin site doesn't exist or was deleted</p>
        </div>
      </div>
    );
  }

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('a');
    if (!target || !siteUuid) return;
    const text = target.textContent?.toLowerCase() || '';
    const href = target.getAttribute('href') || '';
    if (
      text.includes('buy') ||
      href.includes('bags.fm') ||
      href.includes('pump.fun') ||
      href.includes('dexscreener')
    ) {
      trackBuyClick(siteUuid);
    }
  }, [siteUuid]);

  return (
    <div className="min-h-screen" onClick={handleContainerClick}>
      <LivePreview data={data} showWatermark={showWatermark} siteId={siteUuid} />
    </div>
  );
};

export default SiteView;
