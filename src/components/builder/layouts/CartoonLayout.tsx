import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Copy, Send, MessageCircle, ExternalLink, Wallet, ArrowDown, ShieldCheck } from 'lucide-react';
import TickerTape from '../TickerTape';
import DonutChart from '../DonutChart';
import { CountdownBlock, Footer, ensureUrl, copyToClipboard } from './shared';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
}

const CartoonLayout = ({ data, style, countdown }: Props) => {
  // Determine if this is a "light" theme based on bg color
  const textColor = 'text-white';
  const subTextColor = 'text-white/50';

  return (
    <>
      {/* Playful wavy background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[200px] opacity-[0.15]" style={{ backgroundColor: style.accentHex }} />
        <div className="absolute bottom-[-5%] right-[-5%] w-[350px] h-[350px] rounded-full blur-[180px] opacity-[0.1]" style={{ backgroundColor: style.accentHex2 }} />
      </div>

      {/* Chunky Nav */}
      <div className="px-5 sm:px-8 py-3.5 flex items-center justify-between relative z-10" style={{ borderBottom: `3px solid ${style.accentHex}25` }}>
        <div className="flex items-center gap-2.5">
          {data.logoUrl && <img src={data.logoUrl} alt="" className="w-9 h-9 rounded-xl object-cover" style={{ border: `2px solid ${style.accentHex}30` }} />}
          <span className={cn('font-display text-xs tracking-wider uppercase', style.accent)}>{data.name || 'TOKEN'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase mr-2">
            <span className={cn('cursor-pointer hover:opacity-70 transition-opacity', style.accent)}>About</span>
            <span className="text-white/20">•</span>
            <span className={cn('cursor-pointer hover:opacity-70 transition-opacity', style.accent)}>Tokenomics</span>
            <span className="text-white/20">•</span>
            <span className={cn('cursor-pointer hover:opacity-70 transition-opacity', style.accent)}>Roadmap</span>
          </div>
          <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className={cn('px-4 py-2 rounded-xl font-bold text-xs transition-all hover:scale-[1.05] inline-flex items-center', style.button, style.buttonText)}
            style={{ border: `2px solid ${style.accentHex}30` }}>
            Buy ${data.ticker || 'TOKEN'}
          </a>
        </div>
      </div>

      {/* Giant Cartoon Hero */}
      <div className="relative px-6 sm:px-10 pt-10 pb-6 text-center">
        {/* Big chunky title */}
        <h1 className={cn('font-display text-5xl md:text-7xl tracking-tight mb-2 relative z-10', style.accent)}
          style={{
            textShadow: `3px 3px 0px ${style.accentHex}30, 0 0 60px ${style.accentHex}25`,
            WebkitTextStroke: `1px ${style.accentHex}25`,
            paintOrder: 'stroke fill'
          }}>
          {data.name || 'YOUR COIN'}
        </h1>

        <p className="text-base text-white/50 max-w-md mx-auto leading-relaxed mb-6 relative z-10">
          {data.tagline || 'The most fun token on the blockchain! 🎉'}
        </p>

        {/* Mascot - Extra large with fun border */}
        {data.logoUrl && (
          <div className="relative inline-block my-4 z-10">
            <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-20" style={{ background: `radial-gradient(circle, ${style.accentHex}, ${style.accentHex2}, transparent)` }} />
            <img src={data.logoUrl} alt="Mascot" className="w-48 h-48 md:w-64 md:h-64 rounded-3xl mx-auto object-cover relative z-10"
              style={{
                border: `4px solid ${style.accentHex}40`,
                boxShadow: `0 15px 50px ${style.accentHex}20, inset 0 0 30px ${style.accentHex}08`
              }} />
          </div>
        )}

        {data.showCountdown && data.launchDate && <div className="mt-4 mb-4 relative z-10"><CountdownBlock countdown={countdown} style={style} /></div>}

        {/* Big chunky CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 relative z-10">
          <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className={cn('px-10 py-4 rounded-2xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.05] hover:rotate-1 inline-flex items-center', style.button, style.buttonText)}
            style={{ border: `3px solid ${style.accentHex}30`, boxShadow: `0 6px 0 ${style.accentHex}30, 0 10px 30px ${style.accentHex}15` }}>
            🚀 Buy ${data.ticker || 'TOKEN'} Now!
          </a>
          <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className={cn('px-10 py-4 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-[1.05] hover:-rotate-1 inline-flex items-center', style.accent)}
            style={{ border: `3px solid ${style.accentHex}25`, boxShadow: `0 6px 0 ${style.accentHex}15` }}>
            📊 View Chart
          </a>
        </div>
      </div>

      {/* Ticker Tape - Cartoon style */}
      <div className="my-4 relative z-10" style={{ transform: 'rotate(-1deg)' }}>
        <TickerTape name={data.name} ticker={data.ticker} accentHex={style.accentHex} />
      </div>

      {/* Contract Address - Chunky card */}
      {data.contractAddress && (
        <div className="px-6 sm:px-10 py-6">
          <div className="max-w-lg mx-auto rounded-2xl overflow-hidden" style={{ border: `3px solid ${style.accentHex}25`, background: `${style.accentHex}06` }}>
            <div className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className={cn('text-[10px] uppercase tracking-[0.2em] font-bold mb-1', style.accent)}>Contract Address 📋</p>
                <code className="text-xs text-white/60 truncate block font-mono">{data.contractAddress}</code>
              </div>
              <button onClick={() => copyToClipboard(data.contractAddress)} className={cn('px-4 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-[1.05] flex items-center gap-1.5', style.button, style.buttonText)}
                style={{ border: `2px solid ${style.accentHex}30` }}>
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How to Buy - Cartoon step cards */}
      <div className="px-6 sm:px-10 py-10">
        <h2 className={cn('font-display text-xl md:text-2xl text-center mb-8', style.accent)}
          style={{ textShadow: `2px 2px 0px ${style.accentHex}20` }}>
          How to Buy 🛒
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { step: '1', emoji: '👛', title: 'Get a Wallet', desc: 'Download a crypto wallet like Phantom or MetaMask.' },
            { step: '2', emoji: '💰', title: `Buy ${data.blockchain === 'solana' ? 'SOL' : 'ETH'}`, desc: `Get some ${data.blockchain === 'solana' ? 'SOL' : 'ETH'} from any exchange.` },
            { step: '3', emoji: '🔄', title: 'Swap!', desc: `Go to DEX and swap for $${data.ticker || 'TOKEN'}!` },
          ].map(s => (
            <div key={s.step} className="rounded-2xl p-5 text-center transition-all hover:scale-[1.02] relative"
              style={{ border: `3px solid ${style.accentHex}20`, background: `${style.accentHex}05`, boxShadow: `0 6px 0 ${style.accentHex}10` }}>
              <div className="text-4xl mb-3">{s.emoji}</div>
              <div className={cn('inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-2', style.accent)} style={{ background: `${style.accentHex}12`, border: `2px solid ${style.accentHex}20` }}>
                Step {s.step}
              </div>
              <h3 className="font-bold text-white/90 text-sm mb-2">{s.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tokenomics - Fun card */}
      <div className="px-6 sm:px-10 py-10">
        <h2 className={cn('font-display text-xl md:text-2xl text-center mb-8', style.accent)}
          style={{ textShadow: `2px 2px 0px ${style.accentHex}20` }}>
          Tokenomics 📊
        </h2>
        <div className="max-w-xl mx-auto rounded-2xl p-6" style={{ border: `3px solid ${style.accentHex}20`, background: `${style.accentHex}05` }}>
          <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full text-center">
              {[
                { label: 'Token Name', value: data.name || '—', emoji: '🪙' },
                { label: 'Ticker', value: data.ticker ? `$${data.ticker}` : '—', emoji: '💎' },
                { label: 'Blockchain', value: data.blockchain || 'Solana', emoji: '⛓️' },
                { label: 'Supply', value: data.totalSupply || '—', emoji: '📦' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3" style={{ background: `${style.accentHex}08`, border: `2px solid ${style.accentHex}12` }}>
                  <div className="text-lg mb-1">{s.emoji}</div>
                  <p className={cn('font-bold text-xs', style.accent)}>{s.value}</p>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <DonutChart distribution={data.distribution} accentHex={style.accentHex} />
            <div className="flex gap-4 text-xs text-white/40">
              <span>Buy Tax: <strong className={cn(style.accent)}>{data.buyTax}%</strong></span>
              <span>Sell Tax: <strong className={cn(style.accent)}>{data.sellTax}%</strong></span>
              <span>LP: <strong className={cn(style.accent)}>{data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap - Cartoon timeline */}
      {data.roadmap.length > 0 && (
        <div className="px-6 sm:px-10 py-10">
          <h2 className={cn('font-display text-xl md:text-2xl text-center mb-8', style.accent)}
            style={{ textShadow: `2px 2px 0px ${style.accentHex}20` }}>
            Roadmap 🗺️
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {data.roadmap.map((phase, i) => (
              <div key={phase.id} className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
                style={{ border: `3px solid ${style.accentHex}20`, background: `${style.accentHex}05`, boxShadow: `0 4px 0 ${style.accentHex}10` }}>
                <div className={cn('inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-3', style.accent)}
                  style={{ background: i === 0 ? `${style.accentHex}20` : `${style.accentHex}10`, border: `2px solid ${style.accentHex}25` }}>
                  Phase {i + 1} {i === 0 ? '🔥' : i === 1 ? '📈' : '🌙'}
                </div>
                <h3 className="font-bold text-white/90 text-sm mb-3">{phase.title.replace(/Phase \d+:\s*/, '')}</h3>
                <ul className="space-y-1.5">
                  {phase.items.filter(Boolean).map((item, j) => (
                    <li key={j} className="text-xs text-white/45 flex items-start gap-2">
                      <span className={cn('mt-0.5', style.accent)}>✦</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community - Fun social buttons */}
      <div className="px-6 sm:px-10 py-10">
        <h2 className={cn('font-display text-xl md:text-2xl text-center mb-6', style.accent)}
          style={{ textShadow: `2px 2px 0px ${style.accentHex}20` }}>
          Join the Community 🎉
        </h2>
        <div className="flex justify-center gap-3 flex-wrap">
          {data.socials.telegram && (
            <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className={cn('px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.05] hover:rotate-1 flex items-center gap-2', style.accent)}
              style={{ border: `3px solid ${style.accentHex}20`, background: `${style.accentHex}06`, boxShadow: `0 4px 0 ${style.accentHex}12` }}>
              <Send className="w-4 h-4" /> Telegram
            </a>
          )}
          {data.socials.twitter && (
            <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className={cn('px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.05] hover:-rotate-1 flex items-center gap-2', style.accent)}
              style={{ border: `3px solid ${style.accentHex}20`, background: `${style.accentHex}06`, boxShadow: `0 4px 0 ${style.accentHex}12` }}>
              𝕏 Twitter
            </a>
          )}
          {data.socials.discord && (
            <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className={cn('px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.05] hover:rotate-1 flex items-center gap-2', style.accent)}
              style={{ border: `3px solid ${style.accentHex}20`, background: `${style.accentHex}06`, boxShadow: `0 4px 0 ${style.accentHex}12` }}>
              <MessageCircle className="w-4 h-4" /> Discord
            </a>
          )}
          {data.socials.dex && (
            <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className={cn('px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.05] hover:-rotate-1 flex items-center gap-2', style.accent)}
              style={{ border: `3px solid ${style.accentHex}20`, background: `${style.accentHex}06`, boxShadow: `0 4px 0 ${style.accentHex}12` }}>
              <ExternalLink className="w-4 h-4" /> DEX
            </a>
          )}
        </div>
      </div>

      <div className="my-2" style={{ transform: 'rotate(1deg)' }}>
        <TickerTape name={data.name} ticker={data.ticker} accentHex={style.accentHex} />
      </div>
      <Footer style={style} />
    </>
  );
};

export default CartoonLayout;
