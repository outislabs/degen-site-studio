import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Copy, ExternalLink, Send, MessageCircle } from 'lucide-react';
import { CountdownBlock, ensureUrl, copyToClipboard, DescriptionBlock, getBuyUrl, getChartUrl, cleanTicker } from './shared';
import TokenStatsBar from '../TokenStatsBar';
import { themes } from '@/lib/themes';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
}

const MinimalLayout = ({ data, style, countdown }: Props) => (
  <>
    {/* Full-screen hero */}
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-8 text-center relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full blur-[200px] opacity-[0.08]" style={{ background: `radial-gradient(circle, ${style.accentHex}, transparent)` }} />
      </div>

      {data.logoUrl && (
        <div className="relative mb-10">
          <div className="absolute -inset-6 rounded-full blur-3xl opacity-20" style={{ background: `radial-gradient(circle, ${style.accentHex}, transparent)` }} />
          <img src={data.logoUrl} alt="Logo" className="w-32 h-32 rounded-full object-cover relative z-10 ring-1 ring-white/5 shadow-2xl" />
        </div>
      )}

      <h1 className={cn('font-display text-3xl md:text-5xl tracking-tight mb-4', style.accent, style.glow)}>
        {data.name || 'Your Coin Name'}
      </h1>

      {data.ticker && (
        <span className="text-white/25 text-sm tracking-[0.3em] uppercase font-medium mb-6">${cleanTicker(data.ticker)}</span>
      )}

      <p className="text-lg text-white/40 max-w-lg mx-auto leading-relaxed mb-10">
        {data.tagline || 'Your epic tagline goes here 🚀'}
      </p>

      <div className="flex gap-4">
        <a href={getBuyUrl(data)} target="_blank" rel="noopener noreferrer" className={cn('px-10 py-4 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-[1.03] inline-flex items-center', style.button, style.buttonText)}>Buy Now</a>
        <a href={getChartUrl(data)} target="_blank" rel="noopener noreferrer" className={cn('px-10 py-4 rounded-full font-bold text-sm border transition-all duration-300 hover:bg-white/5 inline-flex items-center', style.border, style.accent)}>Chart</a>
      </div>

      {data.showCountdown && data.launchDate && <div className="mt-12"><CountdownBlock countdown={countdown} style={style} /></div>}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-px h-12" style={{ background: `linear-gradient(180deg, ${style.accentHex}30, transparent)` }} />
      </div>
    </div>

    {/* Contract - Minimal */}
    {data.contractAddress && (
      <div className="max-w-lg mx-auto px-8 pb-16">
        <div className="flex items-center justify-between gap-4 py-4" style={{ borderTop: `1px solid ${style.accentHex}10`, borderBottom: `1px solid ${style.accentHex}10` }}>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 mb-1">Contract</p>
            <code className="text-xs text-white/50 truncate block font-mono">{data.contractAddress}</code>
          </div>
          <button onClick={() => copyToClipboard(data.contractAddress)} className="p-2 rounded-lg hover:bg-white/5 transition-all">
            <Copy className={cn('w-4 h-4', style.accent)} />
          </button>
        </div>
      </div>
    )}

    {/* Description */}
    {data.description && (
      <div className="max-w-lg mx-auto px-8 py-12">
        <h2 className={cn('text-xs tracking-[0.3em] uppercase text-center mb-8', style.accent)}>About</h2>
        <p className="text-sm text-white/40 leading-relaxed whitespace-pre-line text-center">{data.description}</p>
      </div>
    )}

    {/* Stats Row - Minimal */}
    <div className="max-w-2xl mx-auto px-8 py-16">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        <div>
          <p className={cn('font-display text-2xl mb-1', style.accent)}>{data.totalSupply || '—'}</p>
          <p className="text-[10px] text-white/25 uppercase tracking-widest">Supply</p>
        </div>
        <div>
          <p className={cn('font-display text-2xl mb-1', style.accent)}>{data.buyTax}%</p>
          <p className="text-[10px] text-white/25 uppercase tracking-widest">Buy Tax</p>
        </div>
        <div>
          <p className={cn('font-display text-2xl mb-1', style.accent)}>{data.sellTax}%</p>
          <p className="text-[10px] text-white/25 uppercase tracking-widest">Sell Tax</p>
        </div>
        <div>
          <p className={cn('font-display text-2xl mb-1', style.accent)}>{data.liquidityStatus === 'locked' ? '🔒' : '🔥'}</p>
          <p className="text-[10px] text-white/25 uppercase tracking-widest">LP {data.liquidityStatus}</p>
        </div>
      </div>
    </div>

    {/* Roadmap - Clean */}
    {data.roadmap.length > 0 && (
      <div className="max-w-lg mx-auto px-8 py-16">
        <h2 className={cn('text-xs tracking-[0.3em] uppercase text-center mb-12', style.accent)}>Roadmap</h2>
        <div className="space-y-10">
          {data.roadmap.map((phase, i) => (
            <div key={phase.id}>
              <p className={cn('text-xs font-bold mb-3 tracking-wider uppercase', style.accent)} style={{ opacity: 0.6 }}>Phase {i + 1}</p>
              <h3 className="text-white/80 font-semibold mb-3">{phase.title.replace(/Phase \d+:\s*/, '')}</h3>
              <ul className="space-y-2">
                {phase.items.filter(Boolean).map((item, j) => (
                  <li key={j} className="text-sm text-white/40 pl-4" style={{ borderLeft: `1px solid ${style.accentHex}20` }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Socials - Icon row */}
    <div className="max-w-lg mx-auto px-8 py-16 text-center">
      <div className="flex justify-center gap-4">
        {data.socials.telegram && (
          <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110', style.accent)} style={{ border: `1px solid ${style.accentHex}15` }}>
            <Send className="w-5 h-5" />
          </a>
        )}
        {data.socials.twitter && (
          <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 text-lg', style.accent)} style={{ border: `1px solid ${style.accentHex}15` }}>
            𝕏
          </a>
        )}
        {data.socials.discord && (
          <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110', style.accent)} style={{ border: `1px solid ${style.accentHex}15` }}>
            <MessageCircle className="w-5 h-5" />
          </a>
        )}
        {data.socials.dex && (
          <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110', style.accent)} style={{ border: `1px solid ${style.accentHex}15` }}>
            <ExternalLink className="w-5 h-5" />
          </a>
        )}
      </div>
    </div>

    {/* Footer */}
    <div className="px-8 py-6 text-center">
      <p className="text-[10px] text-white/10 tracking-wide">Built with Degen Tools • DYOR</p>
    </div>
  </>
);

export default MinimalLayout;
