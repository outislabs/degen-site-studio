import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Copy, Send, MessageCircle, ExternalLink } from 'lucide-react';
import DonutChart from '../DonutChart';
import { CountdownBlock, Footer, ensureUrl, copyToClipboard, getBuyUrl, getChartUrl, cleanTicker } from './shared';
import TokenStatsBar from '../TokenStatsBar';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
  showWatermark?: boolean;
}

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ---- Cloud shape component ---- */
const Cloud = ({ className, style: s }: { className?: string; style?: React.CSSProperties }) => (
  <div className={cn('absolute pointer-events-none', className)} style={s}>
    <div className="relative">
      <div className="bg-white rounded-[50px] w-[120px] h-[50px] opacity-90" />
      <div className="bg-white rounded-[50px] w-[70px] h-[50px] absolute -top-[22px] left-[16px] opacity-90" />
      <div className="bg-white rounded-[50px] w-[55px] h-[40px] absolute -top-[14px] left-[52px] opacity-90" />
    </div>
  </div>
);

const SmallCloud = ({ className, style: s }: { className?: string; style?: React.CSSProperties }) => (
  <div className={cn('absolute pointer-events-none', className)} style={s}>
    <div className="relative">
      <div className="bg-white rounded-[40px] w-[80px] h-[35px] opacity-80" />
      <div className="bg-white rounded-[40px] w-[50px] h-[35px] absolute -top-[16px] left-[12px] opacity-80" />
      <div className="bg-white rounded-[40px] w-[38px] h-[28px] absolute -top-[10px] left-[36px] opacity-80" />
    </div>
  </div>
);

