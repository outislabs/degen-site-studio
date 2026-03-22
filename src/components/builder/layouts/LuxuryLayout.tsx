import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
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

const GOLD = '#C9A84C';
const GOLD_DIM = 'rgba(201,168,76,0.5)';
const GOLD_FAINT = 'rgba(201,168,76,0.12)';
const BG = '#0A0A0A';
const HEADING = "'Playfair Display', Georgia, serif";
const BODY = "'Cormorant Garamond', 'Times New Roman', serif";

const GoldDivider = () => (
  <div className="w-16 h-[1px] mx-auto" style={{ background: GOLD }} />
);

const LuxuryLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const ticker = cleanTicker(data.ticker);
  const buyUrl = getBuyUrl(data);

  return (
    <div className="min-h-full relative overflow-hidden" style={{ background: BG, color: '#fff' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes luxury-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .luxury-shimmer-text {
          background: linear-gradient(
            90deg,
            #fff 0%,
            #fff 35%,
            ${GOLD} 50%,
            #fff 65%,
            #fff 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: luxury-shimmer 6s ease-in-out infinite;
        }
      `}</style>

      {/* Subtle gold texture overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(${GOLD} 0.5px, transparent 0.5px)`,
        backgroundSize: '24px 24px',
      }} />

      {/* ── NAV ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b" style={{ borderColor: GOLD_FAINT }}>
        <div className="w-24" />
        <div className="flex items-center gap-3">
          {data.logoUrl && <img src={data.logoUrl} alt="" className="w-6 h-6 rounded-full opacity-80" />}
          <span className="text-sm tracking-[0.25em] uppercase" style={{ fontFamily: HEADING, color: '#fff' }}>{data.name || 'TOKEN'}</span>
        </div>
        <div className="w-24 flex justify-end">
          <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2 text-[11px] tracking-[0.15em] uppercase transition-colors hover:bg-[rgba(201,168,76,0.08)]" style={{
            border: `1px solid ${GOLD}`, color: GOLD, fontFamily: HEADING,
          }}>
            Buy
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 px-5 pt-20 pb-16 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <div className="rounded-full p-[2px]" style={{ border: `1px solid ${GOLD_DIM}` }}>
              {data.logoUrl ? (
                <img src={data.logoUrl} alt={data.name} className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full object-contain" />
              ) : (
                <div className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.03)' }}>
                  <span className="text-4xl" style={{ color: GOLD, fontFamily: HEADING }}>◆</span>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <h2 className="mb-5 luxury-shimmer-text" style={{
            fontFamily: HEADING,
            fontSize: 'clamp(2rem, 7vw, 4rem)',
            fontWeight: 400,
            letterSpacing: '0.3em',
            lineHeight: 1.1,
          }}>
            {data.name || 'TOKEN'}
          </h2>

          <GoldDivider />

          {/* Tagline */}
          <p className="mt-5 mb-8 tracking-[0.2em] uppercase" style={{
            fontFamily: BODY, fontSize: '12px', color: GOLD, fontWeight: 500,
          }}>
            {data.tagline || 'Excellence in every token'}
          </p>

          {/* Contract */}
          {data.contractAddress && (
            <div className="flex items-center gap-3 justify-center mb-8 max-w-md mx-auto">
              <code className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Courier New', monospace" }}>{data.contractAddress}</code>
              <button onClick={() => copyToClipboard(data.contractAddress)} className="p-1 transition-colors hover:opacity-70">
                <Copy className="w-3.5 h-3.5" style={{ color: GOLD }} />
              </button>
            </div>
          )}

          {/* CTA */}
          <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all hover:opacity-90" style={{
            background: GOLD, color: '#0A0A0A', fontFamily: HEADING,
          }}>
            Acquire ${ticker || 'TOKEN'}
          </a>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 px-5 py-8 border-t border-b" style={{ borderColor: GOLD_FAINT }}>
        <TokenStatsBar contractAddress={data.contractAddress} style={style} />
      </section>

      {/* ── COUNTDOWN ── */}
      {data.showCountdown && data.launchDate && (
        <section className="relative z-10 py-10 px-5">
          <CountdownBlock countdown={countdown} style={style} />
        </section>
      )}

      {/* ── ABOUT ── */}
      {data.description && (
        <section id="about" className="relative z-10 py-16 px-5 border-t" style={{ borderColor: GOLD_FAINT }}>
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-5xl leading-none block mb-4" style={{ color: GOLD, fontFamily: HEADING }}>"</span>
            <p className="text-base md:text-lg leading-relaxed whitespace-pre-line" style={{
              fontFamily: BODY, color: 'rgba(255,255,255,0.65)', fontWeight: 300, lineHeight: 1.9,
            }}>
              {data.description}
            </p>
            <span className="text-5xl leading-none block mt-4" style={{ color: GOLD, fontFamily: HEADING }}>"</span>
          </div>
        </section>
      )}

      {/* ── TOKENOMICS ── */}
      <section id="tokenomics" className="relative z-10 py-16 px-5 border-t" style={{ borderColor: GOLD_FAINT }}>
        <div className="max-w-2xl mx-auto">
          <h3 className="text-center mb-10 tracking-[0.25em] uppercase" style={{ fontFamily: HEADING, fontSize: '1.1rem', color: '#fff', fontWeight: 400 }}>
            Tokenomics
          </h3>
          <div className="space-y-0">
            {[
              { label: 'Total Supply', value: data.totalSupply || '—' },
              { label: 'Buy Tax', value: `${data.buyTax}%` },
              { label: 'Sell Tax', value: `${data.sellTax}%` },
              { label: 'Liquidity Pool', value: `${data.distribution.lp}%` },
              { label: 'Team', value: `${data.distribution.team}%` },
              { label: 'Marketing', value: `${data.distribution.marketing}%` },
              { label: 'Burn', value: `${data.distribution.burn}%` },
              { label: 'Liquidity', value: data.liquidityStatus === 'locked' ? 'Locked' : 'Burned' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b" style={{ borderColor: GOLD_FAINT }}>
                <span className="text-xs tracking-[0.15em] uppercase" style={{ fontFamily: BODY, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{item.label}</span>
                <span className="text-sm tracking-wider" style={{ fontFamily: HEADING, color: GOLD }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <DonutChart distribution={data.distribution} accentHex={GOLD} />
          </div>
        </div>
      </section>

      {/* ── HOW TO BUY ── */}
      <section id="howtobuy" className="relative z-10 py-16 px-5 border-t" style={{ borderColor: GOLD_FAINT }}>
        <div className="max-w-2xl mx-auto">
          <h3 className="text-center mb-10 tracking-[0.25em] uppercase" style={{ fontFamily: HEADING, fontSize: '1.1rem', color: '#fff', fontWeight: 400 }}>
            How to Acquire
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: 'I', title: 'Wallet', desc: 'Prepare a Solana-compatible wallet', icon: <Wallet className="w-5 h-5" /> },
              { step: 'II', title: 'Fund', desc: `Acquire ${data.blockchain === 'solana' ? 'SOL' : 'ETH'} from an exchange`, icon: <ArrowRight className="w-5 h-5" /> },
              { step: 'III', title: 'Exchange', desc: `Swap for $${ticker || 'TOKEN'}`, icon: <ExternalLink className="w-5 h-5" /> },
            ].map((item) => (
              <div key={item.step} className="text-center py-6 px-4 border" style={{ borderColor: GOLD_FAINT }}>
                <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center" style={{ color: GOLD }}>
                  {item.icon}
                </div>
                <span className="text-xs tracking-[0.2em] block mb-2" style={{ color: GOLD, fontFamily: HEADING }}>{item.step}</span>
                <h4 className="text-sm tracking-[0.15em] uppercase mb-2" style={{ fontFamily: HEADING, fontWeight: 500 }}>{item.title}</h4>
                <p className="text-xs" style={{ fontFamily: BODY, color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      {data.roadmap.length > 0 && (
        <section id="roadmap" className="relative z-10 py-16 px-5 border-t" style={{ borderColor: GOLD_FAINT }}>
          <div className="max-w-2xl mx-auto">
            <h3 className="text-center mb-10 tracking-[0.25em] uppercase" style={{ fontFamily: HEADING, fontSize: '1.1rem', color: '#fff', fontWeight: 400 }}>
              Roadmap
            </h3>
            <div className="space-y-6">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="border-l-2 pl-6 py-2" style={{ borderColor: GOLD_DIM }}>
                  <span className="text-[10px] tracking-[0.2em] uppercase block mb-2" style={{ color: GOLD, fontFamily: HEADING }}>Phase {i + 1}</span>
                  <h4 className="text-sm tracking-wide mb-3" style={{ fontFamily: HEADING }}>{phase.title.replace(/Phase \d+:\s*/, '')}</h4>
                  <ul className="space-y-1.5">
                    {phase.items.filter(Boolean).map((item, j) => (
                      <li key={j} className="text-xs" style={{ fontFamily: BODY, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
                        — {item}
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
      <section className="relative z-10 py-10 px-5 border-t" style={{ borderColor: GOLD_FAINT }}>
        <div className="flex justify-center gap-4 flex-wrap">
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="px-5 py-2 text-[10px] tracking-[0.15em] uppercase border transition-colors hover:bg-[rgba(201,168,76,0.05)] flex items-center gap-2" style={{ borderColor: GOLD_DIM, color: GOLD, fontFamily: HEADING }}>
              <Send className="w-3 h-3" /> Telegram
            </a>
          )}
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="px-5 py-2 text-[10px] tracking-[0.15em] uppercase border transition-colors hover:bg-[rgba(201,168,76,0.05)]" style={{ borderColor: GOLD_DIM, color: GOLD, fontFamily: HEADING }}>
              𝕏 Twitter
            </a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="px-5 py-2 text-[10px] tracking-[0.15em] uppercase border transition-colors hover:bg-[rgba(201,168,76,0.05)]" style={{ borderColor: GOLD_DIM, color: GOLD, fontFamily: HEADING }}>
              Discord
            </a>
          )}
          {data.socials.dex && (
            <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className="px-5 py-2 text-[10px] tracking-[0.15em] uppercase border transition-colors hover:bg-[rgba(201,168,76,0.05)] flex items-center gap-2" style={{ borderColor: GOLD_DIM, color: GOLD, fontFamily: HEADING }}>
              <ExternalLink className="w-3 h-3" /> DEX
            </a>
          )}
        </div>
      </section>

      <Footer style={style} showWatermark={showWatermark} />
    </div>
  );
};

export default LuxuryLayout;
