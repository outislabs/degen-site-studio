import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Copy, Send, MessageCircle, ExternalLink, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import TickerTape from '../TickerTape';
import DonutChart from '../DonutChart';
import { CountdownBlock, Footer, ensureUrl, copyToClipboard } from './shared';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
}

const MascotHeroLayout = ({ data, style, countdown }: Props) => {
  const hasSocials = data.socials.telegram || data.socials.twitter || data.socials.discord || data.socials.dex;

  return (
    <>
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[600px] rounded-full blur-[250px] opacity-[0.08] pointer-events-none" style={{ backgroundColor: style.accentHex }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[200px] opacity-[0.05] pointer-events-none" style={{ backgroundColor: style.accentHex2 }} />

      {/* Nav Bar */}
      <div className="px-6 sm:px-10 py-4 flex items-center justify-between relative z-10" style={{ borderBottom: `1px solid ${style.accentHex}10` }}>
        <div className="flex items-center gap-3">
          {data.logoUrl && <img src={data.logoUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" />}
          <span className={cn('font-display text-xs tracking-wider', style.accent)}>{data.ticker ? `$${data.ticker}` : data.name || 'TOKEN'}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasSocials && (
            <div className="hidden sm:flex items-center gap-1.5 mr-3">
              {data.socials.telegram && <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all" style={{ border: `1px solid ${style.accentHex}12` }}><Send className={cn('w-3.5 h-3.5', style.accent)} /></a>}
              {data.socials.twitter && <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className={cn('w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all text-xs', style.accent)} style={{ border: `1px solid ${style.accentHex}12` }}>𝕏</a>}
              {data.socials.discord && <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all" style={{ border: `1px solid ${style.accentHex}12` }}><MessageCircle className={cn('w-3.5 h-3.5', style.accent)} /></a>}
            </div>
          )}
          <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className={cn('px-5 py-2 rounded-lg font-bold text-xs transition-all hover:scale-[1.03] inline-flex items-center', style.button, style.buttonText)}>Buy Now</a>
        </div>
      </div>

      {/* Giant Mascot Hero */}
      <div className="relative px-6 sm:px-10 pt-12 pb-8 text-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[400px] rounded-full blur-[150px] opacity-10" style={{ background: `radial-gradient(circle, ${style.accentHex}, ${style.accentHex2}, transparent)` }} />
        </div>

        {/* Big bold title */}
        <h1 className={cn('font-display text-4xl md:text-6xl tracking-tight mb-4 relative z-10', style.accent, style.glow)}
          style={{ textShadow: `0 0 60px ${style.accentHex}40, 0 0 120px ${style.accentHex}15` }}>
          {data.ticker ? `$${data.ticker}` : data.name || 'YOUR COIN'}
        </h1>

        {/* Mascot image - LARGE */}
        {data.logoUrl && (
          <div className="relative inline-block my-6">
            <div className="absolute -inset-8 rounded-full blur-3xl opacity-20" style={{ background: `radial-gradient(circle, ${style.accentHex}, ${style.accentHex2}, transparent)` }} />
            <img src={data.logoUrl} alt="Mascot" className="w-44 h-44 md:w-56 md:h-56 rounded-3xl mx-auto object-cover relative z-10 shadow-2xl" style={{ boxShadow: `0 20px 60px ${style.accentHex}25, 0 0 100px ${style.accentHex}10` }} />
          </div>
        )}

        <p className="text-lg text-white/50 max-w-md mx-auto leading-relaxed mb-6">
          {data.tagline || 'The next 1000x gem. Get in early. 🚀'}
        </p>

        {data.showCountdown && data.launchDate && <div className="mb-8"><CountdownBlock countdown={countdown} style={style} /></div>}
      </div>

      {/* Contract Address Bar */}
      {data.contractAddress && (
        <div className="px-6 sm:px-10 pb-6">
          <div className="max-w-lg mx-auto rounded-xl overflow-hidden flex items-center" style={{ border: `1px solid ${style.accentHex}20`, background: `${style.accentHex}05` }}>
            <div className="flex-1 px-4 py-3 min-w-0">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-0.5 font-medium">CA</p>
              <code className="text-xs text-white/60 truncate block font-mono">{data.contractAddress}</code>
            </div>
            <button onClick={() => copyToClipboard(data.contractAddress)} className={cn('px-5 py-3 font-bold text-xs transition-all', style.button, style.buttonText)}>
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Social Icons Row */}
      {hasSocials && (
        <div className="flex justify-center gap-3 pb-8 sm:hidden">
          {data.socials.telegram && <a href={ensureUrl(data.socials.telegram)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ border: `1px solid ${style.accentHex}20`, background: `${style.accentHex}08` }}><Send className={cn('w-4 h-4', style.accent)} /></a>}
          {data.socials.twitter && <a href={ensureUrl(data.socials.twitter)} target="_blank" rel="noopener noreferrer" className={cn('w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 text-sm', style.accent)} style={{ border: `1px solid ${style.accentHex}20`, background: `${style.accentHex}08` }}>𝕏</a>}
          {data.socials.discord && <a href={ensureUrl(data.socials.discord)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ border: `1px solid ${style.accentHex}20`, background: `${style.accentHex}08` }}><MessageCircle className={cn('w-4 h-4', style.accent)} /></a>}
          {data.socials.dex && <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ border: `1px solid ${style.accentHex}20`, background: `${style.accentHex}08` }}><ExternalLink className={cn('w-4 h-4', style.accent)} /></a>}
        </div>
      )}

      <TickerTape name={data.name} ticker={data.ticker} accentHex={style.accentHex} />

      {/* CTA Buttons - Large */}
      <div className="px-6 sm:px-10 py-10">
        <div className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4">
          <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className={cn('flex-1 px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.03] inline-flex items-center justify-center gap-2', style.button, style.buttonText)}>
            <Wallet className="w-4 h-4" /> Buy ${data.ticker || 'TOKEN'}
          </a>
          <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className={cn('flex-1 px-8 py-4 rounded-xl font-bold text-sm border transition-all duration-300 hover:bg-white/5 inline-flex items-center justify-center gap-2', style.border, style.accent)}>
            📊 View Chart <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* How to Buy Steps */}
      <div className="px-6 sm:px-10 py-12">
        <h2 className={cn('font-display text-lg md:text-xl text-center mb-8', style.accent)} style={{ textShadow: `0 0 30px ${style.accentHex}20` }}>
          How to Buy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { step: '01', title: 'Get a Wallet', desc: `Download Phantom or MetaMask and create your wallet.`, icon: <Wallet className="w-5 h-5" /> },
            { step: '02', title: `Buy ${data.blockchain === 'solana' ? 'SOL' : 'ETH'}`, desc: `Purchase ${data.blockchain === 'solana' ? 'SOL' : 'ETH'} from an exchange and send to your wallet.`, icon: <ArrowRight className="w-5 h-5" /> },
            { step: '03', title: `Swap for $${data.ticker || 'TOKEN'}`, desc: `Go to DEX, paste the contract address, and swap!`, icon: <ShieldCheck className="w-5 h-5" /> },
          ].map((s) => (
            <div key={s.step} className={cn('rounded-2xl p-5 text-center relative overflow-hidden', style.cardBg)} style={{ boxShadow: `0 0 30px ${style.accentHex}05` }}>
              <div className="absolute top-2 right-3 text-4xl font-display opacity-5" style={{ color: style.accentHex }}>{s.step}</div>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3', style.accent)} style={{ background: `${style.accentHex}12`, border: `1px solid ${style.accentHex}15` }}>
                {s.icon}
              </div>
              <h3 className="font-bold text-white/90 text-sm mb-2">{s.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tokenomics Section */}
      <div className="px-6 sm:px-10 py-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[120px] opacity-[0.04] pointer-events-none" style={{ backgroundColor: style.accentHex2 }} />
        <h2 className={cn('font-display text-lg md:text-xl text-center mb-8', style.accent)} style={{ textShadow: `0 0 30px ${style.accentHex}20` }}>
          Tokenomics
        </h2>
        <div className={cn('rounded-2xl p-6 max-w-xl mx-auto', style.cardBg)} style={{ boxShadow: `0 0 40px ${style.accentHex}05` }}>
          <div className="flex flex-col items-center gap-6">
            <p className="text-sm text-white/40">Total Supply: <span className="text-white/80 font-semibold">{data.totalSupply || '—'}</span></p>
            <DonutChart distribution={data.distribution} accentHex={style.accentHex} />
            <div className="grid grid-cols-3 gap-4 text-center w-full">
              <div className={cn('rounded-xl p-3', style.cardBg)}>
                <p className={cn('font-bold text-sm', style.accent)}>{data.buyTax}%</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Buy Tax</p>
              </div>
              <div className={cn('rounded-xl p-3', style.cardBg)}>
                <p className={cn('font-bold text-sm', style.accent)}>{data.sellTax}%</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Sell Tax</p>
              </div>
              <div className={cn('rounded-xl p-3', style.cardBg)}>
                <p className={cn('font-bold text-sm', style.accent)}>{data.liquidityStatus === 'locked' ? '🔒' : '🔥'}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">LP {data.liquidityStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      {data.roadmap.length > 0 && (
        <div className="px-6 sm:px-10 py-12">
          <h2 className={cn('font-display text-lg md:text-xl text-center mb-8', style.accent)} style={{ textShadow: `0 0 30px ${style.accentHex}20` }}>
            Roadmap
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {data.roadmap.map((phase, i) => (
              <div key={phase.id} className={cn('rounded-2xl p-5 relative overflow-hidden', style.cardBg)} style={{ boxShadow: `0 0 20px ${style.accentHex}05` }}>
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${style.accentHex}, ${style.accentHex2})`, opacity: i === 0 ? 1 : 0.3 }} />
                <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-semibold inline-block mb-3', style.accent)} style={{ background: `${style.accentHex}10`, border: `1px solid ${style.accentHex}18` }}>Phase {i + 1}</span>
                <h3 className="font-bold text-white/90 text-sm mb-3">{phase.title.replace(/Phase \d+:\s*/, '')}</h3>
                <ul className="space-y-1.5">
                  {phase.items.filter(Boolean).map((item, j) => (
                    <li key={j} className="text-xs text-white/45 flex items-start gap-2">
                      <span className={cn('mt-0.5', style.accent)}>•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <TickerTape name={data.name} ticker={data.ticker} accentHex={style.accentHex} />
      <Footer style={style} />
    </>
  );
};

export default MascotHeroLayout;
