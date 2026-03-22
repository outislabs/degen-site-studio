import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Copy, Send, ExternalLink, Wallet, ArrowRight } from 'lucide-react';
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

const ComicHeroLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const ticker = cleanTicker(data.ticker);
  const buyUrl = getBuyUrl(data);

  return (
    <div className="min-h-full relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #00C853 0%, #00A844 40%, #1B5E20 100%)' }}>
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,200,83,0.35) 0%, transparent 70%)' }} />

      {/* Comic halftone dots overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
        backgroundSize: '12px 12px',
      }} />

      {/* ── NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-5 py-3" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2.5">
          {data.logoUrl && <img src={data.logoUrl} alt="" className="w-8 h-8 rounded-full border-2 border-white/20" />}
          <span className="font-black text-white text-sm tracking-wide uppercase">{data.name || 'TOKEN'}</span>
        </div>
        <div className="hidden md:flex items-center gap-5">
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider">𝕏 Twitter</a>
          )}
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Telegram</a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider">Discord</a>
          )}
        </div>
        <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-lg font-black text-white text-xs uppercase tracking-wider" style={{ background: '#E53935', boxShadow: '0 4px 20px rgba(229,57,53,0.4)' }}>
          Buy Now
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 px-5 pt-10 pb-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6">
          {/* Left: text */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-black uppercase leading-[0.85] mb-4" style={{
              fontSize: 'clamp(3.5rem, 14vw, 9rem)',
              color: '#FFD600',
              WebkitTextStroke: '4px black',
              paintOrder: 'stroke fill',
              textShadow: '6px 6px 0px rgba(0,0,0,0.5)',
              letterSpacing: '-0.02em',
            }}>
              ${ticker || 'TICKER'}
            </h2>
            <p className="text-white/90 font-bold text-base md:text-lg uppercase tracking-wide mb-4" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.4)' }}>
              {data.tagline || data.name || 'The next big thing'}
            </p>
            {data.contractAddress && (
              <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
                <code className="text-xs text-white/70 font-mono truncate max-w-[200px] md:max-w-[300px]">{data.contractAddress}</code>
                <button onClick={() => copyToClipboard(data.contractAddress)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Copy className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-5 justify-center md:justify-start">
              <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-7 py-3 rounded-xl font-black text-white text-sm uppercase tracking-wider" style={{ background: '#E53935', boxShadow: '0 4px 20px rgba(229,57,53,0.4)' }}>
                Buy ${ticker || 'Token'}
              </a>
              <a href={getChartUrl(data)} target="_blank" rel="noopener noreferrer" className="px-7 py-3 rounded-xl font-black text-sm uppercase tracking-wider border-2 border-white/30 text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Chart
              </a>
            </div>
          </div>
          {/* Right: mascot */}
          <div className="flex-shrink-0 relative">
            {data.logoUrl ? (
              <img src={data.logoUrl} alt={data.name} className="w-[220px] h-[220px] md:w-[300px] md:h-[300px] object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.4)]" style={{ filter: 'drop-shadow(0 0 30px rgba(255,214,0,0.3))' }} />
            ) : (
              <div className="w-[220px] h-[220px] md:w-[300px] md:h-[300px] rounded-full bg-black/20 border-4 border-dashed border-white/20 flex items-center justify-center">
                <span className="text-white/30 text-6xl">🦸</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── TICKER TAPE ── */}
      <div className="relative z-10 overflow-hidden py-2.5" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="animate-ticker whitespace-nowrap flex">
          {Array(16).fill(null).map((_, i) => (
            <span key={i} className="font-black text-xs mx-4 tracking-widest" style={{ color: '#FFD600' }}>
              ${ticker || 'TICKER'} ✦
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <TokenStatsBar contractAddress={data.contractAddress} style={style} />

      {/* ── COUNTDOWN ── */}
      {data.showCountdown && data.launchDate && (
        <section className="relative z-10 py-8 px-5">
          <CountdownBlock countdown={countdown} style={style} />
        </section>
      )}

      {/* ── ABOUT ── */}
      {data.description && (
        <section id="about" className="relative z-10 py-12 px-5" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="font-black text-center mb-8 uppercase" style={{
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              color: '#FFD600',
              WebkitTextStroke: '2px black',
              paintOrder: 'stroke fill',
              textShadow: '3px 3px 0px rgba(0,0,0,0.6)',
            }}>
              About
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Polaroid cards */}
              {data.logoUrl && (
                <div className="flex gap-4 flex-shrink-0">
                  <div className="bg-white p-2 pb-6 rounded shadow-xl" style={{ transform: 'rotate(-4deg)' }}>
                    <img src={data.logoUrl} alt="" className="w-28 h-28 object-cover rounded-sm" />
                  </div>
                  <div className="bg-white p-2 pb-6 rounded shadow-xl" style={{ transform: 'rotate(3deg)', marginTop: '16px' }}>
                    <img src={data.logoUrl} alt="" className="w-28 h-28 object-cover rounded-sm" />
                  </div>
                </div>
              )}
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line flex-1">{data.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── TOKENOMICS ── */}
      <section id="tokenomics" className="relative z-10 py-12 px-5">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-black text-center mb-8 uppercase" style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            color: '#FFD600',
            WebkitTextStroke: '2px black',
            paintOrder: 'stroke fill',
            textShadow: '3px 3px 0px rgba(0,0,0,0.6)',
          }}>
            Tokenomics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Supply', value: data.totalSupply || '—', bg: '#FFD600', text: '#000' },
              { label: 'Buy Tax', value: `${data.buyTax}%`, bg: '#E53935', text: '#fff' },
              { label: 'Sell Tax', value: `${data.sellTax}%`, bg: '#FF9800', text: '#000' },
              { label: 'Liquidity', value: data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned', bg: '#00C853', text: '#000' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-4 text-center font-black" style={{ background: item.bg, color: item.text, boxShadow: '4px 4px 0px rgba(0,0,0,0.3)' }}>
                <p className="text-[10px] uppercase tracking-wider opacity-70 mb-1">{item.label}</p>
                <p className="text-base md:text-lg">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <div className="relative">
              {data.logoUrl && (
                <img src={data.logoUrl} alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-white/20 z-10" />
              )}
              <DonutChart distribution={data.distribution} accentHex={style.accentHex} />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW TO BUY ── */}
      <section id="howtobuy" className="relative z-10 py-12 px-5" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div className="max-w-4xl mx-auto">
          <h3 className="font-black text-center mb-8 uppercase" style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            color: '#FFD600',
            WebkitTextStroke: '2px black',
            paintOrder: 'stroke fill',
            textShadow: '3px 3px 0px rgba(0,0,0,0.6)',
          }}>
            How to Buy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Get a Wallet', desc: 'Download Phantom or any Solana wallet', icon: <Wallet className="w-8 h-8" />, bg: '#FFD600' },
              { step: '02', title: `Get some ${data.blockchain === 'solana' ? 'SOL' : 'ETH'}`, desc: 'Buy from an exchange and send to your wallet', icon: <ArrowRight className="w-8 h-8" />, bg: '#FF9800' },
              { step: '03', title: 'Go to DEX', desc: `Swap for $${ticker || 'TOKEN'} using the contract address`, icon: <ExternalLink className="w-8 h-8" />, bg: '#E53935' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-6 text-center bg-black/40 border border-white/10 backdrop-blur-sm" style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.3)' }}>
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-black font-black" style={{ background: item.bg }}>
                  {item.icon}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Step {item.step}</p>
                <h4 className="font-black text-white text-lg mb-2">{item.title}</h4>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      {data.roadmap.length > 0 && (
        <section id="roadmap" className="relative z-10 py-12 px-5">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-black text-center mb-8 uppercase" style={{
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              color: '#FFD600',
              WebkitTextStroke: '2px black',
              paintOrder: 'stroke fill',
              textShadow: '3px 3px 0px rgba(0,0,0,0.6)',
            }}>
              Roadmap
            </h3>
            <div className="space-y-4">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="rounded-2xl p-5 bg-black/40 border border-white/10 backdrop-blur-sm" style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.3)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full font-black text-sm flex items-center justify-center text-black" style={{ background: '#FFD600' }}>
                      {i + 1}
                    </span>
                    <h4 className="font-black text-white text-base uppercase">{phase.title.replace(/Phase \d+:\s*/, '')}</h4>
                  </div>
                  <ul className="space-y-1.5 pl-11">
                    {phase.items.filter(Boolean).map((item, j) => (
                      <li key={j} className="text-sm text-white/60 flex items-start gap-2">
                        <span className="text-[#FFD600] mt-0.5">▸</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <Footer style={style} showWatermark={showWatermark} />
    </div>
  );
};

export default ComicHeroLayout;
