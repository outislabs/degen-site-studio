import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { Copy, ExternalLink, Wallet, ArrowRight } from 'lucide-react';
import DonutChart from '../DonutChart';
import { CountdownBlock, Footer, ensureUrl, copyToClipboard, getBuyUrl, cleanTicker } from './shared';
import TokenStatsBar from '../TokenStatsBar';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
  showWatermark?: boolean;
}

const WHITE = '#FFFFFF';
const BLACK = '#000000';
const GRAY = '#666666';
const LIGHT = '#F5F5F7';
const BORDER = '#E5E5E5';
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const MinimalistLayout = ({ data, style, countdown, showWatermark }: Props) => {
  const ticker = cleanTicker(data.ticker);
  const buyUrl = getBuyUrl(data);

  return (
    <div className="min-h-full relative" style={{ background: WHITE, color: BLACK, fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2.5">
          {data.logoUrl && <img src={data.logoUrl} alt="" className="w-7 h-7 rounded-full" />}
          <span className="text-[15px] font-medium tracking-tight" style={{ color: BLACK }}>{data.name || 'Token'}</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['About', 'Tokenomics', 'Roadmap'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-[13px] font-light transition-colors hover:text-black" style={{ color: GRAY }}>
              {link}
            </a>
          ))}
        </div>
        <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2 text-[13px] font-medium rounded-full transition-opacity hover:opacity-80" style={{ background: BLACK, color: WHITE }}>
          Buy
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 px-5 pt-16 pb-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-12">
            {data.logoUrl ? (
              <img src={data.logoUrl} alt={data.name} className="w-[240px] h-[240px] md:w-[360px] md:h-[360px] object-contain rounded-3xl" style={{
                boxShadow: '0 40px 80px rgba(0,0,0,0.12)',
              }} />
            ) : (
              <div className="w-[240px] h-[240px] md:w-[360px] md:h-[360px] rounded-3xl flex items-center justify-center" style={{ background: LIGHT }}>
                <span className="text-6xl font-extralight" style={{ color: GRAY }}>$</span>
              </div>
            )}
          </div>

          <h2 className="mb-4" style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 200,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: BLACK,
          }}>
            {data.name || 'Token'}
          </h2>

          <p className="mb-10 font-light" style={{ fontSize: '16px', color: GRAY }}>
            {data.tagline || 'The future of decentralized finance'}
          </p>

          {data.contractAddress && (
            <div className="flex items-center gap-2 justify-center mb-8 max-w-sm mx-auto">
              <code className="text-xs truncate font-light" style={{ color: '#999' }}>{data.contractAddress}</code>
              <button onClick={() => copyToClipboard(data.contractAddress)} className="p-1 transition-opacity hover:opacity-50">
                <Copy className="w-3.5 h-3.5" style={{ color: '#999' }} />
              </button>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3 text-[14px] font-medium rounded-full transition-opacity hover:opacity-80" style={{ background: BLACK, color: WHITE }}>
              Buy ${ticker || 'Token'}
            </a>
            <a href="#about" className="px-8 py-3 text-[14px] font-light rounded-full border transition-colors hover:bg-gray-50" style={{ borderColor: BORDER, color: GRAY }}>
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 px-5 py-8 border-t border-b" style={{ borderColor: BORDER }}>
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
        <section id="about" className="relative z-10 py-20 px-5">
          <div className="max-w-3xl mx-auto grid md:grid-cols-[1fr_240px] gap-12 items-center">
            <div>
              <h3 className="mb-6 text-sm font-medium uppercase tracking-[0.15em]" style={{ color: '#999' }}>About</h3>
              <p className="whitespace-pre-line" style={{
                fontSize: '16px', fontWeight: 300, lineHeight: 1.9, color: 'rgba(0,0,0,0.65)', maxWidth: '560px',
              }}>
                {data.description}
              </p>
            </div>
            {data.logoUrl && (
              <div className="hidden md:flex justify-center">
                <img src={data.logoUrl} alt="" className="w-[200px] h-[200px] object-contain rounded-2xl" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── TOKENOMICS ── */}
      <section id="tokenomics" className="relative z-10 py-16 px-5" style={{ background: LIGHT }}>
        <div className="max-w-3xl mx-auto">
          <h3 className="text-center mb-10 text-sm font-medium uppercase tracking-[0.15em]" style={{ color: '#999' }}>Tokenomics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div key={i} className="p-5 rounded-xl border text-center" style={{ background: WHITE, borderColor: BORDER }}>
                <span className="block text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: '#999' }}>{item.label}</span>
                <span className="block text-lg font-semibold" style={{ color: BLACK }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <DonutChart distribution={data.distribution} accentHex={BLACK} />
          </div>
        </div>
      </section>

      {/* ── HOW TO BUY ── */}
      <section id="howtobuy" className="relative z-10 py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-center mb-10 text-sm font-medium uppercase tracking-[0.15em]" style={{ color: '#999' }}>How to Buy</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Get a Wallet', desc: 'Download a Solana-compatible wallet', icon: <Wallet className="w-5 h-5" /> },
              { step: '2', title: 'Fund It', desc: `Buy ${data.blockchain === 'solana' ? 'SOL' : 'ETH'} from an exchange`, icon: <ArrowRight className="w-5 h-5" /> },
              { step: '3', title: 'Swap', desc: `Trade for $${ticker || 'TOKEN'}`, icon: <ExternalLink className="w-5 h-5" /> },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full border mx-auto mb-4 flex items-center justify-center text-sm font-medium" style={{ borderColor: BORDER, color: GRAY }}>
                  {item.step}
                </div>
                <h4 className="text-sm font-semibold mb-2">{item.title}</h4>
                <p className="text-[13px] font-light" style={{ color: GRAY }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      {data.roadmap.length > 0 && (
        <section id="roadmap" className="relative z-10 py-16 px-5" style={{ background: LIGHT }}>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-center mb-10 text-sm font-medium uppercase tracking-[0.15em]" style={{ color: '#999' }}>Roadmap</h3>
            <div className="space-y-6">
              {data.roadmap.map((phase, i) => (
                <div key={phase.id} className="flex gap-5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-xs font-medium mt-0.5" style={{ borderColor: BORDER, color: GRAY }}>
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: BLACK }}>{phase.title.replace(/Phase \d+:\s*/, '')}</h4>
                    <ul className="space-y-1">
                      {phase.items.filter(Boolean).map((item, j) => (
                        <li key={j} className="text-[13px] font-light" style={{ color: GRAY }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SOCIALS ── */}
      <section className="relative z-10 py-10 px-5 border-t" style={{ borderColor: BORDER }}>
        <div className="flex justify-center gap-3 flex-wrap">
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 text-[12px] font-medium rounded-full border transition-colors hover:bg-gray-50" style={{ borderColor: BORDER, color: GRAY }}>
              Telegram
            </a>
          )}
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 text-[12px] font-medium rounded-full border transition-colors hover:bg-gray-50" style={{ borderColor: BORDER, color: GRAY }}>
              Twitter
            </a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 text-[12px] font-medium rounded-full border transition-colors hover:bg-gray-50" style={{ borderColor: BORDER, color: GRAY }}>
              Discord
            </a>
          )}
          {data.socials.dex && (
            <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 text-[12px] font-medium rounded-full transition-opacity hover:opacity-80" style={{ background: BLACK, color: WHITE }}>
              Chart
            </a>
          )}
        </div>
      </section>

      <Footer style={style} showWatermark={showWatermark} />
    </div>
  );
};

export default MinimalistLayout;
