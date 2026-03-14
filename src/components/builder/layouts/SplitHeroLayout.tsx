import { CoinData } from '@/types/coin';
import { ThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import TickerTape from '../TickerTape';
import { SectionHeader, Divider, ContractBlock, TokenomicsBlock, RoadmapBlock, SocialsBlock, Footer, CountdownBlock, ensureUrl } from './shared';

interface Props {
  data: CoinData;
  style: ThemeConfig;
  countdown: { d: number; h: number; m: number; s: number };
  showWatermark?: boolean;
}

const SplitHeroLayout = ({ data, style, countdown, showWatermark }: Props) => (
  <>
    <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-[180px] opacity-[0.06] pointer-events-none" style={{ backgroundColor: style.accentHex }} />
    <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[160px] opacity-[0.04] pointer-events-none" style={{ backgroundColor: style.accentHex2 }} />
    <TickerTape name={data.name} ticker={data.ticker} accentHex={style.accentHex} />

    {/* Split Hero */}
    <div className="px-6 sm:px-10 pt-14 pb-12 relative">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Left - Logo & Identity */}
        <div className="flex-1 flex flex-col items-center sm:items-start space-y-4">
          {data.logoUrl && (
            <div className="relative">
              <div className="absolute -inset-4 rounded-full blur-2xl opacity-25" style={{ background: `radial-gradient(circle, ${style.accentHex}, transparent)` }} />
              <img src={data.logoUrl} alt="Logo" className="w-24 h-24 rounded-2xl object-cover relative z-10 ring-2 ring-white/10 shadow-2xl" />
            </div>
          )}
          <div className="space-y-2 text-center sm:text-left">
            <h1 className={cn('font-display text-2xl md:text-4xl tracking-tight', style.accent, style.glow)}>{data.name || 'Your Coin Name'}</h1>
            {data.ticker && (
              <span className={cn('inline-block px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider border', style.border, style.accent)} style={{ background: `${style.accentHex}08` }}>{data.ticker}</span>
            )}
            <p className="text-base text-white/50 max-w-md leading-relaxed pt-1">{data.tagline || 'Your epic tagline goes here 🚀'}</p>
          </div>
        </div>

        {/* Right - CTA */}
        <div className="flex flex-col items-center sm:items-end gap-4 sm:min-w-[200px]">
          <div className="flex flex-col gap-3 w-full">
            <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className={cn('px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.03] w-full inline-flex items-center justify-center', style.button, style.buttonText)}>🚀 Buy Now</a>
            <a href={ensureUrl(data.socials.dex)} target="_blank" rel="noopener noreferrer" className={cn('px-8 py-4 rounded-xl font-bold text-sm border transition-all duration-300 hover:bg-white/5 w-full inline-flex items-center justify-center', style.border, style.accent)}>📊 Chart</a>
          </div>
          {data.showCountdown && data.launchDate && <CountdownBlock countdown={countdown} style={style} />}
        </div>
      </div>
    </div>

    {data.contractAddress && <div className="px-6 sm:px-10 pb-8"><ContractBlock data={data} style={style} /></div>}
    <Divider style={style} />

    {/* Two-column for Tokenomics + Roadmap on larger screens */}
    <div className="px-6 sm:px-10 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <SectionHeader label="Tokenomics" subtitle="Supply distribution" style={style} />
          <TokenomicsBlock data={data} style={style} />
        </div>
        {data.roadmap.length > 0 && (
          <div>
            <SectionHeader label="Roadmap" subtitle="Our journey" style={style} />
            <RoadmapBlock data={data} style={style} />
          </div>
        )}
      </div>
    </div>

    <Divider style={style} />

    <div className="px-6 sm:px-10 py-10">
      <SectionHeader label="Community" style={style} />
      <SocialsBlock data={data} style={style} />
    </div>

    <Footer style={style} />
  </>
);

export default SplitHeroLayout;
