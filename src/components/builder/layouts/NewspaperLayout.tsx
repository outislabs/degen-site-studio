import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { Copy, ExternalLink } from 'lucide-react';
import DonutChart from '../DonutChart';
import { CountdownBlock, Footer, ensureUrl, copyToClipboard, getBuyUrl, cleanTicker } from './shared';
import TokenStatsBar from '../TokenStatsBar';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
  showWatermark?: boolean;
}

const CREAM = '#F5F0E8';
const INK = '#1A1A1A';
const RED = '#CC0000';
const HEADING = "'Playfair Display', Georgia, serif";
const BODY = "'Libre Baskerville', 'Times New Roman', serif";

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const NewspaperLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const ticker = cleanTicker(data.ticker);
  const buyUrl = getBuyUrl(data);

  const tickerScroll = `BREAKING: $${ticker || 'TOKEN'} UP 1000% ✦ DEGENS GETTING RICH ✦ WAGMI ✦ LIQUIDITY ${data.liquidityStatus === 'locked' ? 'LOCKED' : 'BURNED'} ✦ TO THE MOON ✦ `;

  return (
    <div className="min-h-full relative overflow-hidden" style={{ background: CREAM, color: INK }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes newspaper-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .newspaper-texture {
          background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
        }
        .newspaper-cols {
          column-count: 2;
          column-gap: 2rem;
          column-rule: 1px solid rgba(26,26,26,0.15);
        }
        @media (max-width: 640px) {
          .newspaper-cols { column-count: 1; }
        }
      `}</style>

      {/* ── BREAKING NEWS TICKER ── */}
      <div className="relative z-20 overflow-hidden" style={{ background: RED, padding: '6px 0' }}>
        <div className="whitespace-nowrap" style={{ animation: 'newspaper-scroll 20s linear infinite' }}>
          <span className="inline-block" style={{ fontFamily: BODY, fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
            {tickerScroll.repeat(6)}
          </span>
        </div>
      </div>

      {/* ── MASTHEAD NAV ── */}
      <nav className="relative z-10 text-center px-4 pt-4 pb-3" style={{ borderBottom: `4px double ${INK}` }}>
        <p className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ fontFamily: BODY, color: 'rgba(26,26,26,0.5)' }}>
          Vol. 1 No. 1 — {today}
        </p>
        <h1 className="mb-1" style={{
          fontFamily: HEADING,
          fontSize: 'clamp(1.8rem, 6vw, 3.5rem)',
          fontWeight: 900,
          letterSpacing: '0.04em',
          lineHeight: 1.1,
          color: INK,
          textTransform: 'uppercase',
        }}>
          {data.name || 'THE TOKEN TIMES'}
        </h1>
        <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid rgba(26,26,26,0.2)` }}>
          <span className="text-[8px] italic" style={{ fontFamily: BODY, color: 'rgba(26,26,26,0.5)' }}>
            "All the alpha that's fit to print"
          </span>
          <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 text-[10px] uppercase tracking-[0.1em] font-bold transition-opacity hover:opacity-80" style={{
            fontFamily: HEADING, background: INK, color: CREAM,
          }}>
            Buy ${ticker || 'TOKEN'}
          </a>
        </div>
      </nav>

      {/* ── HERO / HEADLINE ── */}
      <section className="relative z-10 px-5 pt-10 pb-8 text-center" style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="max-w-3xl mx-auto">
          <h2 style={{
            fontFamily: HEADING,
            fontSize: 'clamp(1.6rem, 6vw, 3.2rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            color: INK,
            textTransform: 'uppercase',
          }}>
            ${ticker || 'TOKEN'} TAKES THE WORLD BY STORM
          </h2>
          <div className="w-24 mx-auto my-4" style={{ height: '3px', background: INK }} />
          <p className="italic" style={{ fontFamily: BODY, fontSize: '14px', color: 'rgba(26,26,26,0.7)' }}>
            {data.tagline || 'The next generation of meme coins has arrived'}
          </p>
        </div>
      </section>

      {/* ── PHOTO + COLUMNS ── */}
      <section className="relative z-10 px-5 py-8">
        <div className="max-w-3xl mx-auto grid md:grid-cols-[280px_1fr] gap-6">
          {/* "Photo" */}
          <div className="text-center">
            <div className="border-2 p-1 inline-block" style={{ borderColor: INK }}>
              {data.logoUrl ? (
                <img src={data.logoUrl} alt={data.name} className="w-[200px] h-[200px] md:w-[260px] md:h-[260px] object-contain" style={{ filter: 'grayscale(30%) contrast(1.1)' }} />
              ) : (
                <div className="w-[200px] h-[200px] md:w-[260px] md:h-[260px] flex items-center justify-center" style={{ background: 'rgba(26,26,26,0.05)' }}>
                  <span style={{ fontFamily: HEADING, fontSize: '48px', color: INK }}>$</span>
                </div>
              )}
            </div>
            <p className="mt-2 italic text-xs" style={{ fontFamily: BODY, color: 'rgba(26,26,26,0.5)' }}>
              "${data.name || 'Token'}" pictured above
            </p>
          </div>

          {/* Article columns */}
          {data.description && (
            <div>
              <p className="font-bold mb-2 text-sm" style={{ fontFamily: HEADING, color: INK }}>
                By Anonymous Degen — Staff Writer
              </p>
              <div className="newspaper-cols whitespace-pre-line" style={{
                fontFamily: BODY, fontSize: '13px', lineHeight: 1.9, color: 'rgba(26,26,26,0.8)',
              }}>
                {data.description}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CONTRACT CALLOUT ── */}
      {data.contractAddress && (
        <section className="relative z-10 px-5 py-4">
          <div className="max-w-3xl mx-auto p-4 border-2 text-center" style={{ borderColor: INK, background: 'rgba(26,26,26,0.03)' }}>
            <p className="text-[10px] uppercase tracking-[0.15em] font-bold mb-2" style={{ fontFamily: HEADING, color: INK }}>
              Contract Address
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-xs truncate max-w-xs" style={{ fontFamily: "'Courier New', monospace", color: 'rgba(26,26,26,0.6)' }}>
                {data.contractAddress}
              </code>
              <button onClick={() => copyToClipboard(data.contractAddress)} className="p-1 transition-opacity hover:opacity-60">
                <Copy className="w-3.5 h-3.5" style={{ color: INK }} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── STATS ── */}
      <section className="relative z-10 px-5 py-6" style={{ borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}` }}>
        <TokenStatsBar contractAddress={data.contractAddress} style={style} />
      </section>

      {/* ── COUNTDOWN ── */}
      {data.showCountdown && data.launchDate && (
        <section className="relative z-10 py-8 px-5">
          <CountdownBlock countdown={countdown} style={style} />
        </section>
      )}

      {/* ── TOKENOMICS ── */}
      <section id="tokenomics" className="relative z-10 py-10 px-5" style={{ borderTop: `2px solid ${INK}` }}>
        <div className="max-w-3xl mx-auto">
          <h3 className="text-center mb-6 uppercase tracking-[0.2em]" style={{ fontFamily: HEADING, fontSize: '1.1rem', fontWeight: 900, color: INK }}>
            Market Data
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-2" style={{ borderColor: INK }}>
            {[
              { label: 'Total Supply', value: data.totalSupply || '—' },
              { label: 'Buy Tax', value: `${data.buyTax}%` },
              { label: 'Sell Tax', value: `${data.sellTax}%` },
              { label: 'Liquidity', value: data.liquidityStatus === 'locked' ? 'Locked' : 'Burned' },
              { label: 'LP', value: `${data.distribution.lp}%` },
              { label: 'Team', value: `${data.distribution.team}%` },
              { label: 'Marketing', value: `${data.distribution.marketing}%` },
              { label: 'Burn', value: `${data.distribution.burn}%` },
            ].map((item, i) => (
              <div key={i} className="p-3 text-center border" style={{ borderColor: 'rgba(26,26,26,0.15)' }}>
                <span className="block text-[9px] uppercase tracking-wider font-bold mb-1" style={{ fontFamily: HEADING, color: 'rgba(26,26,26,0.5)' }}>{item.label}</span>
                <span className="block text-sm font-bold" style={{ fontFamily: HEADING, color: INK }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <DonutChart distribution={data.distribution} accentHex={INK} />
          </div>
        </div>
      </section>

      {/* ── HOW TO BUY ── */}
      <section id="howtobuy" className="relative z-10 py-10 px-5" style={{ borderTop: `2px solid ${INK}` }}>
        <div className="max-w-3xl mx-auto">
          <h3 className="text-center mb-6 uppercase tracking-[0.2em]" style={{ fontFamily: HEADING, fontSize: '1.1rem', fontWeight: 900, color: INK }}>
            How to Buy
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Get a Wallet', desc: 'Download a Solana-compatible wallet' },
              { step: '2', title: 'Fund It', desc: `Acquire ${data.blockchain === 'solana' ? 'SOL' : 'ETH'} from an exchange` },
              { step: '3', title: 'Swap', desc: `Trade for $${ticker || 'TOKEN'} on a DEX` },
            ].map(item => (
              <div key={item.step} className="border-2 p-5 text-center" style={{ borderColor: INK }}>
                <span className="block text-3xl font-black mb-2" style={{ fontFamily: HEADING, color: INK }}>{item.step}</span>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ fontFamily: HEADING }}>{item.title}</h4>
                <p className="text-xs" style={{ fontFamily: BODY, color: 'rgba(26,26,26,0.6)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      {data.roadmap.length > 0 && (
        <section id="roadmap" className="relative z-10 py-10 px-5" style={{ borderTop: `2px solid ${INK}` }}>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-center mb-6 uppercase tracking-[0.2em]" style={{ fontFamily: HEADING, fontSize: '1.1rem', fontWeight: 900, color: INK }}>
              Roadmap
            </h3>
            <div className="space-y-4">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="border-l-4 pl-5 py-2" style={{ borderColor: INK }}>
                  <span className="text-[10px] uppercase tracking-[0.15em] font-bold block mb-1" style={{ fontFamily: HEADING, color: 'rgba(26,26,26,0.5)' }}>
                    Chapter {i + 1}
                  </span>
                  <h4 className="text-sm font-bold mb-2" style={{ fontFamily: HEADING, color: INK }}>
                    {phase.title.replace(/Phase \d+:\s*/, '')}
                  </h4>
                  <ul className="space-y-1">
                    {phase.items.filter(Boolean).map((item, j) => (
                      <li key={j} className="text-xs" style={{ fontFamily: BODY, color: 'rgba(26,26,26,0.6)' }}>
                        • {item}
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
      <section className="relative z-10 py-8 px-5" style={{ borderTop: `2px solid ${INK}` }}>
        <div className="flex justify-center gap-3 flex-wrap">
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="px-5 py-2 text-[10px] uppercase tracking-wider font-bold border-2 transition-colors hover:bg-[rgba(26,26,26,0.05)]" style={{ fontFamily: HEADING, borderColor: INK, color: INK }}>
              Telegram
            </a>
          )}
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="px-5 py-2 text-[10px] uppercase tracking-wider font-bold border-2 transition-colors hover:bg-[rgba(26,26,26,0.05)]" style={{ fontFamily: HEADING, borderColor: INK, color: INK }}>
              Twitter
            </a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="px-5 py-2 text-[10px] uppercase tracking-wider font-bold border-2 transition-colors hover:bg-[rgba(26,26,26,0.05)]" style={{ fontFamily: HEADING, borderColor: INK, color: INK }}>
              Discord
            </a>
          )}
          {data.socials.dex && (
            <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className="px-5 py-2 text-[10px] uppercase tracking-wider font-bold transition-colors hover:opacity-80 flex items-center gap-1.5" style={{ fontFamily: HEADING, background: INK, color: CREAM }}>
              <ExternalLink className="w-3 h-3" /> Chart
            </a>
          )}
        </div>
      </section>

      <Footer style={style} showWatermark={showWatermark} />
    </div>
  );
};

export default NewspaperLayout;
