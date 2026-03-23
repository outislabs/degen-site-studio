import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Copy, Send, ExternalLink, Wallet, ArrowRight } from 'lucide-react';
import DonutChart from '../DonutChart';
import { CountdownBlock, Footer, ensureUrl, copyToClipboard, getBuyUrl, getChartUrl, cleanTicker } from './shared';
import TokenStatsBar from '../TokenStatsBar';
import { useEffect, useState } from 'react';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
  showWatermark?: boolean;
}

const MONO = "'Courier New', 'Lucida Console', monospace";
const GREEN = '#00FF41';
const DIM_GREEN = 'rgba(0,255,65,0.5)';
const FAINT_GREEN = 'rgba(0,255,65,0.15)';

/* Blinking cursor */
const Cursor = () => (
  <span className="inline-block w-[2px] h-[1.1em] ml-1 align-middle animate-pulse" style={{ background: GREEN }} />
);

const TerminalLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const ticker = cleanTicker(data.ticker);
  const buyUrl = getBuyUrl(data);

  /* Typing effect for hero */
  const fullText = `$${ticker || 'TICKER'}`;
  const [typed, setTyped] = useState('');
  const [doneTyping, setDoneTyping] = useState(false);

  useEffect(() => {
    setTyped('');
    setDoneTyping(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i > fullText.length) {
        setDoneTyping(true);
        clearInterval(iv);
      } else {
        setTyped(fullText.slice(0, i));
      }
    }, 90);
    return () => clearInterval(iv);
  }, [fullText]);

  return (
    <div className="min-h-full relative overflow-hidden" style={{
      background: '#000',
      fontFamily: MONO,
      color: GREEN,
      borderRadius: '12px',
      boxShadow: `inset 0 0 120px rgba(0,255,65,0.03), inset 0 0 60px rgba(0,0,0,0.6)`,
    }}>
      {/* CRT curvature + vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-[5]" style={{
        background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.65) 100%)',
        borderRadius: '12px',
      }} />
      {/* CRT flicker */}
      <style>{`
        @keyframes crt-flicker {
          0%, 100% { opacity: 1; }
          3% { opacity: 0.97; }
          6% { opacity: 1; }
          42% { opacity: 0.98; }
          44% { opacity: 1; }
          92% { opacity: 0.96; }
          94% { opacity: 1; }
        }
        @keyframes crt-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
      {/* Flicker wrapper */}
      <div className="absolute inset-0 pointer-events-none z-[2]" style={{ animation: 'crt-flicker 4s infinite' }} />
      {/* Moving scanline bar */}
      <div className="absolute left-0 right-0 h-[2px] pointer-events-none z-[3] opacity-[0.07]" style={{
        background: GREEN,
        animation: 'crt-line 6s linear infinite',
      }} />
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-[1]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)',
      }} />
      {/* Faint falling chars column effect */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.06]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='120'%3E%3Ctext x='10' y='20' fill='%2300FF41' font-family='monospace' font-size='14'%3E0%3C/text%3E%3Ctext x='30' y='50' fill='%2300FF41' font-family='monospace' font-size='14'%3E1%3C/text%3E%3Ctext x='5' y='80' fill='%2300FF41' font-family='monospace' font-size='14'%3Eア%3C/text%3E%3Ctext x='40' y='110' fill='%2300FF41' font-family='monospace' font-size='14'%3E$%3C/text%3E%3C/svg%3E")`,
        backgroundSize: '60px 120px',
      }} />

      {/* ── NAV ── */}
      <nav className="relative z-10 flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b" style={{ borderColor: FAINT_GREEN, background: 'rgba(0,0,0,0.8)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden sm:inline" style={{ color: DIM_GREEN }}>{'>'}_</span>
          <span className="font-bold text-xs sm:text-sm tracking-wider uppercase truncate max-w-[120px] sm:max-w-none">{data.name || 'TOKEN'}</span>
        </div>
        <div className="hidden md:flex items-center gap-5 text-xs">
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: DIM_GREEN }}>𝕏_twitter</a>
          )}
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1" style={{ color: DIM_GREEN }}><Send className="w-3 h-3" />telegram</a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: DIM_GREEN }}>discord</a>
          )}
        </div>
        <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider border flex-shrink-0" style={{ borderColor: GREEN, color: GREEN, background: 'transparent' }}>
          [Buy]
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 px-4 sm:px-5 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center md:flex-row md:items-center gap-6 sm:gap-8">
          {/* Logo first on mobile, right on desktop */}
          <div className="flex-shrink-0 order-first md:order-last">
            <div className="border-2 p-1 relative" style={{ borderColor: GREEN, boxShadow: `0 0 30px ${FAINT_GREEN}` }}>
              <span className="absolute -top-3 -left-3 text-lg font-bold" style={{ color: GREEN }}>[</span>
              <span className="absolute -top-3 -right-3 text-lg font-bold" style={{ color: GREEN }}>]</span>
              <span className="absolute -bottom-3 -left-3 text-lg font-bold" style={{ color: GREEN }}>[</span>
              <span className="absolute -bottom-3 -right-3 text-lg font-bold" style={{ color: GREEN }}>]</span>
              {data.logoUrl ? (
                <img src={data.logoUrl} alt={data.name} className="w-[140px] h-[140px] sm:w-[200px] sm:h-[200px] md:w-[260px] md:h-[260px] object-contain" />
              ) : (
                <div className="w-[140px] h-[140px] sm:w-[200px] sm:h-[200px] md:w-[260px] md:h-[260px] flex items-center justify-center" style={{ background: 'rgba(0,255,65,0.03)' }}>
                  <span className="text-3xl sm:text-5xl">{'>'}_</span>
                </div>
              )}
            </div>
          </div>
          {/* Text content */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-[10px] sm:text-xs mb-2 sm:mb-3" style={{ color: DIM_GREEN }}>{'>'} LOADING {fullText}...</p>
            <h2 className="font-bold leading-none mb-3 sm:mb-4" style={{
              fontSize: 'clamp(1.8rem, 8vw, 6rem)',
              color: GREEN,
              textShadow: `0 0 20px ${FAINT_GREEN}, 0 0 40px rgba(0,255,65,0.08)`,
              letterSpacing: '-0.02em',
            }}>
              {doneTyping ? fullText : typed}<Cursor />
            </h2>
            <p className="text-xs sm:text-sm mb-4 sm:mb-5" style={{ color: DIM_GREEN }}>
              // {data.tagline || data.name || 'Your path to the moon'}
            </p>
            {data.contractAddress && (
              <div className="flex items-center gap-2 mb-4 sm:mb-5 px-2 sm:px-3 py-2 border" style={{ borderColor: FAINT_GREEN, background: 'rgba(0,255,65,0.03)' }}>
                <span className="text-[10px] sm:text-xs flex-shrink-0" style={{ color: DIM_GREEN }}>$</span>
                <code className="text-[10px] sm:text-xs truncate flex-1" style={{ color: GREEN }}>{data.contractAddress}</code>
                <button onClick={() => copyToClipboard(data.contractAddress)} className="p-1 hover:bg-white/5 transition-colors flex-shrink-0">
                  <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: GREEN }} />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
              <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold border tracking-wider hover:bg-[rgba(0,255,65,0.1)] transition-colors" style={{ borderColor: GREEN, color: GREEN }}>
                [BUY ${ticker || 'TOKEN'}]
              </a>
              <a href={getChartUrl(data)} target="_blank" rel="noopener noreferrer" className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold border tracking-wider hover:bg-[rgba(0,255,65,0.1)] transition-colors flex items-center gap-2" style={{ borderColor: DIM_GREEN, color: DIM_GREEN }}>
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> [CHART]
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS (terminal style) ── */}
      <section className="relative z-10 px-3 sm:px-5 py-4 sm:py-6 border-t border-b" style={{ borderColor: FAINT_GREEN }}>
        <TokenStatsBar contractAddress={data.contractAddress} style={style} />
      </section>

      {/* ── COUNTDOWN ── */}
      {data.showCountdown && data.launchDate && (
        <section className="relative z-10 py-6 sm:py-8 px-3 sm:px-5">
          <CountdownBlock countdown={countdown} style={style} />
        </section>
      )}

      {/* ── ABOUT ── */}
      {data.description && (
        <section id="about" className="relative z-10 py-8 sm:py-10 px-3 sm:px-5 border-t" style={{ borderColor: FAINT_GREEN }}>
          <div className="max-w-3xl mx-auto">
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 uppercase" style={{ color: GREEN, textShadow: `0 0 10px ${FAINT_GREEN}` }}>
              {'>'} cat about.txt
            </h3>
            <div className="px-3 sm:px-4 py-3 sm:py-4 border" style={{ borderColor: FAINT_GREEN, background: 'rgba(0,255,65,0.02)' }}>
              <p className="text-[10px] sm:text-xs mb-2" style={{ color: DIM_GREEN }}>/*</p>
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line" style={{ color: DIM_GREEN }}>
                {data.description}
              </p>
              <p className="text-[10px] sm:text-xs mt-2" style={{ color: DIM_GREEN }}>*/</p>
            </div>
          </div>
        </section>
      )}

      {/* ── TOKENOMICS ── */}
      <section id="tokenomics" className="relative z-10 py-8 sm:py-10 px-3 sm:px-5 border-t" style={{ borderColor: FAINT_GREEN }}>
        <div className="max-w-3xl mx-auto">
          <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 uppercase" style={{ color: GREEN, textShadow: `0 0 10px ${FAINT_GREEN}` }}>
            {'>'} cat tokenomics.dat
          </h3>
          {/* ASCII table — desktop only */}
          <div className="hidden sm:block text-xs leading-relaxed mb-6 overflow-x-auto" style={{ color: GREEN }}>
            <pre className="inline-block min-w-[320px]">
{`┌──────────────────┬───────────────────────┐
│  FIELD           │  VALUE                │
├──────────────────┼───────────────────────┤
│  Total Supply    │  ${(data.totalSupply || '—').padEnd(22)}│
│  Buy Tax         │  ${(data.buyTax + '%').padEnd(22)}│
│  Sell Tax        │  ${(data.sellTax + '%').padEnd(22)}│
│  LP Status       │  ${(data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned').padEnd(22)}│
│  LP Pool         │  ${(data.distribution.lp + '%').padEnd(22)}│
│  Team            │  ${(data.distribution.team + '%').padEnd(22)}│
│  Marketing       │  ${(data.distribution.marketing + '%').padEnd(22)}│
│  Burn            │  ${(data.distribution.burn + '%').padEnd(22)}│
└──────────────────┴───────────────────────┘`}
            </pre>
          </div>
          {/* Mobile: compact list */}
          <div className="sm:hidden space-y-1.5 mb-5 text-[11px]" style={{ color: GREEN }}>
            {[
              ['Supply', data.totalSupply || '—'],
              ['Buy Tax', data.buyTax + '%'],
              ['Sell Tax', data.sellTax + '%'],
              ['LP Status', data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned'],
              ['LP Pool', data.distribution.lp + '%'],
              ['Team', data.distribution.team + '%'],
              ['Marketing', data.distribution.marketing + '%'],
              ['Burn', data.distribution.burn + '%'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between px-2 py-1.5 border-b" style={{ borderColor: FAINT_GREEN }}>
                <span style={{ color: DIM_GREEN }}>$ {label}</span>
                <span>{val}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <DonutChart distribution={data.distribution} accentHex={GREEN} />
          </div>
        </div>
      </section>

      {/* ── HOW TO BUY ── */}
      <section id="howtobuy" className="relative z-10 py-8 sm:py-10 px-3 sm:px-5 border-t" style={{ borderColor: FAINT_GREEN }}>
        <div className="max-w-3xl mx-auto">
          <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 uppercase" style={{ color: GREEN, textShadow: `0 0 10px ${FAINT_GREEN}` }}>
            {'>'} ./how-to-buy.sh
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {[
              { step: '01', cmd: 'install_wallet', title: 'Get a Wallet', desc: 'Download Phantom or any Solana-compatible wallet', icon: <Wallet className="w-4 h-4 sm:w-5 sm:h-5" /> },
              { step: '02', cmd: `fund_wallet --token ${data.blockchain === 'solana' ? 'SOL' : 'ETH'}`, title: `Get some ${data.blockchain === 'solana' ? 'SOL' : 'ETH'}`, desc: 'Buy from an exchange and transfer to your wallet', icon: <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /> },
              { step: '03', cmd: `swap --pair ${ticker || 'TOKEN'}/SOL`, title: 'Go to DEX', desc: `Swap for $${ticker || 'TOKEN'} using the contract address`, icon: <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" /> },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border transition-colors hover:bg-[rgba(0,255,65,0.03)]" style={{ borderColor: FAINT_GREEN }}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 border flex items-center justify-center flex-shrink-0" style={{ borderColor: GREEN, color: GREEN }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-[10px] mb-0.5 sm:mb-1 truncate" style={{ color: DIM_GREEN }}>$ {item.cmd}</p>
                  <h4 className="font-bold text-xs sm:text-sm mb-0.5 sm:mb-1" style={{ color: GREEN }}>{item.title}</h4>
                  <p className="text-[10px] sm:text-xs" style={{ color: DIM_GREEN }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      {data.roadmap.length > 0 && (
        <section id="roadmap" className="relative z-10 py-8 sm:py-10 px-3 sm:px-5 border-t" style={{ borderColor: FAINT_GREEN }}>
          <div className="max-w-3xl mx-auto">
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 uppercase" style={{ color: GREEN, textShadow: `0 0 10px ${FAINT_GREEN}` }}>
              {'>'} cat roadmap.md
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="border p-3 sm:p-4" style={{ borderColor: FAINT_GREEN }}>
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 border font-bold" style={{ borderColor: GREEN, color: GREEN }}>[{String(i + 1).padStart(2, '0')}]</span>
                    <h4 className="font-bold text-xs sm:text-sm uppercase" style={{ color: GREEN }}>{phase.title.replace(/Phase \d+:\s*/, '')}</h4>
                  </div>
                  <ul className="space-y-1 sm:space-y-1.5 pl-4 sm:pl-6">
                    {phase.items.filter(Boolean).map((item, j) => (
                      <li key={j} className="text-[10px] sm:text-xs flex items-start gap-1.5 sm:gap-2" style={{ color: DIM_GREEN }}>
                        <span className="flex-shrink-0" style={{ color: GREEN }}>├──</span> <span className="break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SOCIALS ── */}
      <section className="relative z-10 py-6 sm:py-8 px-3 sm:px-5 border-t" style={{ borderColor: FAINT_GREEN }}>
        <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold border hover:bg-[rgba(0,255,65,0.1)] transition-colors flex items-center gap-1.5" style={{ borderColor: GREEN, color: GREEN }}>
              <Send className="w-3 h-3" /> [TG]
            </a>
          )}
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold border hover:bg-[rgba(0,255,65,0.1)] transition-colors" style={{ borderColor: GREEN, color: GREEN }}>
              [𝕏]
            </a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold border hover:bg-[rgba(0,255,65,0.1)] transition-colors" style={{ borderColor: GREEN, color: GREEN }}>
              [DISCORD]
            </a>
          )}
          {data.socials.dex && (
            <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold border hover:bg-[rgba(0,255,65,0.1)] transition-colors flex items-center gap-1.5" style={{ borderColor: GREEN, color: GREEN }}>
              <ExternalLink className="w-3 h-3" /> [DEX]
            </a>
          )}
        </div>
      </section>
      )}

      {/* ── SOCIALS ── */}
      <section className="relative z-10 py-8 px-5 border-t" style={{ borderColor: FAINT_GREEN }}>
        <div className="flex justify-center gap-3 flex-wrap">
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-xs font-bold border hover:bg-[rgba(0,255,65,0.1)] transition-colors flex items-center gap-2" style={{ borderColor: GREEN, color: GREEN }}>
              <Send className="w-3.5 h-3.5" /> [TELEGRAM]
            </a>
          )}
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-xs font-bold border hover:bg-[rgba(0,255,65,0.1)] transition-colors" style={{ borderColor: GREEN, color: GREEN }}>
              [𝕏_TWITTER]
            </a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-xs font-bold border hover:bg-[rgba(0,255,65,0.1)] transition-colors" style={{ borderColor: GREEN, color: GREEN }}>
              [DISCORD]
            </a>
          )}
          {data.socials.dex && (
            <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-xs font-bold border hover:bg-[rgba(0,255,65,0.1)] transition-colors flex items-center gap-2" style={{ borderColor: GREEN, color: GREEN }}>
              <ExternalLink className="w-3.5 h-3.5" /> [DEX]
            </a>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer style={style} showWatermark={showWatermark} />
    </div>
  );
};

export default TerminalLayout;
