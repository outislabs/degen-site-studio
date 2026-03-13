import { CoinData } from '@/types/coin';
import TickerTape from './TickerTape';
import DonutChart from './DonutChart';
import { Copy, ExternalLink, Send, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { themes } from '@/lib/themes';

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

  return (
    <div className={cn('min-h-full rounded-xl overflow-hidden text-white')} style={{ background: style.bgGradient }}>
      {/* Ticker */}
      <TickerTape name={data.name} ticker={data.ticker} accentHex={style.accentHex} />

      {/* Hero */}
      <div className="px-8 py-16 text-center space-y-6 relative">
        {/* Decorative glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: style.accentHex }} />
        </div>
        
        {data.logoUrl && (
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full blur-xl opacity-40" style={{ backgroundColor: style.accentHex }} />
            <img src={data.logoUrl} alt="Logo" className="w-28 h-28 rounded-full mx-auto animate-float object-cover relative z-10 ring-2" style={{ '--tw-ring-color': style.accentHex } as React.CSSProperties} />
          </div>
        )}
        <div>
          <h1 className={cn('font-display text-2xl md:text-3xl mb-3', style.accent, style.glow)}>
            {data.name || 'Your Coin Name'}
          </h1>
          {data.ticker && (
            <span className={cn('inline-block px-3 py-1 rounded-full text-xs font-bold border', style.border, style.accent)}>
              {data.ticker}
            </span>
          )}
        </div>
        <p className="text-lg text-white/60 max-w-md mx-auto leading-relaxed">
          {data.tagline || 'Your epic tagline goes here 🚀'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button className={cn('px-6 py-3 rounded-lg font-bold text-sm transition-all', style.button, style.buttonText)}>
            🚀 Buy Now
          </button>
          <button className={cn('px-6 py-3 rounded-lg font-bold text-sm border transition-all hover:bg-white/5', style.border, style.accent)}>
            📊 Chart
          </button>
        </div>

        {/* Countdown */}
        {data.showCountdown && data.launchDate && (
          <div className="flex justify-center gap-3 mt-6">
            {Object.entries(countdown).map(([k, v]) => (
              <div key={k} className={cn('border rounded-xl p-4 min-w-[70px]', style.border, style.cardBg)}>
                <div className={cn('font-display text-xl', style.accent)}>{v}</div>
                <div className="text-[10px] text-white/40 uppercase mt-1">{k === 'd' ? 'days' : k === 'h' ? 'hrs' : k === 'm' ? 'min' : 'sec'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contract Address */}
      {data.contractAddress && (
        <div className="px-8 pb-6">
          <div className={cn('p-4 rounded-xl border flex items-center justify-between gap-3', style.border, style.cardBg)}>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Contract Address</p>
              <code className="text-xs text-white/70 truncate block">{data.contractAddress}</code>
            </div>
            <button className={cn('p-2 rounded-lg border transition-all hover:bg-white/5', style.border)}>
              <Copy className={cn('w-4 h-4', style.accent)} />
            </button>
          </div>
        </div>
      )}

      {/* Tokenomics */}
      <div className="px-8 py-10">
        <div className="text-center mb-8">
          <h2 className={cn('font-display text-sm mb-2', style.accent)}>📊 TOKENOMICS</h2>
          <p className="text-sm text-white/40">How the supply is distributed</p>
        </div>
        
        <div className={cn('rounded-xl border p-6', style.border, style.cardBg)}>
          <div className="flex flex-col items-center gap-6">
            <p className="text-sm text-white/50">Total Supply: <span className="text-white font-semibold">{data.totalSupply || '—'}</span></p>
            <DonutChart distribution={data.distribution} accentHex={style.accentHex} />
            <div className="flex gap-6 text-sm text-white/50 flex-wrap justify-center">
              <span className="flex items-center gap-1">Buy Tax: <strong className="text-white">{data.buyTax}%</strong></span>
              <span className="flex items-center gap-1">Sell Tax: <strong className="text-white">{data.sellTax}%</strong></span>
              <span className="flex items-center gap-1">LP: <strong className="text-white">{data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      {data.roadmap.length > 0 && (
        <div className="px-8 py-10">
          <div className="text-center mb-8">
            <h2 className={cn('font-display text-sm mb-2', style.accent)}>🗺️ ROADMAP</h2>
            <p className="text-sm text-white/40">Our journey to the moon</p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px opacity-20" style={{ backgroundColor: style.accentHex }} />
            <div className="space-y-6">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="relative pl-16">
                  {/* Timeline dot */}
                  <div className="absolute left-4 top-4 w-4 h-4 rounded-full border-2" style={{ borderColor: style.accentHex, backgroundColor: i === 0 ? style.accentHex : 'transparent' }} />
                  <div className={cn('border rounded-xl p-5', style.border, style.cardBg)}>
                    <h3 className={cn('font-bold text-white mb-3 flex items-center gap-2')}>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', style.border, style.accent)}>Phase {i + 1}</span>
                      {phase.title.replace(/Phase \d+:\s*/, '')}
                    </h3>
                    <ul className="space-y-2">
                      {phase.items.filter(Boolean).map((item, j) => (
                        <li key={j} className="text-sm text-white/60 flex items-start gap-2">
                          <span className={style.accent}>▸</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Socials */}
      <div className={cn('px-8 py-8 border-t', style.border)}>
        <div className="text-center mb-4">
          <h2 className={cn('font-display text-xs', style.accent)}>JOIN THE COMMUNITY</h2>
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          {data.socials.telegram && (
            <a href="#" className={cn('px-5 py-2.5 rounded-lg border text-sm font-medium transition-all hover:bg-white/5 flex items-center gap-2', style.border, style.accent)}>
              <Send className="w-4 h-4" /> Telegram
            </a>
          )}
          {data.socials.twitter && (
            <a href="#" className={cn('px-5 py-2.5 rounded-lg border text-sm font-medium transition-all hover:bg-white/5 flex items-center gap-2', style.border, style.accent)}>
              𝕏 Twitter
            </a>
          )}
          {data.socials.discord && (
            <a href="#" className={cn('px-5 py-2.5 rounded-lg border text-sm font-medium transition-all hover:bg-white/5 flex items-center gap-2', style.border, style.accent)}>
              <MessageCircle className="w-4 h-4" /> Discord
            </a>
          )}
          {data.socials.dex && (
            <a href="#" className={cn('px-5 py-2.5 rounded-lg border text-sm font-medium transition-all hover:bg-white/5 flex items-center gap-2', style.border, style.accent)}>
              <ExternalLink className="w-4 h-4" /> DEX
            </a>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 text-center">
        <p className="text-[10px] text-white/20">Built with MemeLaunch • Not financial advice • DYOR 🐸</p>
      </div>
    </div>
  );
};

export default LivePreview;
