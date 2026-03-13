import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LivePreview from '@/components/builder/LivePreview';
import { CoinData } from '@/types/coin';

const SiteView = () => {
  const { id } = useParams();
  const [data, setData] = useState<CoinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('sites')
      .select('data')
      .eq('id', id)
      .single()
      .then(({ data: site, error: err }) => {
        if (err || !site) {
          setError(true);
        } else {
          setData(site.data as unknown as CoinData);
        }
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
      <LivePreview data={data} />
    </div>
  );
};

export default SiteView;
