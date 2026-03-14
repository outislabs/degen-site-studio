import { CoinData } from '@/types/coin';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { themes } from '@/lib/themes';
import ClassicLayout from './layouts/ClassicLayout';
import SplitHeroLayout from './layouts/SplitHeroLayout';
import BentoLayout from './layouts/BentoLayout';
import MinimalLayout from './layouts/MinimalLayout';
import MascotHeroLayout from './layouts/MascotHeroLayout';
import CinematicLayout from './layouts/CinematicLayout';
import CartoonLayout from './layouts/CartoonLayout';

interface Props {
  data: CoinData;
}

const LivePreview = ({ data }: Props) => {
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
  const layoutProps = { data, style, countdown };

  return (
    <div className={cn('min-h-full rounded-xl overflow-hidden text-white relative')} style={{ background: style.bgGradient }}>
      {layout === 'classic' && <ClassicLayout {...layoutProps} />}
      {layout === 'split-hero' && <SplitHeroLayout {...layoutProps} />}
      {layout === 'bento' && <BentoLayout {...layoutProps} />}
      {layout === 'minimal' && <MinimalLayout {...layoutProps} />}
      {layout === 'mascot-hero' && <MascotHeroLayout {...layoutProps} />}
      {layout === 'cinematic' && <CinematicLayout {...layoutProps} />}
      {layout === 'cartoon' && <CartoonLayout {...layoutProps} />}
    </div>
  );
};

export default LivePreview;
