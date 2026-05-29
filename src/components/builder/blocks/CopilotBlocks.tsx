import { Zap, BarChart3, TrendingUp, Users, Gift, Trophy, LineChart, MessageCircle, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CopilotBlockInstance } from '@/types/coin';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const fmt = (n: unknown, digits = 2, fallback = '—') =>
  typeof n === 'number' && Number.isFinite(n) ? n.toFixed(digits) : fallback;

// Accept both snake_case (AI) and kebab-case (UI) block ids.
const normalize = (t: string) => t.replace(/_/g, '-').toLowerCase();

const Shell = ({
  icon: Icon,
  title,
  tag,
  children,
  className,
}: {
  icon: any;
  title: string;
  tag?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-4 text-white',
      className
    )}
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold truncate">{title}</div>
        {tag && <div className="text-[10px] text-white/50">{tag}</div>}
      </div>
    </div>
    {children}
  </div>
);

const SwapWidget = ({ config = {} }: { config?: any }) => {
  const symbol = config?.token_symbol ?? config?.symbol ?? 'TOKEN';
  const pay = fmt(config?.pay_amount ?? 0, 2, '0.0');
  const receive = fmt(config?.receive_amount ?? 0, 2, '0.0');
  return (
    <Shell icon={Zap} title="Swap" tag="Powered by Jupiter">
      <div className="space-y-2 text-xs">
        <div className="rounded-lg bg-white/5 p-2.5 flex items-center justify-between">
          <span className="text-white/60">You pay</span>
          <span className="font-mono">{pay} SOL</span>
        </div>
        <div className="rounded-lg bg-white/5 p-2.5 flex items-center justify-between">
          <span className="text-white/60">You receive</span>
          <span className="font-mono">{receive} ${symbol}</span>
        </div>
        <button className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
          Swap
        </button>
      </div>
    </Shell>
  );
};

const LpStats = ({ config = {} }: { config?: any }) => {
  const symbol = config?.token_symbol ?? config?.symbol ?? 'TOKEN';
  const price = typeof config?.price === 'number' ? `$${fmt(config.price, 5, '0.00')}` : '$0.00042';
  const volume = config?.volume_24h ?? '$128k';
  const liquidity = config?.liquidity ?? '$540k';
  return (
    <Shell icon={BarChart3} title={`${symbol} · LP Stats`} tag="DexScreener">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { l: 'Price', v: price },
          { l: '24h Vol', v: String(volume) },
          { l: 'Liquidity', v: String(liquidity) },
        ].map(s => (
          <div key={s.l} className="rounded-lg bg-white/5 p-2">
            <div className="text-[10px] text-white/50 uppercase tracking-wide">{s.l}</div>
            <div className="text-xs font-semibold mt-0.5">{s.v}</div>
          </div>
        ))}
      </div>
    </Shell>
  );
};

