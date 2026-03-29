import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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

  useEffect(() => {
    if (!id) return;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = isUUID
      ? supabase.from('sites').select('id, data, user_id, site_type').eq('id', id).single()
      : supabase.from('sites').select('id, data, user_id, site_type').eq('slug', id).single();

    query.then(async ({ data: site, error: err }) => {
      if (err || !site) {
        setError(true);
        setLoading(false);
        return;
      }

      setSiteUuid(site.id);
      let coinData = { ...defaultCoinData, ...(site.data as unknown as CoinData) };

      // If NFT site, load NFT collection data and merge
      if ((site as any).site_type === 'nft') {
        const { data: nftCol } = await supabase
          .from('nft_collections' as any)
          .select('*')
          .eq('site_id', site.id)
          .single();

        if (nftCol) {
          const col = nftCol as any;
          coinData = {
            ...coinData,
            siteType: 'nft',
            mintPrice: col.mint_price ? String(col.mint_price) : coinData.mintPrice,
            nftTotalSupply: col.total_supply ? String(col.total_supply) : coinData.nftTotalSupply,
            mintStatus: col.mint_status || coinData.mintStatus,
            mintDate: col.mint_date || coinData.mintDate,
            isWhitelist: col.is_whitelist ?? coinData.isWhitelist,
            team: col.team || coinData.team,
            faq: col.faq || coinData.faq,
            galleryImages: col.gallery_images || coinData.galleryImages,
          };
        }
      }

      setData(coinData);

      const { data: plan } = await supabase.rpc('get_user_plan', { _user_id: site.user_id });
      setShowWatermark(!plan || plan === 'free');
      setShowWatermark(plan === 'free');
      setLoading(false);
    });
  }, [id]);

  const ogImageUrl = siteUuid
    ? `https://rxrgenpyiydwurvrdyzz.supabase.co/functions/v1/og-image?site_id=${siteUuid}`
    : undefined;

  const pageTitle = data?.name
    ? `${data.name}${data.ticker ? ` ($${data.ticker})` : ''}`
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
      <LivePreview data={data} showWatermark={showWatermark} siteId={siteUuid} />
    </div>
  );
};

export default SiteView;
