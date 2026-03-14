import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import TickerTape from '../TickerTape';
import { ContractBlock, TokenomicsBlock, RoadmapBlock, SocialsBlock, Footer, CountdownBlock } from './shared';
import { Copy } from 'lucide-react';
import DonutChart from '../DonutChart';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
}

const BentoLayout = ({ data, style, countdown }: Props) => (
  <>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[200px] opacity-[0.06] pointer-events-none" style={{ backgroundColor: style.accentHex }} />
    <TickerTape name={data.name} ticker={data.ticker} accentHex={style.accentHex} />

    {/* Hero - compact */}
    <div className="px-6 sm:px-10 pt-14 pb-8 text-center space-y-4 relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-60 h-60 rounded-full blur-[100px] opacity-10" style={{ background: `radial-gradient(circle, ${style.accentHex}, ${style.accentHex2}, transparent)` }} />
      </div>
      {data.logoUrl && (
        <div className="relative inline-block">
          <div className="absolute -inset-3 rounded-full blur-2xl opacity-30" style={{ background: `radial-gradient(circle, ${style.accentHex}, transparent)` }} />
          <img src={data.logoUrl} alt="Logo" className="w-20 h-20 rounded-full mx-auto animate-float object-cover relative z-10 ring-2 ring-white/10 shadow-2xl" />
        </div>
      )}
      <h1 className={cn('font-display text-2xl md:text-3xl tracking-tight', style.accent, style.glow)}>{data.name || 'Your Coin Name'}</h1>
      {data.ticker && (
        <span className={cn('inline-block px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider border', style.border, style.accent)} style={{ background: `${style.accentHex}08` }}>{data.ticker}</span>
      )}
      <p className="text-sm text-white/50 max-w-sm mx-auto">{data.tagline || 'Your epic tagline goes here 🚀'}</p>
    </div>

    {/* Bento Grid */}
    <div className="px-6 sm:px-10 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CTA Card */}
        <div className={cn('rounded-2xl p-6 flex flex-col justify-center items-center gap-4', style.cardBg)} style={{ boxShadow: `0 0 40px ${style.accentHex}05` }}>
          <button className={cn('px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.03] w-full', style.button, style.buttonText)}>🚀 Buy Now</button>
          <button className={cn('px-8 py-3.5 rounded-xl font-bold text-sm border transition-all duration-300 hover:bg-white/5 w-full', style.border, style.accent)}>📊 Chart</button>
        </div>

        {/* Countdown or Contract */}
        <div className={cn('rounded-2xl p-6 flex flex-col justify-center items-center', style.cardBg)} style={{ boxShadow: `0 0 40px ${style.accentHex}05` }}>
          {data.showCountdown && data.launchDate ? (
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4 text-center font-medium">Launch Countdown</p>
              <CountdownBlock countdown={countdown} style={style} />
            </div>
          ) : data.contractAddress ? (
            <div className="w-full">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2 font-medium">Contract</p>
              <code className="text-xs text-white/60 truncate block font-mono mb-2">{data.contractAddress}</code>
              <button className={cn('p-2 rounded-lg transition-all hover:bg-white/5 border', style.border)}>
                <Copy className={cn('w-3.5 h-3.5', style.accent)} />
              </button>
            </div>
          ) : (
            <p className="text-sm text-white/20">More info coming soon</p>
          )}
        </div>

        {/* Tokenomics - spans full width */}
        <div className={cn('rounded-2xl p-6 sm:col-span-2', style.cardBg)} style={{ boxShadow: `0 0 40px ${style.accentHex}05` }}>
          <p className={cn('text-[10px] tracking-[0.25em] uppercase font-medium mb-4 text-center', style.accent)}>Tokenomics</p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <DonutChart distribution={data.distribution} accentHex={style.accentHex} />
            <div className="flex flex-col gap-2 text-xs text-white/40">
              <p>Total Supply: <span className="text-white/80 font-semibold">{data.totalSupply || '—'}</span></p>
              <p>Buy Tax: <span className="text-white/80 font-semibold">{data.buyTax}%</span></p>
              <p>Sell Tax: <span className="text-white/80 font-semibold">{data.sellTax}%</span></p>
              <p>LP: <span className="text-white/80 font-semibold">{data.liquidityStatus === 'locked' ? '🔒 Locked' : '🔥 Burned'}</span></p>
            </div>
          </div>
        </div>

        {/* Roadmap cards */}
        {data.roadmap.map((phase, i) => (
          <div key={phase.id} className={cn('rounded-2xl p-5', style.cardBg)} style={{ boxShadow: `0 0 20px ${style.accentHex}03` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-semibold', style.accent)} style={{ background: `${style.accentHex}10`, border: `1px solid ${style.accentHex}18` }}>Phase {i + 1}</span>
              <span className="text-sm font-bold text-white/90">{phase.title.replace(/Phase \d+:\s*/, '')}</span>
            </div>
            <ul className="space-y-1.5">
              {phase.items.filter(Boolean).map((item, j) => (
                <li key={j} className="text-sm text-white/50 flex items-start gap-2">
                  <span className={cn('mt-0.5 text-xs', style.accent)}>▸</span> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Socials - full width */}
        <div className={cn('rounded-2xl p-6 sm:col-span-2', style.cardBg)} style={{ boxShadow: `0 0 40px ${style.accentHex}05` }}>
          <p className={cn('text-[10px] tracking-[0.25em] uppercase font-medium mb-4 text-center', style.accent)}>Community</p>
          <SocialsBlock data={data} style={style} />
        </div>
      </div>
    </div>

    <Footer style={style} />
  </>
);

export default BentoLayout;
