import { CoinData } from '@/types/coin';
import TickerTape from './TickerTape';
import DonutChart from './DonutChart';
import { Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface Props {
  data: CoinData;
}

const themeStyles = {
  'degen-dark': {
    bg: 'bg-[#0a0a0f]',
    accent: 'text-[#22c55e]',
    glow: 'text-glow',
    border: 'border-[#22c55e]/20',
    button: 'bg-[#22c55e] text-[#0a0a0f]',
  },
  'pepe-classic': {
    bg: 'bg-[#0d1f0d]',
    accent: 'text-[#4ade80]',
    glow: '',
    border: 'border-[#4ade80]/20',
    button: 'bg-[#4ade80] text-[#0d1f0d]',
  },
  'moon-cult': {
    bg: 'bg-[#1a0a2e]',
    accent: 'text-[#a855f7]',
    glow: 'text-glow-purple',
    border: 'border-[#a855f7]/20',
    button: 'bg-[#a855f7] text-[#1a0a2e]',
  },
};

const LivePreview = ({ data }: Props) => {
  const style = themeStyles[data.theme];
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

  return (
    <div className={cn('min-h-full rounded-xl overflow-hidden text-foreground', style.bg)}>
      {/* Ticker */}
      <TickerTape name={data.name} ticker={data.ticker} />

      {/* Hero */}
      <div className="px-6 py-12 text-center space-y-4">
        {data.logoUrl && (
          <img src={data.logoUrl} alt="Logo" className="w-24 h-24 rounded-full mx-auto animate-float object-cover" />
        )}
        <h1 className={cn('font-display text-2xl md:text-3xl', style.accent, style.glow)}>
          {data.name || 'Your Coin Name'}
        </h1>
        <p className="text-lg text-foreground/70 max-w-md mx-auto">
          {data.tagline || 'Your epic tagline goes here 🚀'}
        </p>

        {/* Countdown */}
        {data.showCountdown && data.launchDate && (
          <div className="flex justify-center gap-3 mt-4">
            {Object.entries(countdown).map(([k, v]) => (
              <div key={k} className={cn('border rounded-lg p-3 min-w-[60px]', style.border)}>
                <div className={cn('font-display text-xl', style.accent)}>{v}</div>
                <div className="text-xs text-foreground/50 uppercase">{k === 'd' ? 'days' : k === 'h' ? 'hrs' : k === 'm' ? 'min' : 'sec'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contract Address */}
      {data.contractAddress && (
        <div className={cn('mx-6 p-3 rounded-lg border flex items-center justify-between', style.border)}>
          <code className="text-xs text-foreground/70 truncate flex-1">{data.contractAddress}</code>
          <Copy className={cn('w-4 h-4 ml-2 flex-shrink-0 cursor-pointer', style.accent)} />
        </div>
      )}

      {/* Tokenomics */}
      <div className="px-6 py-8 space-y-4">
        <h2 className={cn('font-display text-sm', style.accent)}>TOKENOMICS</h2>
        <p className="text-sm text-foreground/60">Supply: {data.totalSupply || '—'}</p>
        <div className="flex gap-4 text-sm text-foreground/60">
          <span>Buy Tax: {data.buyTax}%</span>
          <span>Sell Tax: {data.sellTax}%</span>
          <span>LP: {data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned'}</span>
        </div>
        <DonutChart distribution={data.distribution} />
      </div>

      {/* Roadmap */}
      {data.roadmap.length > 0 && (
        <div className="px-6 py-8 space-y-4">
          <h2 className={cn('font-display text-sm', style.accent)}>ROADMAP</h2>
          <div className="space-y-4">
            {data.roadmap.map((phase, i) => (
              <div key={phase.id} className={cn('border rounded-lg p-4', style.border)}>
                <h3 className="font-semibold text-foreground mb-2">{phase.title}</h3>
                <ul className="space-y-1">
                  {phase.items.filter(Boolean).map((item, j) => (
                    <li key={j} className="text-sm text-foreground/60 flex items-start gap-2">
                      <span className={style.accent}>•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Socials */}
      <div className={cn('px-6 py-6 border-t flex justify-center gap-4', style.border)}>
        {data.socials.telegram && <a href="#" className={cn('text-sm hover:underline', style.accent)}>Telegram</a>}
        {data.socials.twitter && <a href="#" className={cn('text-sm hover:underline', style.accent)}>Twitter</a>}
        {data.socials.discord && <a href="#" className={cn('text-sm hover:underline', style.accent)}>Discord</a>}
        {data.socials.dex && (
          <a href="#" className={cn('text-sm hover:underline flex items-center gap-1', style.accent)}>
            <ExternalLink className="w-3 h-3" /> DEX
          </a>
        )}
      </div>
    </div>
  );
};

export default LivePreview;
