import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import TickerTape from '../TickerTape';
import { SectionHeader, Divider, ContractBlock, TokenomicsBlock, RoadmapBlock, SocialsBlock, Footer, CountdownBlock, DescriptionBlock, getBuyUrl, getChartUrl } from './shared';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
  showWatermark?: boolean;
}

const ClassicLayout = ({ data, style, countdown, showWatermark }: Props) => (
  <>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full blur-[160px] opacity-[0.07] pointer-events-none" style={{ backgroundColor: style.accentHex }} />
    <TickerTape name={data.name} ticker={data.ticker} accentHex={style.accentHex} />

    {/* Hero */}
    <div className="px-6 sm:px-10 pt-14 pb-12 text-center space-y-5 relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full blur-[120px] opacity-15" style={{ background: `radial-gradient(circle, ${style.accentHex}, ${style.accentHex2}, transparent)` }} />
      </div>
      {data.logoUrl && (
        <div className="relative inline-block">
          <div className="absolute -inset-3 rounded-full blur-2xl opacity-30" style={{ background: `radial-gradient(circle, ${style.accentHex}, transparent)` }} />
          <img src={data.logoUrl} alt="Logo" className="w-28 h-28 rounded-full mx-auto animate-float object-cover relative z-10 ring-2 ring-white/10 shadow-2xl" />
        </div>
      )}
      <div className="space-y-3">
        <h1 className={cn('font-display text-2xl md:text-3xl tracking-tight', style.accent, style.glow)}>{data.name || 'Your Coin Name'}</h1>
        {data.ticker && (
          <span className={cn('inline-block px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider border', style.border, style.accent)} style={{ background: `${style.accentHex}08` }}>{data.ticker}</span>
        )}
      </div>
      <p className="text-base text-white/50 max-w-sm mx-auto leading-relaxed">{data.tagline || 'Your epic tagline goes here 🚀'}</p>
      <div className="flex flex-wrap justify-center gap-3 pt-3">
        <a href={getBuyUrl(data)} target="_blank" rel="noopener noreferrer" className={cn('px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.03] inline-flex items-center', style.button, style.buttonText)}>🚀 Buy Now</a>
        <a href={getChartUrl(data)} target="_blank" rel="noopener noreferrer" className={cn('px-7 py-3.5 rounded-xl font-bold text-sm border transition-all duration-300 hover:bg-white/5 inline-flex items-center', style.border, style.accent)}>📊 Chart</a>
      </div>
      {data.showCountdown && data.launchDate && <div className="mt-8"><CountdownBlock countdown={countdown} style={style} /></div>}
    </div>

    {data.contractAddress && <div className="px-6 sm:px-10 pb-8"><ContractBlock data={data} style={style} /></div>}

    {data.description && (
      <>
        <Divider style={style} />
        <div className="px-6 sm:px-10 py-12">
          <SectionHeader label="About" subtitle={`What is ${data.name || 'this token'}?`} style={style} />
          <DescriptionBlock data={data} style={style} />
        </div>
      </>
    )}
    <Divider style={style} />

    <div className="px-6 sm:px-10 py-12 relative">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[100px] opacity-[0.05] pointer-events-none" style={{ backgroundColor: style.accentHex2 }} />
      <SectionHeader label="Tokenomics" subtitle="How the supply is distributed" style={style} />
      <TokenomicsBlock data={data} style={style} />
    </div>

    <Divider style={style} />

    {data.roadmap.length > 0 && (
      <>
        <div className="px-6 sm:px-10 py-12">
          <SectionHeader label="Roadmap" subtitle="Our journey to the moon" style={style} />
          <RoadmapBlock data={data} style={style} />
        </div>
        <Divider style={style} />
      </>
    )}

    <div className="px-6 sm:px-10 py-10">
      <SectionHeader label="Community" style={style} />
      <SocialsBlock data={data} style={style} />
    </div>

    <Footer style={style} showWatermark={showWatermark} />
  </>
);

export default ClassicLayout;