const CartoonSkyLayout = ({ data, style, countdown, showWatermark }: Props) => {
  /* detect light / yellow variant */
  const isYellow = style.id === 'sponge-pop' || style.bgGradient.includes('#ff') || style.bgGradient.includes('#FF');
  const darkText = 'text-[#1a1a2e]';
  const subtleText = 'text-[#1a1a2e]/60';
  const cardBorder = isYellow ? '#e6a800' : '#4a8db7';
  const cardBg = isYellow ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.55)';

  return (
    <div className="relative overflow-hidden" style={{
      background: style.bgGradient,
      backgroundImage: `${style.bgGradient}, 
        linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
      backgroundSize: '100% 100%, 40px 40px, 40px 40px',
    }}>
      {/* ---- Scattered clouds ---- */}
      <Cloud className="top-[8%] left-[-20px] scale-75 opacity-60" />
      <SmallCloud className="top-[15%] right-[5%] scale-90 opacity-50" />
      <Cloud className="top-[35%] right-[-30px] scale-60 opacity-40" />
      <SmallCloud className="top-[55%] left-[8%] scale-80 opacity-45" />

      {/* Bottom cloud ground layer */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0">
        <Cloud className="bottom-[10px] left-[2%]" style={{ transform: 'scale(1.8)' }} />
        <Cloud className="bottom-[5px] left-[25%]" style={{ transform: 'scale(1.4)' }} />
        <SmallCloud className="bottom-[20px] left-[50%]" style={{ transform: 'scale(1.6)' }} />
        <Cloud className="bottom-[0px] left-[65%]" style={{ transform: 'scale(2)' }} />
        <SmallCloud className="bottom-[15px] right-[5%]" style={{ transform: 'scale(1.3)' }} />
        <Cloud className="bottom-[-5px] right-[-20px]" style={{ transform: 'scale(1.5)' }} />
      </div>

      {/* ---- Nav Bar ---- */}
      <nav className="relative z-20 px-5 sm:px-8 py-3.5 flex items-center justify-between"
        style={{ borderBottom: `3px solid rgba(0,0,0,0.08)` }}>
        <div className="flex items-center gap-2.5">
          {data.logoUrl && (
            <img src={data.logoUrl} alt="" className="w-9 h-9 rounded-xl object-cover"
              style={{ border: '3px solid rgba(0,0,0,0.15)' }} />
          )}
          <span className={cn('font-display text-sm font-black uppercase tracking-wide', darkText)}>
            {data.name || 'TOKEN'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
            {['Home', 'About', 'Tokenomics', 'Roadmap'].map((s, i) => (
              <span key={s} onClick={() => i > 0 && scrollTo(`csky-${s.toLowerCase()}`)}
                className={cn('cursor-pointer hover:opacity-70 transition-opacity', darkText)}>
                {s}
              </span>
            ))}
          </div>
          <a href={getBuyUrl(data)} target="_blank" rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl font-black text-xs text-white transition-all hover:scale-[1.05] inline-flex items-center"
            style={{
              background: '#1a1a2e',
              border: '3px solid #000',
              boxShadow: '0 4px 0 #000',
            }}>
            Buy Now
          </a>
        </div>
      </nav>

      {/* ---- Hero Section ---- */}
      <div className="relative z-10 px-6 sm:px-10 pt-12 pb-8 text-center">
        {/* Large Logo */}
        {data.logoUrl && (
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 rounded-full blur-3xl opacity-20"
              style={{ background: style.accentHex }} />
            <img src={data.logoUrl} alt="Mascot"
              className="w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[300px] md:h-[300px] rounded-[2rem] mx-auto object-cover relative z-10"
              style={{
                border: '5px solid rgba(0,0,0,0.2)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 8px 0 rgba(0,0,0,0.1)',
              }} />
          </div>
        )}

        {/* Massive token name */}
        <h1 className={cn('font-display leading-none mb-3', darkText)}
          style={{
            fontSize: 'clamp(3rem, 12vw, 7.5rem)',
            fontWeight: 900,
            textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
            color: '#fff',
            WebkitTextStroke: '2px #000',
            paintOrder: 'stroke fill',
            letterSpacing: '-0.02em',
          }}>
          {data.name || 'YOUR COIN'}
        </h1>

        {/* Tagline */}
        <p className="text-sm sm:text-base font-bold uppercase tracking-[0.15em] mb-8"
          style={{ color: 'rgba(26,26,46,0.7)' }}>
          {data.tagline || 'The most fun token on the blockchain!'}
        </p>

        {data.showCountdown && data.launchDate && (
          <div className="mb-6"><CountdownBlock countdown={countdown} style={style} /></div>
        )}

        {/* Contract address field */}
        {data.contractAddress && (
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '3px solid rgba(0,0,0,0.15)',
                boxShadow: '0 4px 0 rgba(0,0,0,0.08)',
              }}>
              <code className={cn('flex-1 px-4 py-3 text-xs font-mono truncate', darkText)}>
                {data.contractAddress}
              </code>
              <button onClick={() => copyToClipboard(data.contractAddress)}
                className="px-4 py-3 font-bold text-xs text-white flex items-center gap-1.5 transition-all hover:opacity-80"
                style={{ background: '#1a1a2e' }}>
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={getBuyUrl(data)} target="_blank" rel="noopener noreferrer"
            className="px-10 py-4 rounded-2xl font-black text-base text-white transition-all hover:scale-[1.05] inline-flex items-center justify-center gap-2"
            style={{
              background: '#1a1a2e',
              border: '3px solid #000',
              boxShadow: '0 6px 0 #000',
            }}>
            🚀 Buy ${cleanTicker(data.ticker) || 'TOKEN'}
          </a>
          <a href={getChartUrl(data)} target="_blank" rel="noopener noreferrer"
            className={cn('px-10 py-4 rounded-2xl font-black text-base transition-all hover:scale-[1.05] inline-flex items-center justify-center gap-2', darkText)}
            style={{
              background: 'rgba(255,255,255,0.7)',
              border: '3px solid rgba(0,0,0,0.15)',
              boxShadow: '0 6px 0 rgba(0,0,0,0.08)',
            }}>
            📊 See Whitepaper
          </a>
        </div>
      </div>

      {/* ---- Stats Bar ---- */}
      <div className="relative z-10">
        <TokenStatsBar contractAddress={data.contractAddress} style={style} />
      </div>

      {/* ---- About Section ---- */}
      {data.description && (
        <div id="csky-about" className="relative z-10 px-6 sm:px-10 py-10">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-6 font-black"
            style={{
              color: '#fff',
              textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
              WebkitTextStroke: '1px #000',
            }}>
            About {data.name || 'This Token'} ☁️
          </h2>
          <div className="max-w-xl mx-auto rounded-2xl p-6 text-center backdrop-blur-sm"
            style={{ background: cardBg, border: `3px solid rgba(0,0,0,0.1)`, boxShadow: '0 6px 0 rgba(0,0,0,0.06)' }}>
            <p className={cn('text-sm leading-relaxed whitespace-pre-line', subtleText)}>{data.description}</p>
          </div>
        </div>
      )}

      {/* ---- Tokenomics ---- */}
      <div id="csky-tokenomics" className="relative z-10 px-6 sm:px-10 py-10">
        <h2 className="font-display text-2xl md:text-3xl text-center mb-8 font-black"
          style={{
            color: '#fff',
            textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
            WebkitTextStroke: '1px #000',
          }}>
          Tokenomics 📊
        </h2>
        <div className="max-w-xl mx-auto rounded-2xl p-6 backdrop-blur-sm"
          style={{ background: cardBg, border: `3px solid rgba(0,0,0,0.1)`, boxShadow: '0 6px 0 rgba(0,0,0,0.06)' }}>
          <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full text-center">
              {[
                { label: 'Token', value: data.name || '—', emoji: '🪙' },
                { label: 'Ticker', value: data.ticker ? `$${cleanTicker(data.ticker)}` : '—', emoji: '💎' },
                { label: 'Chain', value: data.blockchain || 'Solana', emoji: '⛓️' },
                { label: 'Supply', value: data.totalSupply || '—', emoji: '📦' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.5)', border: '2px solid rgba(0,0,0,0.08)' }}>
                  <div className="text-lg mb-1">{s.emoji}</div>
                  <p className={cn('font-bold text-xs', darkText)}>{s.value}</p>
                  <p className="text-[9px] text-[#1a1a2e]/40 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <DonutChart distribution={data.distribution} accentHex={style.accentHex} />
            <div className={cn('flex gap-4 text-xs', subtleText)}>
              <span>Buy Tax: <strong className={darkText}>{data.buyTax}%</strong></span>
              <span>Sell Tax: <strong className={darkText}>{data.sellTax}%</strong></span>
              <span>LP: <strong className={darkText}>{data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Roadmap ---- */}
      {data.roadmap.length > 0 && (
        <div id="csky-roadmap" className="relative z-10 px-6 sm:px-10 py-10">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-8 font-black"
            style={{
              color: '#fff',
              textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
              WebkitTextStroke: '1px #000',
            }}>
            Roadmap 🗺️
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {data.roadmap.map((phase, i) => (
              <div key={phase.id} className="rounded-2xl p-5 transition-all hover:scale-[1.02] backdrop-blur-sm"
                style={{ background: cardBg, border: '3px solid rgba(0,0,0,0.1)', boxShadow: '0 6px 0 rgba(0,0,0,0.06)' }}>
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black mb-3"
                  style={{ background: 'rgba(0,0,0,0.08)', border: '2px solid rgba(0,0,0,0.1)', color: '#1a1a2e' }}>
                  Phase {i + 1} {i === 0 ? '🔥' : i === 1 ? '📈' : '🌙'}
                </div>
                <h3 className={cn('font-bold text-sm mb-3', darkText)}>
                  {phase.title.replace(/Phase \d+:\s*/, '')}
                </h3>
                <ul className="space-y-1.5">
                  {phase.items.filter(Boolean).map((item, j) => (
                    <li key={j} className={cn('text-xs flex items-start gap-2', subtleText)}>
                      <span className={darkText}>✦</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Community ---- */}
      <div className="relative z-10 px-6 sm:px-10 py-10">
        <h2 className="font-display text-2xl md:text-3xl text-center mb-6 font-black"
          style={{
            color: '#fff',
            textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
            WebkitTextStroke: '1px #000',
          }}>
          Join the Fun 🎉
        </h2>
        <div className="flex justify-center gap-3 flex-wrap">
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer"
              className={cn('px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.05] flex items-center gap-2', darkText)}
              style={{ background: 'rgba(255,255,255,0.7)', border: '3px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 0 rgba(0,0,0,0.06)' }}>
              <Send className="w-4 h-4" /> Telegram
            </a>
          )}
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer"
              className={cn('px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.05] flex items-center gap-2', darkText)}
              style={{ background: 'rgba(255,255,255,0.7)', border: '3px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 0 rgba(0,0,0,0.06)' }}>
              𝕏 Twitter
            </a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer"
              className={cn('px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.05] flex items-center gap-2', darkText)}
              style={{ background: 'rgba(255,255,255,0.7)', border: '3px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 0 rgba(0,0,0,0.06)' }}>
              <MessageCircle className="w-4 h-4" /> Discord
            </a>
          )}
          {data.socials.dex && (
            <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer"
              className={cn('px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.05] flex items-center gap-2', darkText)}
              style={{ background: 'rgba(255,255,255,0.7)', border: '3px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 0 rgba(0,0,0,0.06)' }}>
              <ExternalLink className="w-4 h-4" /> DEX
            </a>
          )}
        </div>
      </div>

      {/* ---- Footer ---- */}
      <div className="relative z-10 pb-20">
        <Footer style={style} showWatermark={showWatermark} />
      </div>
    </div>
  );
};

export default CartoonSkyLayout;
