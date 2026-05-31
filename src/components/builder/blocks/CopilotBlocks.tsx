import { useState } from 'react';
import {
  Zap, BarChart3, TrendingUp, Users, Gift, Trophy, LineChart, MessageCircle, Send, Sparkles,
  Trash2, ArrowUp, ArrowDown, Settings, Copy, AlertTriangle, Plus,
  AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type {
  CopilotBlockInstance, BlockPlacement, BlockPosition, BlockSize, BlockAlignment,
} from '@/types/coin';
import { DEFAULT_PLACEMENT } from '@/types/coin';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import JupiterSwapLive from './JupiterSwapLive';
import { useIsMobile } from '@/hooks/use-mobile';

const numberValue = (value: unknown, fallback?: number) => {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (Number.isFinite(parsed)) return parsed;
  return fallback;
};

const fmt = (value: unknown, digits = 2, fallback = '—') => {
  const parsed = numberValue(value);
  return parsed == null ? fallback : parsed.toFixed(digits);
};

const text = (value: unknown, fallback: string) => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
};

const positiveInt = (value: unknown, fallback: number, max = 20) => {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), max) : fallback;
};

const stringList = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value.map((item) => text(item, '')).filter(Boolean);
  return cleaned.length > 0 ? cleaned : fallback;
};

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

interface BlockExtras {
  live?: boolean;
  contractAddress?: string;
  accentHex?: string;
  bgHex?: string;
  /** Effective size after mobile collapse — passed so blocks like Jupiter can adapt. */
  size?: BlockSize;
}

const SwapWidget = ({ config = {}, extras }: { config?: any; extras?: BlockExtras }) => {
  // On published sites, render the real Jupiter plugin. In the builder
  // canvas we always render the mock so the heavy plugin doesn't load 8x.
  if (extras?.live) {
    return (
      <JupiterSwapLive
        contractAddress={extras.contractAddress}
        accentHex={extras.accentHex}
        bgHex={extras.bgHex}
        size={extras.size}
      />
    );
  }
  const { token: rawToken, token_symbol, symbol, chain: rawChain = 'solana', pay_amount, amount_in, receive_amount, amount_out } = config ?? {};
  const token = text(rawToken ?? token_symbol ?? symbol, 'TOKEN');
  const chain = text(rawChain, 'solana');
  const hasToken = token !== 'TOKEN';
  const pay = fmt(pay_amount ?? amount_in ?? 0, 2, '0.00');
  const receive = fmt(receive_amount ?? amount_out ?? 0, 2, '0.00');
  return (
    <Shell icon={Zap} title={`Swap ${token}`} tag={`Swap ${token} on ${chain} · Powered by Jupiter`}>
      <div className="space-y-2 text-xs">
        {!hasToken && <div className="rounded-lg bg-muted/40 border border-border p-2.5 text-muted-foreground">Swap widget — configure to display</div>}
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5 text-primary font-semibold">
          Swap {token} on {chain} (Powered by Jupiter)
        </div>
        <div className="rounded-lg bg-white/5 p-2.5 flex items-center justify-between">
          <span className="text-white/60">You pay</span>
          <span className="font-mono">{pay} SOL</span>
        </div>
        <div className="rounded-lg bg-white/5 p-2.5 flex items-center justify-between">
          <span className="text-white/60">You receive</span>
          <span className="font-mono">{receive} ${token}</span>
        </div>
        <button className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
          Swap
        </button>
      </div>
    </Shell>
  );
};