const TrendingFeed = () => {
  const tokens = [
    { s: 'BONK', c: '+12.4%' },
    { s: 'WIF', c: '+8.1%' },
    { s: 'POPCAT', c: '+5.7%' },
    { s: 'MEW', c: '-2.3%' },
    { s: 'JUP', c: '+1.9%' },
  ];
  return (
    <Shell icon={TrendingUp} title="Trending" tag="Birdeye">
      <div className="space-y-1.5">
        {tokens.map((t, i) => (
          <div key={t.s} className="flex items-center justify-between text-xs rounded-md bg-white/5 px-2.5 py-1.5">
            <span className="flex items-center gap-2">
              <span className="text-white/40 text-[10px] w-3">{i + 1}</span>
              <span className="font-semibold">${t.s}</span>
            </span>
            <span className={cn('font-mono text-[11px]', t.c.startsWith('-') ? 'text-red-400' : 'text-emerald-400')}>{t.c}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
};

const HolderGate = ({ config = {} }: { config?: any }) => {
  const min = config?.min_holding ?? config?.minimum ?? '1,000';
  return (
    <Shell icon={Users} title="Holders only" tag={`Requires ${min}+ tokens`}>
      <div className="text-xs text-white/60 mb-3">Connect your wallet to verify you hold the required tokens to view this content.</div>
      <button className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
        Connect wallet
      </button>
    </Shell>
  );
};

const ClaimPage = ({ config = {} }: { config?: any }) => {
  const amount = config?.amount ?? '1,500';
  const symbol = config?.token_symbol ?? config?.symbol ?? 'TOKEN';
  return (
    <Shell icon={Gift} title="Claim your rewards">
      <div className="rounded-lg bg-white/5 p-3 text-center mb-3">
        <div className="text-[10px] uppercase tracking-wide text-white/50">Eligible</div>
        <div className="text-lg font-bold mt-0.5">{amount} ${symbol}</div>
      </div>
      <button className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
        Claim
      </button>
    </Shell>
  );
};

const HolderLeaderboard = () => {
  const rows = Array.from({ length: 10 }).map((_, i) => ({
    rank: i + 1,
    addr: `${(Math.random().toString(36).slice(2, 6) + 'XYZ').toUpperCase()}…${(Math.random().toString(36).slice(2, 6)).toUpperCase()}`,
    bal: `${fmt(Math.random() * 5 + 0.1, 2, '0.00')}%`,
  }));
  return (
    <Shell icon={Trophy} title="Top holders">
      <div className="space-y-1">
        {rows.map(r => (
          <div key={r.rank} className="grid grid-cols-[20px_1fr_60px] items-center text-[11px] px-2 py-1 rounded-md bg-white/5">
            <span className="text-white/40">{r.rank}</span>
            <span className="font-mono truncate">{r.addr}</span>
            <span className="font-semibold text-right">{r.bal}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
};

const LiveChart = () => (
  <Shell icon={LineChart} title="Live chart" tag="DexScreener">
    <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 via-white/5 to-transparent flex items-end p-2 overflow-hidden">
      <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
        <polyline
          points="0,30 10,28 20,22 30,25 40,18 50,20 60,12 70,15 80,8 90,10 100,4"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  </Shell>
);

const SocialCta = ({ config = {} }: { config?: any }) => {
  const tg = config?.telegram ?? '#';
  const dc = config?.discord ?? '#';
  return (
    <Shell icon={MessageCircle} title="Join the community">
      <div className="grid grid-cols-2 gap-2">
        <a
          href={tg}
          target="_blank"
          rel="noreferrer"
          className="h-9 rounded-lg bg-[#229ED9]/90 hover:bg-[#229ED9] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Telegram
        </a>
        <a
          href={dc}
          target="_blank"
          rel="noreferrer"
          className="h-9 rounded-lg bg-[#5865F2]/90 hover:bg-[#5865F2] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-3.5 h-3.5" /> Discord
        </a>
      </div>
    </Shell>
  );
};

const BLOCK_REGISTRY: Record<string, (props: { config: any }) => JSX.Element> = {
  'swap-widget': SwapWidget,
  'lp-stats': LpStats,
  'trending-feed': () => <TrendingFeed />,
  'holder-gate': HolderGate,
  'claim-page': ClaimPage,
  'holder-leaderboard': () => <HolderLeaderboard />,
  'live-chart': () => <LiveChart />,
  'social-cta': SocialCta,
};

const CopilotBlockRenderer = ({ block }: { block: CopilotBlockInstance }) => {
  const key = normalize(block.block_type);
  const Comp = BLOCK_REGISTRY[key];
  // Animate fresh blocks: pulse for 1.6s after mount
  const isFresh = Date.now() - (block.created_at ?? 0) < 1600;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className={cn(
        'relative',
        isFresh && 'after:absolute after:inset-0 after:rounded-2xl after:ring-2 after:ring-primary/60 after:animate-pulse after:pointer-events-none'
      )}
    >
      <ErrorBoundary label={`copilot-block:${block.block_type}`}>
        {Comp ? (
          <Comp config={block.config ?? {}} />
        ) : (
          <Shell icon={Sparkles} title={block.block_type} tag="Unknown block">
            <div className="text-[11px] text-white/50">No renderer is registered for this block type.</div>
          </Shell>
        )}
      </ErrorBoundary>
    </motion.div>
  );
};

export const CopilotBlocksSection = ({ blocks }: { blocks?: CopilotBlockInstance[] }) => {
  if (!blocks || blocks.length === 0) return null;
  return (
    <section className="px-4 sm:px-6 py-6 space-y-3 bg-black/20 border-t border-white/5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/40 font-semibold">
        <Sparkles className="w-3 h-3" />
        Utilities
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {blocks.map(b => (
          <CopilotBlockRenderer key={b.id} block={b} />
        ))}
      </div>
    </section>
  );
};

export default CopilotBlocksSection;