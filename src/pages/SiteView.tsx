import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LivePreview from '@/components/builder/LivePreview';
import { CoinData, defaultCoinData } from '@/types/coin';

const SiteView = () => {
  const { id } = useParams();
  const [data, setData] = useState<CoinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);

  useEffect(() => {
    if (!id) return;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = isUUID
      ? supabase.from('sites').select('data, user_id').eq('id', id).single()
      : supabase.from('sites').select('data, user_id').eq('slug', id).single();

    query.then(async ({ data: site, error: err }) => {
      if (err || !site) {
        setError(true);
        setLoading(false);
        return;
      }

      setData({ ...defaultCoinData, ...(site.data as unknown as CoinData) });

      // Check if site owner has a paid plan (no watermark)
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

  return (
    <div className="min-h-screen">
      <LivePreview data={data} showWatermark={showWatermark} />
    </div>
  );
};

export default SiteView;
