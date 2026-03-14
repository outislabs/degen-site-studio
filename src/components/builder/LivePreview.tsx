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
    <div className={cn('min-h-full rounded-xl overflow-hidden text-white relative')} style={{ background: style.bgGradient }}>
      {/* Ambient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full blur-[160px] opacity-[0.07] pointer-events-none" style={{ backgroundColor: style.accentHex }} />
      
      {/* Ticker */}
      <TickerTape name={data.name} ticker={data.ticker} accentHex={style.accentHex} />

      {/* Hero */}
      <div className="px-6 sm:px-10 pt-14 pb-12 text-center space-y-5 relative">
        {/* Decorative radial glow behind logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 rounded-full blur-[120px] opacity-15" style={{ background: `radial-gradient(circle, ${style.accentHex}, ${style.accentHex2}, transparent)` }} />
        </div>
        
        {data.logoUrl && (
          <div className="relative inline-block">
            <div className="absolute -inset-3 rounded-full blur-2xl opacity-30" style={{ background: `radial-gradient(circle, ${style.accentHex}, transparent)` }} />
            <img src={data.logoUrl} alt="Logo" className="w-28 h-28 rounded-full mx-auto animate-float object-cover relative z-10 ring-2 ring-white/10 shadow-2xl" />
          </div>
        )}
        
        <div className="space-y-3">
          <h1 className={cn('font-display text-2xl md:text-3xl tracking-tight', style.accent, style.glow)}>
            {data.name || 'Your Coin Name'}
          </h1>
          {data.ticker && (
            <span className={cn('inline-block px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider border', style.border, style.accent)}
              style={{ background: `${style.accentHex}08` }}>
              {data.ticker}
            </span>
          )}
        </div>
        
        <p className="text-base text-white/50 max-w-sm mx-auto leading-relaxed">
          {data.tagline || 'Your epic tagline goes here 🚀'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-3 pt-3">
          <button className={cn('px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.03]', style.button, style.buttonText)}>
            🚀 Buy Now
          </button>
          <button className={cn('px-7 py-3.5 rounded-xl font-bold text-sm border transition-all duration-300 hover:bg-white/5', style.border, style.accent)}>
            📊 Chart
          </button>
        </div>

        {/* Countdown */}
        {data.showCountdown && data.launchDate && (
          <div className="flex justify-center gap-2.5 mt-8">
            {Object.entries(countdown).map(([k, v]) => (
              <div key={k} className={cn('rounded-xl p-3.5 min-w-[65px]', style.cardBg)}
                style={{ boxShadow: `0 0 20px ${style.accentHex}08` }}>
                <div className={cn('font-display text-xl', style.accent)}>{v}</div>
                <div className="text-[9px] text-white/35 uppercase tracking-widest mt-1.5 font-medium">{k === 'd' ? 'days' : k === 'h' ? 'hrs' : k === 'm' ? 'min' : 'sec'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contract Address */}
      {data.contractAddress && (
        <div className="px-6 sm:px-10 pb-8">
          <div className={cn('p-4 rounded-xl flex items-center justify-between gap-3', style.cardBg)}
            style={{ boxShadow: `0 0 30px ${style.accentHex}05` }}>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-1.5 font-medium">Contract Address</p>
              <code className="text-xs text-white/60 truncate block font-mono">{data.contractAddress}</code>
            </div>
            <button className={cn('p-2.5 rounded-lg transition-all hover:bg-white/5', style.border)}
              style={{ borderWidth: '1px', borderColor: `${style.accentHex}15` }}>
              <Copy className={cn('w-4 h-4', style.accent)} />
            </button>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mx-6 sm:mx-10 h-px" style={{ background: `linear-gradient(90deg, transparent, ${style.accentHex}15, transparent)` }} />

      {/* Tokenomics */}
      <div className="px-6 sm:px-10 py-12 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[100px] opacity-[0.05] pointer-events-none" style={{ backgroundColor: style.accentHex2 }} />
        
        <div className="text-center mb-8">
          <span className={cn('inline-block text-[10px] tracking-[0.25em] uppercase font-medium px-4 py-1.5 rounded-full mb-3', style.accent)}
            style={{ background: `${style.accentHex}08`, border: `1px solid ${style.accentHex}12` }}>
            Tokenomics
          </span>
          <p className="text-sm text-white/35">How the supply is distributed</p>
        </div>
        
        <div className={cn('rounded-2xl p-6', style.cardBg)} style={{ boxShadow: `0 0 40px ${style.accentHex}05` }}>
          <div className="flex flex-col items-center gap-6">
            <p className="text-sm text-white/40">Total Supply: <span className="text-white/80 font-semibold">{data.totalSupply || '—'}</span></p>
            <DonutChart distribution={data.distribution} accentHex={style.accentHex} />
            <div className="flex gap-5 text-xs text-white/40 flex-wrap justify-center">
              <span className="flex items-center gap-1.5">Buy Tax: <strong className="text-white/80">{data.buyTax}%</strong></span>
              <span className="flex items-center gap-1.5">Sell Tax: <strong className="text-white/80">{data.sellTax}%</strong></span>
              <span className="flex items-center gap-1.5">LP: <strong className="text-white/80">{data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 sm:mx-10 h-px" style={{ background: `linear-gradient(90deg, transparent, ${style.accentHex}15, transparent)` }} />

      {/* Roadmap */}
      {data.roadmap.length > 0 && (
        <div className="px-6 sm:px-10 py-12">
          <div className="text-center mb-8">
            <span className={cn('inline-block text-[10px] tracking-[0.25em] uppercase font-medium px-4 py-1.5 rounded-full mb-3', style.accent)}
              style={{ background: `${style.accentHex}08`, border: `1px solid ${style.accentHex}12` }}>
              Roadmap
            </span>
            <p className="text-sm text-white/35">Our journey to the moon</p>
          </div>
          <div className="relative">
            {/* Timeline line with gradient */}
            <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg, ${style.accentHex}30, ${style.accentHex}08)` }} />
            <div className="space-y-5">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="relative pl-14">
                  {/* Timeline dot with glow */}
                  <div className="absolute left-3 top-5">
                    {i === 0 && <div className="absolute -inset-2 rounded-full blur-md opacity-40" style={{ backgroundColor: style.accentHex }} />}
                    <div className="w-4 h-4 rounded-full border-2 relative z-10" style={{ 
                      borderColor: style.accentHex, 
                      backgroundColor: i === 0 ? style.accentHex : 'transparent',
                      boxShadow: i === 0 ? `0 0 12px ${style.accentHex}60` : 'none'
                    }} />
                  </div>
                  <div className={cn('rounded-xl p-5', style.cardBg)} style={{ boxShadow: `0 0 20px ${style.accentHex}03` }}>
                    <h3 className="font-bold text-white/90 mb-3 flex items-center gap-2 text-sm">
                      <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-semibold', style.accent)}
                        style={{ background: `${style.accentHex}10`, border: `1px solid ${style.accentHex}18` }}>
                        Phase {i + 1}
                      </span>
                      <span>{phase.title.replace(/Phase \d+:\s*/, '')}</span>
                    </h3>
                    <ul className="space-y-2">
                      {phase.items.filter(Boolean).map((item, j) => (
                        <li key={j} className="text-sm text-white/50 flex items-start gap-2.5">
                          <span className={cn('mt-0.5 text-xs', style.accent)}>▸</span> {item}
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

      {/* Divider */}
      <div className="mx-6 sm:mx-10 h-px" style={{ background: `linear-gradient(90deg, transparent, ${style.accentHex}15, transparent)` }} />

      {/* Socials */}
      <div className="px-6 sm:px-10 py-10">
        <div className="text-center mb-5">
          <span className={cn('inline-block text-[10px] tracking-[0.25em] uppercase font-medium px-4 py-1.5 rounded-full', style.accent)}
            style={{ background: `${style.accentHex}08`, border: `1px solid ${style.accentHex}12` }}>
            Community
          </span>
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          {data.socials.telegram && (
            <a href="#" className={cn('px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/5 hover:scale-[1.03] flex items-center gap-2', style.accent)}
              style={{ border: `1px solid ${style.accentHex}18` }}>
              <Send className="w-4 h-4" /> Telegram
            </a>
          )}
          {data.socials.twitter && (
            <a href="#" className={cn('px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/5 hover:scale-[1.03] flex items-center gap-2', style.accent)}
              style={{ border: `1px solid ${style.accentHex}18` }}>
              𝕏 Twitter
            </a>
          )}
          {data.socials.discord && (
            <a href="#" className={cn('px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/5 hover:scale-[1.03] flex items-center gap-2', style.accent)}
              style={{ border: `1px solid ${style.accentHex}18` }}>
              <MessageCircle className="w-4 h-4" /> Discord
            </a>
          )}
          {data.socials.dex && (
            <a href="#" className={cn('px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/5 hover:scale-[1.03] flex items-center gap-2', style.accent)}
              style={{ border: `1px solid ${style.accentHex}18` }}>
              <ExternalLink className="w-4 h-4" /> DEX
            </a>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-10 py-5 text-center" style={{ borderTop: `1px solid ${style.accentHex}08` }}>
        <p className="text-[10px] text-white/15 tracking-wide">Built with Degen Tools • Not financial advice • DYOR 🐸</p>
      </div>
    </div>
  );
};

export default LivePreview;
