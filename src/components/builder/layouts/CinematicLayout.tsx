import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Copy, Send, MessageCircle, ExternalLink } from 'lucide-react';
import TickerTape from '../TickerTape';
import DonutChart from '../DonutChart';
import { CountdownBlock, Footer, ensureUrl, copyToClipboard } from './shared';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
}

const CinematicLayout = ({ data, style, countdown }: Props) => {
  return (
    <>
      {/* Dramatic ambient layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[300px] opacity-[0.06]" style={{ backgroundColor: style.accentHex }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[250px] opacity-[0.04]" style={{ backgroundColor: style.accentHex2 }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[200px] blur-[150px] opacity-[0.03]" style={{ background: `linear-gradient(90deg, transparent, ${style.accentHex}, transparent)` }} />
      </div>

      {/* Cinematic Full Hero */}
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 sm:px-10 text-center">
        {/* Vignette overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)' }} />

        {/* Logo with dramatic glow */}
        {data.logoUrl && (
          <div className="relative mb-8 z-10">
            <div className="absolute -inset-12 rounded-full blur-[80px] opacity-25" style={{ background: `radial-gradient(circle, ${style.accentHex}, ${style.accentHex2}, transparent)` }} />
            <img src={data.logoUrl} alt="Logo" className="w-36 h-36 md:w-48 md:h-48 rounded-2xl object-cover relative z-10 shadow-2xl" 
              style={{ boxShadow: `0 25px 80px ${style.accentHex}30, 0 0 150px ${style.accentHex}08` }} />
          </div>
        )}

        {/* Massive Title - Cinematic style */}
        <h1 className={cn('font-display text-4xl md:text-7xl tracking-tight mb-3 relative z-10', style.accent)}
          style={{ 
            textShadow: `0 0 80px ${style.accentHex}50, 0 0 160px ${style.accentHex}20, 0 4px 20px rgba(0,0,0,0.5)`,
            WebkitTextStroke: `0.5px ${style.accentHex}40`
          }}>
          {data.name || 'YOUR COIN'}
        </h1>

        {data.ticker && (
          <div className={cn('text-sm tracking-[0.4em] uppercase font-medium mb-6 relative z-10', style.accent)} style={{ opacity: 0.6 }}>
            ${data.ticker}
          </div>
        )}

        <p className="text-lg md:text-xl text-white/40 max-w-xl mx-auto leading-relaxed mb-8 relative z-10">
          {data.tagline || 'The next generation of meme coins. Built different.'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center relative z-10 mb-6">
          <button className={cn('px-10 py-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.05]', style.button, style.buttonText)}
            style={{ boxShadow: `0 0 40px ${style.accentHex}30, 0 10px 30px rgba(0,0,0,0.3)` }}>
            🚀 Buy Now
          </button>
          <button className={cn('px-10 py-4 rounded-xl font-bold text-sm border transition-all duration-300 hover:bg-white/5', style.border, style.accent)}>
            📊 Chart
          </button>
        </div>

        {data.showCountdown && data.launchDate && <div className="relative z-10"><CountdownBlock countdown={countdown} style={style} /></div>}
      </div>

      {/* Ticker Tape */}
      <TickerTape name={data.name} ticker={data.ticker} accentHex={style.accentHex} />

      {/* Contract Address - Cinematic bar */}
      {data.contractAddress && (
        <div className="px-6 sm:px-10 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 rounded-2xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${style.accentHex}08, ${style.accentHex2}05)`, border: `1px solid ${style.accentHex}12` }}>
              <div className="absolute inset-0 opacity-5" style={{ background: `repeating-linear-gradient(90deg, transparent, transparent 10px, ${style.accentHex}08 10px, ${style.accentHex}08 11px)` }} />
              <div className="flex-1 min-w-0 relative z-10">
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/25 mb-1.5 font-medium">Contract Address</p>
                <code className="text-sm text-white/60 truncate block font-mono">{data.contractAddress}</code>
              </div>
              <button className={cn('px-6 py-2.5 rounded-lg font-bold text-xs transition-all hover:scale-[1.03] relative z-10 flex items-center gap-2', style.button, style.buttonText)}>
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Section - Full width dramatic */}
      <div className="px-6 sm:px-10 py-16 relative">
        <div className="absolute left-0 top-0 w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${style.accentHex}15, transparent)` }} />
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={cn('font-display text-xl md:text-3xl mb-6', style.accent)} style={{ textShadow: `0 0 40px ${style.accentHex}25` }}>
            What is {data.name || 'This Token'}?
          </h2>
          <p className="text-base text-white/35 leading-relaxed max-w-xl mx-auto">
            {data.tagline || 'A community-driven token built for degens, by degens.'} Join a thriving community of holders and be part of something legendary.
          </p>
        </div>
      </div>

      {/* Tokenomics - Cinematic cards */}
      <div className="px-6 sm:px-10 py-12 relative">
        <h2 className={cn('font-display text-xl md:text-2xl text-center mb-10', style.accent)} style={{ textShadow: `0 0 40px ${style.accentHex}25` }}>
          Tokenomics
        </h2>

        <div className="max-w-3xl mx-auto">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Token Name', value: data.name || '—' },
              { label: 'Ticker', value: data.ticker ? `$${data.ticker}` : '—' },
              { label: 'Blockchain', value: data.blockchain || 'Solana' },
              { label: 'Total Supply', value: data.totalSupply || '—' },
            ].map(s => (
              <div key={s.label} className={cn('rounded-xl p-4 text-center', style.cardBg)} style={{ boxShadow: `0 0 25px ${style.accentHex}04` }}>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/25 mb-1.5 font-medium">{s.label}</p>
                <p className={cn('font-bold text-sm', style.accent)}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className={cn('rounded-2xl p-8', style.cardBg)} style={{ boxShadow: `0 0 50px ${style.accentHex}05` }}>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <DonutChart distribution={data.distribution} accentHex={style.accentHex} />
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-white/30">Buy Tax:</span>
                  <span className={cn('font-bold', style.accent)}>{data.buyTax}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/30">Sell Tax:</span>
                  <span className={cn('font-bold', style.accent)}>{data.sellTax}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/30">Liquidity:</span>
                  <span className={cn('font-bold', style.accent)}>{data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap - Horizontal cinematic */}
      {data.roadmap.length > 0 && (
        <div className="px-6 sm:px-10 py-16 relative">
          <div className="absolute left-0 top-0 w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${style.accentHex}15, transparent)` }} />
          <h2 className={cn('font-display text-xl md:text-2xl text-center mb-10', style.accent)} style={{ textShadow: `0 0 40px ${style.accentHex}25` }}>
            Roadmap
          </h2>
          <div className="max-w-3xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-8 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${style.accentHex}30, transparent)` }} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="relative">
                  {/* Dot */}
                  <div className="hidden sm:flex absolute top-6 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-4 h-4 rounded-full border-2" style={{
                      borderColor: style.accentHex,
                      backgroundColor: i === 0 ? style.accentHex : 'transparent',
                      boxShadow: i === 0 ? `0 0 15px ${style.accentHex}60` : 'none'
                    }} />
                  </div>
                  <div className={cn('rounded-2xl p-5 sm:mt-14', style.cardBg)} style={{ boxShadow: `0 0 30px ${style.accentHex}04` }}>
                    <span className={cn('text-[10px] px-3 py-1 rounded-full font-semibold inline-block mb-3', style.accent)} style={{ background: `${style.accentHex}10`, border: `1px solid ${style.accentHex}18` }}>Phase {i + 1}</span>
                    <h3 className="font-bold text-white/90 text-sm mb-3">{phase.title.replace(/Phase \d+:\s*/, '')}</h3>
                    <ul className="space-y-1.5">
                      {phase.items.filter(Boolean).map((item, j) => (
                        <li key={j} className="text-xs text-white/40 flex items-start gap-2">
                          <span className={cn('mt-0.5', style.accent)}>▸</span> {item}
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

      {/* Community */}
      <div className="px-6 sm:px-10 py-12 relative">
        <div className="absolute left-0 top-0 w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${style.accentHex}15, transparent)` }} />
        <h2 className={cn('font-display text-xl md:text-2xl text-center mb-8', style.accent)} style={{ textShadow: `0 0 40px ${style.accentHex}25` }}>
          Join the Community
        </h2>
        <div className="flex justify-center gap-4 flex-wrap">
          {data.socials.telegram && (
            <a href="#" className={cn('px-8 py-4 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.03] flex items-center gap-2', style.accent)}
              style={{ border: `1px solid ${style.accentHex}18`, background: `${style.accentHex}05` }}>
              <Send className="w-4 h-4" /> Telegram
            </a>
          )}
          {data.socials.twitter && (
            <a href="#" className={cn('px-8 py-4 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.03] flex items-center gap-2', style.accent)}
              style={{ border: `1px solid ${style.accentHex}18`, background: `${style.accentHex}05` }}>
              𝕏 Twitter
            </a>
          )}
          {data.socials.discord && (
            <a href="#" className={cn('px-8 py-4 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.03] flex items-center gap-2', style.accent)}
              style={{ border: `1px solid ${style.accentHex}18`, background: `${style.accentHex}05` }}>
              <MessageCircle className="w-4 h-4" /> Discord
            </a>
          )}
          {data.socials.dex && (
            <a href="#" className={cn('px-8 py-4 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.03] flex items-center gap-2', style.accent)}
              style={{ border: `1px solid ${style.accentHex}18`, background: `${style.accentHex}05` }}>
              <ExternalLink className="w-4 h-4" /> DEX
            </a>
          )}
        </div>
      </div>

      <TickerTape name={data.name} ticker={data.ticker} accentHex={style.accentHex} />
      <Footer style={style} />
    </>
  );
};

export default CinematicLayout;
