import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { Copy, Send, ExternalLink, Wallet, ArrowRight } from 'lucide-react';
import DonutChart from '../DonutChart';
import { CountdownBlock, Footer, ensureUrl, copyToClipboard, getBuyUrl, getChartUrl, cleanTicker } from './shared';
import TokenStatsBar from '../TokenStatsBar';
import { useEffect, useState, useRef } from 'react';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
  showWatermark?: boolean;
}

const PINK = '#FF006E';
const CYAN = '#00F5FF';
const PURPLE = '#A855F7';
const BG = '#050510';
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(255,255,255,0.08)';
const FONT = "'Orbitron', sans-serif";

const NeonCyberpunkLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const ticker = cleanTicker(data.ticker);
  const buyUrl = getBuyUrl(data);

  return (
    <div className="min-h-full relative overflow-hidden" style={{ background: BG, fontFamily: FONT, color: '#fff' }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Glitch keyframes */}
      <style>{`
        @keyframes cyber-glitch {
          0%, 90%, 100% { transform: translate(0); text-shadow: none; }
          92% { transform: translate(-2px, 1px); text-shadow: 2px 0 ${CYAN}, -2px 0 ${PINK}; }
          94% { transform: translate(2px, -1px); text-shadow: -2px 0 ${CYAN}, 2px 0 ${PINK}; }
          96% { transform: translate(-1px, -1px); text-shadow: 1px 0 ${PINK}, -1px 0 ${CYAN}; }
          98% { transform: translate(1px, 1px); text-shadow: -1px 0 ${PINK}, 1px 0 ${CYAN}; }
        }
        @keyframes neon-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes grid-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }
      `}</style>

      {/* Perspective grid */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(160,50,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(160,50,255,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        animation: 'grid-scroll 8s linear infinite',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
      }} />

      {/* Neon glow orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none z-0" style={{
        background: PINK, filter: 'blur(160px)', opacity: 0.12,
      }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none z-0" style={{
        background: CYAN, filter: 'blur(140px)', opacity: 0.1,
      }} />

      {/* ── NAV ── */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,5,16,0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2.5">
          {data.logoUrl && <img src={data.logoUrl} alt="" className="w-7 h-7 rounded-full" />}
          <span className="font-bold text-sm tracking-wider uppercase" style={{ color: CYAN }}>{data.name || 'TOKEN'}</span>
        </div>
        <div className="hidden md:flex items-center gap-5 text-xs font-medium">
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ color: CYAN }}>Twitter</a>
          )}
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity flex items-center gap-1" style={{ color: CYAN }}><Send className="w-3 h-3" />Telegram</a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ color: CYAN }}>Discord</a>
          )}
        </div>
        <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all hover:scale-105" style={{
          background: PINK, color: '#fff',
          boxShadow: `0 0 20px ${PINK}60, 0 0 40px ${PINK}20`,
        }}>
          Buy Now
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 px-5 pt-16 pb-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          {/* Left */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-black leading-none mb-4" style={{
              fontSize: 'clamp(2.5rem, 10vw, 5.5rem)',
              letterSpacing: '-0.02em',
              animation: 'cyber-glitch 5s infinite',
              background: `linear-gradient(135deg, ${PINK}, ${CYAN})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              ${ticker || 'TOKEN'}
            </h2>
            <p className="text-sm md:text-base mb-6 max-w-md" style={{ color: CYAN, opacity: 0.8 }}>
              {data.tagline || data.name || 'The future is neon'}
            </p>
            {data.contractAddress && (
              <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-lg border mx-auto md:mx-0 max-w-md" style={{ borderColor: `${PURPLE}40`, background: 'rgba(168,85,247,0.06)' }}>
                <code className="text-xs truncate flex-1" style={{ color: CYAN }}>{data.contractAddress}</code>
                <button onClick={() => copyToClipboard(data.contractAddress)} className="p-1.5 rounded-md hover:bg-white/5 transition-colors" style={{ color: PINK }}>
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all hover:scale-105" style={{
                background: PINK, color: '#fff',
                boxShadow: `0 0 25px ${PINK}50`,
              }}>
                Buy ${ticker || 'TOKEN'}
              </a>
              <a href={getChartUrl(data)} target="_blank" rel="noopener noreferrer" className="px-6 py-3 text-sm font-bold uppercase tracking-wider rounded-lg border transition-all hover:scale-105 flex items-center gap-2" style={{
                borderColor: CYAN, color: CYAN, background: 'transparent',
                boxShadow: `0 0 15px ${CYAN}20`,
              }}>
                <ExternalLink className="w-3.5 h-3.5" /> Chart
              </a>
            </div>
          </div>
          {/* Right: logo */}
          <div className="flex-shrink-0">
            <div className="relative rounded-2xl overflow-hidden" style={{
              boxShadow: `0 0 30px ${PINK}40, 0 0 60px ${PINK}15, inset 0 0 30px ${PINK}10`,
              border: `2px solid ${PINK}60`,
            }}>
              {data.logoUrl ? (
                <img src={data.logoUrl} alt={data.name} className="w-[220px] h-[220px] md:w-[280px] md:h-[280px] object-contain" />
              ) : (
                <div className="w-[220px] h-[220px] md:w-[280px] md:h-[280px] flex items-center justify-center" style={{ background: 'rgba(255,0,110,0.05)' }}>
                  <span className="text-5xl" style={{ color: PINK }}>◆</span>
                </div>
              )}
              {/* Neon pulse ring */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                border: `1px solid ${CYAN}30`,
                animation: 'neon-pulse 3s ease-in-out infinite',
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 px-5 py-6 border-t border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <TokenStatsBar contractAddress={data.contractAddress} style={style} />
      </section>

      {/* ── COUNTDOWN ── */}
      {data.showCountdown && data.launchDate && (
        <section className="relative z-10 py-8 px-5">
          <CountdownBlock countdown={countdown} style={style} />
        </section>
      )}

      {/* ── ABOUT ── */}
      {data.description && (
        <section id="about" className="relative z-10 py-12 px-5">
          <div className="max-w-3xl mx-auto">
            <h3 className="font-bold text-xl mb-6 uppercase tracking-widest" style={{
              background: `linear-gradient(90deg, ${PINK}, ${PURPLE})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>About</h3>
            <div className="rounded-xl p-6 border" style={{ background: CARD_BG, borderColor: `${PURPLE}30`, boxShadow: `0 0 40px ${PURPLE}08` }}>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {data.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── TOKENOMICS ── */}
      <section id="tokenomics" className="relative z-10 py-12 px-5">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-bold text-xl mb-8 uppercase tracking-widest text-center" style={{
            background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Tokenomics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Total Supply', value: data.totalSupply || '—', color: PINK },
              { label: 'Buy Tax', value: `${data.buyTax}%`, color: CYAN },
              { label: 'Sell Tax', value: `${data.sellTax}%`, color: PURPLE },
              { label: 'LP', value: `${data.distribution.lp}%`, color: CYAN },
              { label: 'Team', value: `${data.distribution.team}%`, color: PINK },
              { label: 'Liquidity', value: data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned', color: PURPLE },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-4 text-center border transition-all hover:scale-[1.02]" style={{
                background: CARD_BG, borderColor: `${item.color}25`,
                boxShadow: `inset 0 0 20px ${item.color}05`,
              }}>
                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</p>
                <p className="font-bold text-lg" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <DonutChart distribution={data.distribution} accentHex={PINK} />
          </div>
        </div>
      </section>

      {/* ── HOW TO BUY ── */}
      <section id="howtobuy" className="relative z-10 py-12 px-5">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-bold text-xl mb-8 uppercase tracking-widest text-center" style={{
            background: `linear-gradient(90deg, ${PINK}, ${CYAN})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>How to Buy</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Get a Wallet', desc: 'Download Phantom or any Solana-compatible wallet', icon: <Wallet className="w-6 h-6" />, color: PINK },
              { step: '02', title: `Get ${data.blockchain === 'solana' ? 'SOL' : 'ETH'}`, desc: 'Buy from an exchange and transfer to your wallet', icon: <ArrowRight className="w-6 h-6" />, color: CYAN },
              { step: '03', title: 'Swap', desc: `Swap for $${ticker || 'TOKEN'} on a DEX`, icon: <ExternalLink className="w-6 h-6" />, color: PURPLE },
            ].map((item) => (
              <div key={item.step} className="rounded-xl p-5 border text-center transition-all hover:scale-[1.02]" style={{
                background: CARD_BG, borderColor: `${item.color}25`,
                boxShadow: `0 0 30px ${item.color}08`,
              }}>
                <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center mx-auto mb-4" style={{ borderColor: item.color, color: item.color }}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: item.color }}>Step {item.step}</span>
                <h4 className="font-bold mt-1 mb-2">{item.title}</h4>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      {data.roadmap.length > 0 && (
        <section id="roadmap" className="relative z-10 py-12 px-5">
          <div className="max-w-3xl mx-auto">
            <h3 className="font-bold text-xl mb-8 uppercase tracking-widest text-center" style={{
              background: `linear-gradient(90deg, ${PURPLE}, ${PINK})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Roadmap</h3>
            <div className="space-y-4">
              {data.roadmap.map((phase, i) => {
                const color = [PINK, CYAN, PURPLE][i % 3];
                return (
                  <div key={phase.id} className="rounded-xl p-5 border" style={{ background: CARD_BG, borderColor: `${color}25` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${color}15`, color }}>{String(i + 1).padStart(2, '0')}</span>
                      <h4 className="font-bold text-sm uppercase tracking-wider">{phase.title.replace(/Phase \d+:\s*/, '')}</h4>
                    </div>
                    <ul className="space-y-1.5 pl-4">
                      {phase.items.filter(Boolean).map((item, j) => (
                        <li key={j} className="text-xs flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          <span style={{ color }}>▸</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── SOCIALS ── */}
      <section className="relative z-10 py-8 px-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex justify-center gap-3 flex-wrap">
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 text-xs font-bold rounded-lg border transition-all hover:scale-105 flex items-center gap-2" style={{ borderColor: `${CYAN}40`, color: CYAN }}>
              <Send className="w-3.5 h-3.5" /> Telegram
            </a>
          )}
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 text-xs font-bold rounded-lg border transition-all hover:scale-105" style={{ borderColor: `${PINK}40`, color: PINK }}>
              𝕏 Twitter
            </a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 text-xs font-bold rounded-lg border transition-all hover:scale-105" style={{ borderColor: `${PURPLE}40`, color: PURPLE }}>
              Discord
            </a>
          )}
          {data.socials.dex && (
            <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 text-xs font-bold rounded-lg border transition-all hover:scale-105 flex items-center gap-2" style={{ borderColor: `${CYAN}40`, color: CYAN }}>
              <ExternalLink className="w-3.5 h-3.5" /> DEX
            </a>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer style={style} showWatermark={showWatermark} />
    </div>
  );
};

export default NeonCyberpunkLayout;
