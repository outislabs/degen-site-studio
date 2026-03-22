import { CoinData } from '@/types/coin';
import { cn } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';
import { themes } from '@/lib/themes';
import ClassicLayout from './layouts/ClassicLayout';
import SplitHeroLayout from './layouts/SplitHeroLayout';
import BentoLayout from './layouts/BentoLayout';
import MinimalLayout from './layouts/MinimalLayout';
import MascotHeroLayout from './layouts/MascotHeroLayout';
import CinematicLayout from './layouts/CinematicLayout';
import CartoonLayout from './layouts/CartoonLayout';
import CartoonSkyLayout from './layouts/CartoonSkyLayout';
import ComicHeroLayout from './layouts/ComicHeroLayout';

interface Props {
  data: CoinData;
  showWatermark?: boolean;
}

const LivePreview = ({ data, showWatermark = false }: Props) => {
  const style = themes[data.theme];
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!data.showCountdown || !data.launchDate) return;
    const timer = setInterval(() => {
      const diff = new Date(data.launchDate!).getTime() - Date.now();
      if (diff <= 0) { setCountdown({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [data.showCountdown, data.launchDate]);

  const layout = data.layout || 'classic';
  const layoutProps = { data, style, countdown, showWatermark };

  const pageTitle = useMemo(() => {
    if (!data.name) return '';
    return `${data.name}${data.ticker ? ` ($${data.ticker})` : ''}`;
  }, [data.name, data.ticker]);

  return (
    <div className={cn('min-h-full rounded-xl overflow-hidden text-white relative')} style={{ background: style.bgGradient }}>
      {pageTitle && (
        <h1 className="sr-only">{pageTitle}</h1>
      )}
      {layout === 'classic' && <ClassicLayout {...layoutProps} />}
      {layout === 'split-hero' && <SplitHeroLayout {...layoutProps} />}
      {layout === 'bento' && <BentoLayout {...layoutProps} />}
      {layout === 'minimal' && <MinimalLayout {...layoutProps} />}
      {layout === 'mascot-hero' && <MascotHeroLayout {...layoutProps} />}
      {layout === 'cinematic' && <CinematicLayout {...layoutProps} />}
      {layout === 'cartoon' && <CartoonLayout {...layoutProps} />}
      {layout === 'cartoon-sky' && <CartoonSkyLayout {...layoutProps} />}
      {layout === 'comic-hero' && <ComicHeroLayout {...layoutProps} />}
    </div>
  );
};

export default LivePreview;