const LpStats = ({ config = {} }: { config?: any }) => {
  const { token: rawToken, token_symbol, symbol, price: rawPrice, usd_price, volume_24h, volume, liquidity: rawLiquidity = '540k' } = config ?? {};
  const token = text(rawToken ?? token_symbol ?? symbol, 'TOKEN');
  const hasToken = token !== 'TOKEN';
  const price = `$${fmt(rawPrice ?? usd_price ?? 0.00042, 5, '0.00000')}`;
  const volumeLabel = `$${text(volume_24h ?? volume ?? '128k', '128k')}`.replace('$$', '$');
  const liquidity = `$${text(rawLiquidity, '540k')}`.replace('$$', '$');
  return (
    <Shell icon={BarChart3} title={`${token} · LP Stats`} tag="Mock market data">
      {!hasToken && <div className="rounded-lg bg-muted/40 border border-border p-2.5 text-xs text-muted-foreground mb-3">LP stats — configure to display</div>}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-2 text-center">
        {[
          { l: 'Price', v: price },
          { l: '24h Vol', v: volumeLabel },
          { l: 'Liquidity', v: liquidity },
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

const TrendingFeed = ({ config = {} }: { config?: any }) => {
  const chain = text(config?.chain, 'solana');
  const limit = positiveInt(config?.limit, 5, 10);
  const tokens = [
    { s: 'BONK', c: '+12.4%' },
    { s: 'WIF', c: '+8.1%' },
    { s: 'POPCAT', c: '+5.7%' },
    { s: 'MEW', c: '-2.3%' },
    { s: 'JUP', c: '+1.9%' },
    { s: 'BOME', c: '+1.1%' },
    { s: 'MOBILE', c: '-0.8%' },
    { s: 'PYTH', c: '+0.6%' },
  ].slice(0, limit);
  return (
    <Shell icon={TrendingUp} title="Trending" tag={`${chain} · Top ${limit}`}>
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
  const token = text(config?.token ?? config?.token_symbol ?? config?.symbol, 'TOKEN');
  const min = text(config?.min_balance ?? config?.min_holding ?? config?.minimum, '1,000');
  return (
    <Shell icon={Users} title="Holders only" tag={`Requires ${min}+ ${token}`}>
      <div className="text-xs text-white/60 mb-3">Connect your wallet to verify you hold {min}+ ${token} to view this content.</div>
      <button className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
        Connect wallet
      </button>
    </Shell>
  );
};

const ClaimPage = ({ config = {} }: { config?: any }) => {
  const { token: rawToken, token_symbol, symbol, claim_type = 'airdrop', amount: rawAmount, claim_amount } = config ?? {};
  const token = text(rawToken ?? token_symbol ?? symbol, 'TOKEN');
  const claimType = text(claim_type, 'airdrop');
  const amount = text(rawAmount ?? claim_amount, '1,500');
  const hasToken = token !== 'TOKEN';
  return (
    <Shell icon={Gift} title="Claim your rewards" tag={`${claimType} claim`}>
      {!hasToken && <div className="rounded-lg bg-muted/40 border border-border p-2.5 text-xs text-muted-foreground mb-3">Claim page — configure to display</div>}
      <div className="rounded-lg bg-white/5 p-3 text-center mb-3">
        <div className="text-[10px] uppercase tracking-wide text-white/50">Eligible</div>
        <div className="text-lg font-bold mt-0.5">{amount} ${token}</div>
      </div>
      <button className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
        Claim
      </button>
    </Shell>
  );
};

const HolderLeaderboard = ({ config = {} }: { config?: any }) => {
  const { token: rawToken, token_symbol, symbol, limit: rawLimit = 10 } = config ?? {};
  const token = text(rawToken ?? token_symbol ?? symbol, 'TOKEN');
  const limit = positiveInt(rawLimit, 10, 20);
  const hasToken = token !== 'TOKEN';
  const rows = Array.from({ length: limit }).map((_, i) => ({
    rank: i + 1,
    addr: `WALLET${String(i + 1).padStart(2, '0')}…${String(9000 + i)}`,
    bal: `${fmt(Math.random() * 5 + 0.1, 2, '0.00')}%`,
  }));
  return (
    <Shell icon={Trophy} title="Top holders" tag={`${token} · Top ${limit}`}>
      {!hasToken && <div className="rounded-lg bg-muted/40 border border-border p-2.5 text-xs text-muted-foreground mb-3">Holder leaderboard — configure to display</div>}
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

const LiveChart = ({ config = {} }: { config?: any }) => {
  const { token: rawToken, token_symbol, symbol, timeframe: rawTimeframe = '24h' } = config ?? {};
  const token = text(rawToken ?? token_symbol ?? symbol, 'TOKEN');
  const timeframe = text(rawTimeframe, '24h');
  const hasToken = token !== 'TOKEN';
  return (
  <Shell icon={LineChart} title={`${token} live chart`} tag={`Mock ${timeframe} chart`}>
    {!hasToken && <div className="rounded-lg bg-muted/40 border border-border p-2.5 text-xs text-muted-foreground mb-3">Live chart — configure to display</div>}
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
};

const SocialCta = ({ config = {} }: { config?: any }) => {
  const platforms = stringList(config?.platforms, ['Telegram', 'Discord']);
  const platformStyles: Record<string, { icon: typeof Send; className: string }> = {
    telegram: { icon: Send, className: 'bg-primary/80 hover:bg-primary' },
    discord: { icon: MessageCircle, className: 'bg-secondary hover:bg-secondary/80' },
    twitter: { icon: MessageCircle, className: 'bg-white/10 hover:bg-white/15' },
    x: { icon: MessageCircle, className: 'bg-white/10 hover:bg-white/15' },
  };
  return (
    <Shell icon={MessageCircle} title="Join the community" tag={platforms.join(' · ')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {platforms.map((platform) => {
          const key = platform.toLowerCase();
          const style = platformStyles[key] ?? { icon: MessageCircle, className: 'bg-primary/80 hover:bg-primary' };
          const Icon = style.icon;
          return (
            <a
              key={platform}
              href="#"
              className={cn('h-9 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5', style.className)}
            >
              <Icon className="w-3.5 h-3.5" /> {platform}
            </a>
          );
        })}
      </div>
    </Shell>
  );
};

const BLOCK_REGISTRY: Record<string, (props: { config: any; extras?: BlockExtras }) => JSX.Element> = {
  'swap-widget': SwapWidget,
  'lp-stats': LpStats,
  'trending-feed': TrendingFeed,
  'holder-gate': HolderGate,
  'claim-page': ClaimPage,
  'holder-leaderboard': HolderLeaderboard,
  'live-chart': LiveChart,
  'social-cta': SocialCta,
};

// Map blocks to their underlying plugin source for the "Powered by" subtitle.
const BLOCK_SOURCES: Record<string, string> = {
  'swap-widget': 'Jupiter',
  'lp-stats': 'DexScreener',
  'trending-feed': 'Birdeye',
  'holder-gate': 'Token Gate',
  'claim-page': 'Streamflow',
  'holder-leaderboard': 'Solscan',
  'live-chart': 'DexScreener',
  'social-cta': 'Community',
};

const BLOCK_LABELS: Record<string, string> = {
  'swap-widget': 'Swap Widget',
  'lp-stats': 'LP Stats',
  'trending-feed': 'Trending Feed',
  'holder-gate': 'Holder Gate',
  'claim-page': 'Claim Page',
  'holder-leaderboard': 'Holder Leaderboard',
  'live-chart': 'Live Chart',
  'social-cta': 'Social CTA',
};

// Blocks that require a token to be useful. If they don't have one yet they're
// "stale" — visible in the editor with a warning, hidden on the published site.
const TOKEN_REQUIRED = new Set([
  'swap-widget', 'lp-stats', 'claim-page', 'holder-leaderboard',
  'live-chart', 'holder-gate',
]);

export const isBlockStale = (block: CopilotBlockInstance): boolean => {
  const key = normalize(text(block?.block_type, ''));
  if (!TOKEN_REQUIRED.has(key)) return false;
  const cfg = block?.config ?? {};
  const token = cfg.token ?? cfg.token_symbol ?? cfg.symbol;
  if (typeof token !== 'string' || !token.trim()) return true;
  return token.trim().toUpperCase() === 'TOKEN';
};

export const BlockRenderer = ({ block, extras }: { block: CopilotBlockInstance; extras?: BlockExtras }) => {
  const blockType = text(block?.block_type, 'unknown-block');
  const key = normalize(blockType);
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
      <ErrorBoundary label={`copilot-block:${blockType}`}>
        {Comp ? (
          <Comp config={block.config ?? {}} extras={extras} />
        ) : (
          <Shell icon={Sparkles} title={blockType} tag="Unknown block">
            <div className="text-[11px] text-white/50">No renderer is registered for this block type.</div>
          </Shell>
        )}
      </ErrorBoundary>
    </motion.div>
  );
};

// ─── New free-floating renderer ─────────────────────────────────────────────

export const POSITION_OPTIONS: { value: BlockPosition; label: string }[] = [
  { value: 'top', label: 'Top of page' },
  { value: 'after_hero', label: 'After hero' },
  { value: 'after_tokenomics', label: 'After tokenomics' },
  { value: 'after_roadmap', label: 'After roadmap' },
  { value: 'after_socials', label: 'After socials' },
  { value: 'before_footer', label: 'Before footer' },
  { value: 'bottom', label: 'Bottom of page' },
];

const SIZE_OPTIONS: { value: BlockSize; label: string; px: string }[] = [
  { value: 'small',  label: 'Small',  px: '320px' },
  { value: 'medium', label: 'Medium', px: '480px' },
  { value: 'large',  label: 'Large',  px: '640px' },
  { value: 'full',   label: 'Full',   px: '100%'  },
];

const sizeToMaxWidth = (s: BlockSize): string =>
  s === 'small' ? '320px' : s === 'large' ? '640px' : s === 'full' ? '100%' : '480px';

const alignToMargin = (a: BlockAlignment): string =>
  a === 'left' ? 'mr-auto ml-0' : a === 'right' ? 'ml-auto mr-0' : 'mx-auto';

export const resolvePlacement = (block: CopilotBlockInstance): BlockPlacement => ({
  ...DEFAULT_PLACEMENT,
  ...(block.placement ?? {}),
});

interface RendererProps {
  blocks?: CopilotBlockInstance[];
  position: BlockPosition;
  /** Editor mode adds management controls, AI badges, empty state, etc. */
  editor?: boolean;
  /** Show an empty-state inviting Copilot. Only render at one position to avoid duplicates. */
  showEmptyState?: boolean;
  onDelete?: (id: string) => void;
  onMove?: (id: string, direction: 'up' | 'down') => void;
  onDuplicate?: (id: string) => void;
  onConfigChange?: (id: string, nextConfig: Record<string, any>) => void;
  onPlacementChange?: (id: string, patch: Partial<BlockPlacement>) => void;
  onOpenCopilot?: () => void;
  /** Published-site context: enables live Jupiter swap and theming. */
  contractAddress?: string;
  accentHex?: string;
  bgHex?: string;
}

export const CopilotBlocksRenderer = ({
  blocks,
  position,
  editor = false,
  showEmptyState = false,
  onDelete,
  onMove,
  onDuplicate,
  onConfigChange,
  onPlacementChange,
  onOpenCopilot,
  contractAddress,
  accentHex,
  bgHex,
}: RendererProps) => {
  const [editing, setEditing] = useState<CopilotBlockInstance | null>(null);
  const isMobile = useIsMobile();

  const list = blocks ?? [];
  // Filter by position. On the published site also drop stale blocks.
  const atHere = list.filter(b => resolvePlacement(b).position === position);
  const visibleBlocks = editor ? atHere : atHere.filter(b => !isBlockStale(b));

  // Nothing to render and no empty state requested → return null (no framing!).
  if (visibleBlocks.length === 0 && !showEmptyState) return null;

  return (
    <>
      <div className="px-4 sm:px-6 py-3 space-y-4">
        {visibleBlocks.length === 0 && editor && showEmptyState && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/30 p-8 text-center max-w-xl mx-auto">
            <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-sm font-semibold text-white">No utility blocks yet</div>
            <div className="text-xs text-white/50 mt-1 mb-4">
              Open Copilot to add a swap widget, holder gate, claim page and more — placed anywhere on the page.
            </div>
            {onOpenCopilot && (
              <Button
                size="sm"
                onClick={onOpenCopilot}
                className="h-8 px-4 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Open Copilot
              </Button>
            )}
          </div>
        )}

        {visibleBlocks.map((b, i) => {
          const stale = isBlockStale(b);
          const placement = resolvePlacement(b);
          // Mobile: force full width and center; ignore declared size/alignment.
          const effectiveSize: BlockSize = isMobile ? 'full' : placement.size;
          const effectiveAlign: BlockAlignment = isMobile ? 'center' : placement.alignment;
          const maxWidth = sizeToMaxWidth(effectiveSize);
          const alignClass = alignToMargin(effectiveAlign);
          return (
            <div
              key={b.id}
              className={cn('relative group w-full', alignClass)}
              style={{ maxWidth }}
            >
              {/* AI badge — editor only */}
              {editor && (
                <div className="absolute -top-2 -left-2 z-10 px-1.5 h-5 rounded-md bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 shadow-md ring-2 ring-background">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </div>
              )}

              {/* Stale warning */}
              {editor && stale && (
                <div className="mb-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>This block needs configuration — hidden on the published site.</span>
                </div>
              )}

              <BlockRenderer
                block={b}
                extras={{
                  live: !editor,
                  contractAddress,
                  accentHex,
                  bgHex,
                  size: effectiveSize,
                }}
              />

              {/* Placement controls — editor only, always visible at bottom */}
              {editor && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-black/60 border border-white/10 p-1.5">
                  <Select
                    value={placement.position}
                    onValueChange={(v) => onPlacementChange?.(b.id, { position: v as BlockPosition })}
                  >
                    <SelectTrigger className="h-7 w-[140px] text-[10px] bg-black/40 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITION_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={placement.size}
                    onValueChange={(v) => onPlacementChange?.(b.id, { size: v as BlockSize })}
                  >
                    <SelectTrigger className="h-7 w-[100px] text-[10px] bg-black/40 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value} className="text-xs">
                          {o.label} ({o.px})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {placement.size !== 'full' && (
                    <div className="flex items-center gap-0.5 rounded-md bg-black/40 border border-white/10 p-0.5">
                      {([
                        { v: 'left',   Icon: AlignLeft   },
                        { v: 'center', Icon: AlignCenter },
                        { v: 'right',  Icon: AlignRight  },
                      ] as const).map(({ v, Icon }) => (
                        <button
                          key={v}
                          type="button"
                          title={`Align ${v}`}
                          aria-label={`Align ${v}`}
                          onClick={() => onPlacementChange?.(b.id, { alignment: v as BlockAlignment })}
                          className={cn(
                            'w-6 h-6 rounded flex items-center justify-center transition-colors',
                            placement.alignment === v
                              ? 'bg-primary/20 text-primary'
                              : 'text-white/60 hover:text-white hover:bg-white/10'
                          )}
                        >
                          <Icon className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-0.5 ml-auto">
                    <ToolbarBtn
                      title="Move up (within this position)"
                      disabled={i === 0}
                      onClick={() => onMove?.(b.id, 'up')}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn
                      title="Move down"
                      disabled={i === visibleBlocks.length - 1}
                      onClick={() => onMove?.(b.id, 'down')}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Configure" onClick={() => setEditing(b)}>
                      <Settings className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn title="Duplicate" onClick={() => onDuplicate?.(b.id)}>
                      <Copy className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                    <ToolbarBtn
                      title="Delete"
                      destructive
                      onClick={() => { onDelete?.(b.id); toast.success('Block removed'); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </ToolbarBtn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Configure sheet */}
      {editor && (
        <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <SheetContent side="right" className="w-[360px] sm:max-w-[360px]">
            {editing && (
              <ConfigEditor
                block={editing}
                onChange={(cfg) => {
                  onConfigChange?.(editing.id, cfg);
                  setEditing(prev => prev ? { ...prev, config: cfg } : prev);
                }}
              />
            )}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

const ToolbarBtn = ({
  title, onClick, disabled, destructive, children,
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'w-6 h-6 rounded-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors',
      destructive && 'hover:text-destructive hover:bg-destructive/15',
      disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-white/70',
    )}
  >
    {children}
  </button>
);

// Per-block-type config field hints. Falls back to generic key inspection.
const CONFIG_FIELDS: Record<string, { key: string; label: string; placeholder?: string }[]> = {
  'swap-widget': [
    { key: 'token', label: 'Token symbol', placeholder: 'BONK' },
    { key: 'chain', label: 'Chain', placeholder: 'solana' },
  ],
  'lp-stats': [
    { key: 'token', label: 'Token symbol', placeholder: 'BONK' },
    { key: 'liquidity', label: 'Liquidity (display)', placeholder: '540k' },
  ],
  'trending-feed': [
    { key: 'chain', label: 'Chain', placeholder: 'solana' },
    { key: 'limit', label: 'Limit', placeholder: '5' },
  ],
  'holder-gate': [
    { key: 'token', label: 'Token symbol', placeholder: 'BONK' },
    { key: 'min_balance', label: 'Minimum balance', placeholder: '1,000' },
  ],
  'claim-page': [
    { key: 'token', label: 'Token symbol', placeholder: 'BONK' },
    { key: 'claim_type', label: 'Claim type', placeholder: 'airdrop' },
    { key: 'amount', label: 'Amount', placeholder: '1,500' },
  ],
  'holder-leaderboard': [
    { key: 'token', label: 'Token symbol', placeholder: 'BONK' },
    { key: 'limit', label: 'Limit', placeholder: '10' },
  ],
  'live-chart': [
    { key: 'token', label: 'Token symbol', placeholder: 'BONK' },
    { key: 'timeframe', label: 'Timeframe', placeholder: '24h' },
  ],
  'social-cta': [
    { key: 'platforms', label: 'Platforms (comma separated)', placeholder: 'Telegram, Discord' },
  ],
};

const ConfigEditor = ({
  block,
  onChange,
}: {
  block: CopilotBlockInstance;
  onChange: (cfg: Record<string, any>) => void;
}) => {
  const key = normalize(text(block.block_type, ''));
  const fields: { key: string; label: string; placeholder?: string }[] =
    CONFIG_FIELDS[key] ?? Object.keys(block.config ?? {}).map(k => ({ key: k, label: k }));
  const label = BLOCK_LABELS[key] ?? block.block_type;

  const update = (field: string, raw: string) => {
    const next = { ...(block.config ?? {}) };
    if (field === 'platforms') {
      next.platforms = raw.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      next[field] = raw;
    }
    onChange(next);
  };

  return (
    <div className="space-y-5">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          Configure {label}
        </SheetTitle>
        <SheetDescription>
          Changes apply live to the preview.
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-3">
        {fields.map(f => {
          const current = (block.config ?? {})[f.key];
          const value = Array.isArray(current) ? current.join(', ') : current ?? '';
          return (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-xs">{f.label}</Label>
              <Input
                value={String(value)}
                placeholder={f.placeholder}
                onChange={(e) => update(f.key, e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          );
        })}

        {fields.length === 0 && (
          <div className="text-xs text-muted-foreground">No configurable fields for this block.</div>
        )}
      </div>
    </div>
  );
};

export default CopilotBlocksSection;