import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { Copy, ExternalLink, Wallet, ArrowRight } from 'lucide-react';
import DonutChart from '../DonutChart';
import { CountdownBlock, Footer, ensureUrl, copyToClipboard, getBuyUrl, getChartUrl, cleanTicker } from './shared';
import TokenStatsBar from '../TokenStatsBar';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
  showWatermark?: boolean;
}

const BG = '#0D0D2B';
const GOLD = '#FFD700';
const CYAN = '#00E5FF';
const WHITE = '#F0F0F0';
const FONT = "'Press Start 2P', monospace";

/* Pixel border via box-shadow */
const pixelBorder = (color: string) =>
  `4px 0 0 ${color}, -4px 0 0 ${color}, 0 4px 0 ${color}, 0 -4px 0 ${color}`;

/* Generate star positions for the background (CSS box-shadow trick) */
const starShadows = Array.from({ length: 60 }, () => {
  const x = Math.floor(Math.random() * 1200);
  const y = Math.floor(Math.random() * 3000);
  const bright = Math.random() > 0.5;
  return `${x}px ${y}px 0 ${bright ? '#fff' : 'rgba(255,255,255,0.4)'}`;
}).join(', ');

const Retro8BitLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const ticker = cleanTicker(data.ticker);
  const buyUrl = getBuyUrl(data);

  return (
    <div className="min-h-full relative overflow-hidden retro-screen" style={{ background: BG, color: WHITE }}>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes retro-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes retro-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes retro-score {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes retro-scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes retro-shake {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, -2px); }
          80% { transform: translate(1px, 2px); }
        }
        .retro-screen:hover {
          animation: retro-shake 0.4s ease-in-out;
        }
      `}</style>

      {/* ── Scanline overlay ── */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.04]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)',
        backgroundSize: '100% 4px',
      }} />
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="w-full h-[6px] opacity-[0.07]" style={{
          background: `linear-gradient(transparent, ${CYAN}, transparent)`,
          animation: 'retro-scanline 5s linear infinite',
        }} />
      </div>

      {/* ── Pixel grid BG ── */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.06]" style={{
        backgroundImage: `linear-gradient(${CYAN} 1px, transparent 1px), linear-gradient(90deg, ${CYAN} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />

      {/* ── Stars ── */}
      <div className="absolute top-0 left-0 w-[2px] h-[2px] pointer-events-none z-0" style={{
        boxShadow: starShadows,
      }} />

      {/* ── NAV ── */}
      <nav className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4" style={{
        borderBottom: `4px solid ${GOLD}`,
        background: 'rgba(13,13,43,0.95)',
      }}>
        <div className="flex items-center gap-2">
          {data.logoUrl && (
            <div className="w-8 h-8" style={{ boxShadow: pixelBorder(GOLD), imageRendering: 'pixelated' as any }}>
              <img src={data.logoUrl} alt="" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' as any }} />
            </div>
          )}
          <span style={{ fontFamily: FONT, fontSize: '10px', color: GOLD }}>{data.name || 'TOKEN'}</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {['About', 'Tokenomics', 'Roadmap'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className="group text-[9px] uppercase transition-colors hover:text-yellow-300" style={{ fontFamily: FONT, color: WHITE }}>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">►{' '}</span>{link}
            </a>
          ))}
        </div>

        <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-[9px] uppercase transition-transform hover:scale-105" style={{
          fontFamily: FONT, color: BG, background: GOLD, boxShadow: pixelBorder(GOLD),
        }}>
          Buy Now
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 px-5 pt-16 pb-12 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="p-2" style={{ boxShadow: pixelBorder(GOLD), animation: 'retro-float 3s ease-in-out infinite' }}>
              {data.logoUrl ? (
                <img src={data.logoUrl} alt={data.name} className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] object-contain" style={{ imageRendering: 'pixelated' as any }} />
              ) : (
                <div className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] flex items-center justify-center" style={{ background: 'rgba(255,215,0,0.1)' }}>
                  <span style={{ fontFamily: FONT, fontSize: '48px', color: GOLD }}>?</span>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <h2 className="mb-4" style={{
            fontFamily: FONT,
            fontSize: 'clamp(1.2rem, 5vw, 2.5rem)',
            color: GOLD,
            textShadow: `3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000`,
            lineHeight: 1.4,
          }}>
            ${ticker || data.name || 'TOKEN'}
          </h2>

          {/* Tagline */}
          <p className="mb-6 uppercase" style={{
            fontFamily: FONT, fontSize: '8px', color: CYAN, letterSpacing: '0.15em',
          }}>
            {data.tagline || 'The ultimate meme coin'}
          </p>

          {/* Blinking insert coin */}
          <p className="mb-8" style={{
            fontFamily: FONT, fontSize: '10px', color: GOLD, animation: 'retro-blink 1.2s step-end infinite',
          }}>
            ▶ INSERT COIN TO BUY ◀
          </p>

          {/* Contract */}
          {data.contractAddress && (
            <div className="flex items-center gap-2 justify-center mb-8 max-w-md mx-auto">
              <div className="flex-1 px-3 py-2 text-left truncate" style={{
                fontFamily: FONT, fontSize: '7px', color: 'rgba(255,255,255,0.6)',
                background: 'rgba(0,0,0,0.5)', boxShadow: pixelBorder('rgba(255,215,0,0.3)'),
              }}>
                $ {data.contractAddress}
              </div>
              <button onClick={() => copyToClipboard(data.contractAddress)} className="px-3 py-2 transition-transform hover:scale-110" style={{
                fontFamily: FONT, fontSize: '8px', color: BG, background: GOLD, boxShadow: pixelBorder(GOLD),
              }}>
                COPY
              </button>
            </div>
          )}

          {/* CTAs */}
          <div className="flex gap-4 justify-center flex-wrap">
            <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 text-[10px] uppercase transition-transform hover:scale-105" style={{
              fontFamily: FONT, color: BG, background: GOLD, boxShadow: pixelBorder(GOLD),
            }}>
              ▶ BUY ${ticker || 'TOKEN'}
            </a>
            {data.socials.dex && (
              <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className="px-6 py-3 text-[10px] uppercase transition-transform hover:scale-105" style={{
                fontFamily: FONT, color: CYAN, background: 'transparent', boxShadow: pixelBorder(CYAN),
              }}>
                ▶ CHART
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS (HUD Style) ── */}
      <section className="relative z-10 px-4 py-6" style={{ borderTop: `4px solid ${GOLD}`, borderBottom: `4px solid ${GOLD}` }}>
        <TokenStatsBar contractAddress={data.contractAddress} style={style} />
      </section>

      {/* ── COUNTDOWN ── */}
      {data.showCountdown && data.launchDate && (
        <section className="relative z-10 py-10 px-5">
          <CountdownBlock countdown={countdown} style={style} />
        </section>
      )}

      {/* ── ABOUT (Dialogue Box) ── */}
      {data.description && (
        <section id="about" className="relative z-10 py-12 px-5">
          <div className="max-w-2xl mx-auto p-6" style={{
            background: 'rgba(0,0,0,0.6)',
            boxShadow: pixelBorder(CYAN),
          }}>
            <p className="mb-4" style={{ fontFamily: FONT, fontSize: '10px', color: CYAN }}>
              ▼ ABOUT
            </p>
            <p className="leading-relaxed whitespace-pre-line" style={{
              fontFamily: FONT, fontSize: '9px', color: 'rgba(240,240,240,0.8)', lineHeight: 2.2,
            }}>
              {data.description}
            </p>
            <p className="mt-4" style={{ fontFamily: FONT, fontSize: '8px', color: 'rgba(255,255,255,0.3)', animation: 'retro-blink 1s step-end infinite' }}>
              ▶ _
            </p>
          </div>
        </section>
      )}

      {/* ── TOKENOMICS (RPG Stats) ── */}
      <section id="tokenomics" className="relative z-10 py-12 px-5" style={{ borderTop: `4px solid ${GOLD}` }}>
        <div className="max-w-2xl mx-auto">
          <h3 className="text-center mb-8" style={{ fontFamily: FONT, fontSize: '12px', color: GOLD }}>
            ═══ STATS ═══
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'SUPPLY', value: data.totalSupply || '—' },
              { label: 'BUY TAX', value: `${data.buyTax}%` },
              { label: 'SELL TAX', value: `${data.sellTax}%` },
              { label: 'LP', value: `${data.distribution.lp}%` },
              { label: 'TEAM', value: `${data.distribution.team}%` },
              { label: 'MKTG', value: `${data.distribution.marketing}%` },
              { label: 'BURN', value: `${data.distribution.burn}%` },
              { label: 'LOCK', value: data.liquidityStatus === 'locked' ? 'LOCKED' : 'BURNED' },
            ].map((item, i) => (
              <div key={i} className="p-3 text-center" style={{
                background: 'rgba(0,0,0,0.5)', boxShadow: pixelBorder('rgba(255,215,0,0.25)'),
              }}>
                <span className="block mb-1" style={{ fontFamily: FONT, fontSize: '7px', color: 'rgba(240,240,240,0.4)' }}>{item.label}</span>
                <span className="block" style={{ fontFamily: FONT, fontSize: '10px', color: GOLD, animation: 'retro-score 2s ease-in-out infinite' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <DonutChart distribution={data.distribution} accentHex={GOLD} />
          </div>
        </div>
      </section>

      {/* ── HOW TO BUY (Tutorial Steps) ── */}
      <section id="howtobuy" className="relative z-10 py-12 px-5" style={{ borderTop: `4px solid ${CYAN}` }}>
        <div className="max-w-2xl mx-auto">
          <h3 className="text-center mb-8" style={{ fontFamily: FONT, fontSize: '12px', color: CYAN }}>
            ═══ TUTORIAL ═══
          </h3>
          <div className="space-y-4">
            {[
              { step: '01', title: 'GET WALLET', desc: 'Download a Solana wallet', icon: <Wallet className="w-4 h-4" /> },
              { step: '02', title: 'GET SOL', desc: `Buy ${data.blockchain === 'solana' ? 'SOL' : 'ETH'} from an exchange`, icon: <ArrowRight className="w-4 h-4" /> },
              { step: '03', title: 'SWAP', desc: `Swap for $${ticker || 'TOKEN'}`, icon: <ExternalLink className="w-4 h-4" /> },
            ].map(item => (
              <div key={item.step} className="flex items-center gap-4 p-4" style={{
                background: 'rgba(0,0,0,0.5)', boxShadow: pixelBorder('rgba(0,229,255,0.3)'),
              }}>
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center" style={{ color: GOLD, boxShadow: pixelBorder(GOLD) }}>
                  <span style={{ fontFamily: FONT, fontSize: '10px' }}>{item.step}</span>
                </div>
                <div>
                  <p style={{ fontFamily: FONT, fontSize: '10px', color: CYAN }}>{item.title}</p>
                  <p className="mt-1" style={{ fontFamily: FONT, fontSize: '7px', color: 'rgba(240,240,240,0.5)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      {data.roadmap.length > 0 && (
        <section id="roadmap" className="relative z-10 py-12 px-5" style={{ borderTop: `4px solid ${GOLD}` }}>
          <div className="max-w-2xl mx-auto">
            <h3 className="text-center mb-8" style={{ fontFamily: FONT, fontSize: '12px', color: GOLD }}>
              ═══ ROADMAP ═══
            </h3>
            <div className="space-y-4">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="p-4" style={{
                  background: 'rgba(0,0,0,0.5)', boxShadow: pixelBorder('rgba(255,215,0,0.2)'),
                }}>
                  <p className="mb-2" style={{ fontFamily: FONT, fontSize: '9px', color: GOLD }}>
                    LVL {i + 1}: {phase.title.replace(/Phase \d+:\s*/, '').toUpperCase()}
                  </p>
                  <ul className="space-y-1">
                    {phase.items.filter(Boolean).map((item, j) => (
                      <li key={j} style={{ fontFamily: FONT, fontSize: '7px', color: 'rgba(240,240,240,0.6)' }}>
                        ► {item}
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
      <section className="relative z-10 py-8 px-5" style={{ borderTop: `4px solid ${CYAN}` }}>
        <div className="flex justify-center gap-4 flex-wrap">
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-[8px] uppercase transition-transform hover:scale-105" style={{
              fontFamily: FONT, color: BG, background: CYAN, boxShadow: pixelBorder(CYAN),
            }}>
              TELEGRAM
            </a>
          )}
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-[8px] uppercase transition-transform hover:scale-105" style={{
              fontFamily: FONT, color: BG, background: GOLD, boxShadow: pixelBorder(GOLD),
            }}>
              TWITTER
            </a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-[8px] uppercase transition-transform hover:scale-105" style={{
              fontFamily: FONT, color: BG, background: CYAN, boxShadow: pixelBorder(CYAN),
            }}>
              DISCORD
            </a>
          )}
          {data.socials.dex && (
            <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-[8px] uppercase transition-transform hover:scale-105" style={{
              fontFamily: FONT, color: BG, background: GOLD, boxShadow: pixelBorder(GOLD),
            }}>
              DEX
            </a>
          )}
        </div>
      </section>

      <Footer style={style} showWatermark={showWatermark} />
    </div>
  );
};

export default Retro8BitLayout;
