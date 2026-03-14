import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { Copy, ExternalLink, Send, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import DonutChart from '../DonutChart';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

export const ensureUrl = (url: string) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

/** Strip leading $ from ticker so we can always prefix consistently */
export const cleanTicker = (ticker: string) => ticker.replace(/^\$+/, '');

/** Returns the best "Buy" URL for a token. Pump.fun tokens link to pump.fun, others to DEX link or DexScreener. */
export const getBuyUrl = (data: CoinData): string => {
  // If contract address looks like a Solana address and blockchain is solana, link to pump.fun
  if (data.blockchain === 'solana' && data.contractAddress && !/^0x/i.test(data.contractAddress)) {
    return `https://pump.fun/coin/${data.contractAddress}`;
  }
  // Otherwise use the user-provided DEX link, or fall back to DexScreener
  if (data.socials.dex) return ensureUrl(data.socials.dex);
  if (data.contractAddress) {
    const chain = data.blockchain || 'solana';
    return `https://dexscreener.com/${chain}/${data.contractAddress}`;
  }
  return '#';
};

/** Returns the best "Chart" URL — always DexScreener when possible. */
export const getChartUrl = (data: CoinData): string => {
  if (data.contractAddress) {
    const chain = data.blockchain || 'solana';
    return `https://dexscreener.com/${chain}/${data.contractAddress}`;
  }
  if (data.socials.dex) return ensureUrl(data.socials.dex);
  return '#';
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard!')).catch(() => toast.error('Failed to copy'));
};

interface SectionHeaderProps {
  label: string;
  subtitle?: string;
  style: ThemeConfig;
}

export const SectionHeader = ({ label, subtitle, style }: SectionHeaderProps) => (
  <div className="text-center mb-8">
    <span className={cn('inline-block text-[10px] tracking-[0.25em] uppercase font-medium px-4 py-1.5 rounded-full mb-3', style.accent)}
      style={{ background: `${style.accentHex}08`, border: `1px solid ${style.accentHex}12` }}>
      {label}
    </span>
    {subtitle && <p className="text-sm text-white/35">{subtitle}</p>}
  </div>
);

export const Divider = ({ style }: { style: ThemeConfig }) => (
  <div className="mx-6 sm:mx-10 h-px" style={{ background: `linear-gradient(90deg, transparent, ${style.accentHex}15, transparent)` }} />
);

interface ContractProps { data: CoinData; style: ThemeConfig }

export const ContractBlock = ({ data, style }: ContractProps) => {
  if (!data.contractAddress) return null;
  return (
    <div className={cn('p-4 rounded-xl flex items-center justify-between gap-3', style.cardBg)}
      style={{ boxShadow: `0 0 30px ${style.accentHex}05` }}>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-1.5 font-medium">Contract Address</p>
        <code className="text-xs text-white/60 truncate block font-mono">{data.contractAddress}</code>
      </div>
      <button onClick={() => copyToClipboard(data.contractAddress)} className={cn('p-2.5 rounded-lg transition-all hover:bg-white/5', style.border)}
        style={{ borderWidth: '1px', borderColor: `${style.accentHex}15` }}>
        <Copy className={cn('w-4 h-4', style.accent)} />
      </button>
    </div>
  );
};

interface DescriptionProps { data: CoinData; style: ThemeConfig }

export const DescriptionBlock = ({ data, style }: DescriptionProps) => {
  if (!data.description) return null;
  return (
    <div className={cn('rounded-2xl p-6', style.cardBg)} style={{ boxShadow: `0 0 40px ${style.accentHex}05` }}>
      <p className="text-sm text-white/55 leading-relaxed whitespace-pre-line">{data.description}</p>
    </div>
  );
};

interface TokenomicsProps { data: CoinData; style: ThemeConfig }

export const TokenomicsBlock = ({ data, style }: TokenomicsProps) => (
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
);

interface RoadmapProps { data: CoinData; style: ThemeConfig }

export const RoadmapBlock = ({ data, style }: RoadmapProps) => {
  if (data.roadmap.length === 0) return null;
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg, ${style.accentHex}30, ${style.accentHex}08)` }} />
      <div className="space-y-5">
        {data.roadmap.map((phase, i) => (
          <div key={phase.id} className="relative pl-14">
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
  );
};

interface SocialsProps { data: CoinData; style: ThemeConfig }

export const SocialsBlock = ({ data, style }: SocialsProps) => (
  <div className="flex justify-center gap-3 flex-wrap">
    {data.socials.telegram && (
      <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className={cn('px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/5 hover:scale-[1.03] flex items-center gap-2', style.accent)}
        style={{ border: `1px solid ${style.accentHex}18` }}>
        <Send className="w-4 h-4" /> Telegram
      </a>
    )}
    {data.socials.twitter && (
      <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className={cn('px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/5 hover:scale-[1.03] flex items-center gap-2', style.accent)}
        style={{ border: `1px solid ${style.accentHex}18` }}>
        𝕏 Twitter
      </a>
    )}
    {data.socials.discord && (
      <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className={cn('px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/5 hover:scale-[1.03] flex items-center gap-2', style.accent)}
        style={{ border: `1px solid ${style.accentHex}18` }}>
        <MessageCircle className="w-4 h-4" /> Discord
      </a>
    )}
    {data.socials.dex && (
      <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className={cn('px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/5 hover:scale-[1.03] flex items-center gap-2', style.accent)}
        style={{ border: `1px solid ${style.accentHex}18` }}>
        <ExternalLink className="w-4 h-4" /> DEX
      </a>
    )}
  </div>
);

export const Footer = ({ style, showWatermark = false }: { style: ThemeConfig; showWatermark?: boolean }) => (
  <div className="px-6 sm:px-10 py-5 text-center" style={{ borderTop: `1px solid ${style.accentHex}08` }}>
    <p className="text-[10px] text-white/15 tracking-wide">Not financial advice • DYOR 🐸</p>
    {showWatermark && (
      <a
        href="https://degen-site-studio.lovable.app"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-3 opacity-50 hover:opacity-80 transition-opacity"
      >
        <img src={logo} alt="Degen Tools" className="h-5 w-auto" />
        <span className="text-[9px] text-white/40 tracking-wider font-medium">Built with Degen Tools</span>
      </a>
    )}
  </div>
);

interface CountdownProps {
  countdown: { d: number; h: number; m: number; s: number };
  style: ThemeConfig;
}

export const CountdownBlock = ({ countdown, style }: CountdownProps) => (
  <div className="flex justify-center gap-2.5">
    {Object.entries(countdown).map(([k, v]) => (
      <div key={k} className={cn('rounded-xl p-3.5 min-w-[65px]', style.cardBg)}
        style={{ boxShadow: `0 0 20px ${style.accentHex}08` }}>
        <div className={cn('font-display text-xl', style.accent)}>{v}</div>
        <div className="text-[9px] text-white/35 uppercase tracking-widest mt-1.5 font-medium">{k === 'd' ? 'days' : k === 'h' ? 'hrs' : k === 'm' ? 'min' : 'sec'}</div>
      </div>
    ))}
  </div>
);
