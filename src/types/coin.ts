import type { ThemeOverrides } from '@/lib/themes';

export type SiteType = 'memecoin' | 'nft';

export interface TeamMember {
  name: string;
  role: string;
  pfpUrl: string;
  twitter: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CopilotBlockInstance {
  id: string;
  block_type: string;
  config: Record<string, any>;
  target_section?: string;
  created_at: number;
  /** Per-block placement on the page. Free-floating, no group framing. */
  placement?: BlockPlacement;
  /** Layout primitive: width + row grouping for side-by-side composition. */
  layout?: BlockLayout;
}

export type BlockPosition =
  | 'top'
  | 'after_hero'
  | 'after_tokenomics'
  | 'after_roadmap'
  | 'after_socials'
  | 'before_footer'
  | 'bottom';

export type BlockSize = 'small' | 'medium' | 'large' | 'full';
export type BlockAlignment = 'left' | 'center' | 'right';

export interface BlockPlacement {
  position: BlockPosition;
  size: BlockSize;
  alignment: BlockAlignment;
}

export const DEFAULT_PLACEMENT: BlockPlacement = {
  position: 'before_footer',
  size: 'medium',
  alignment: 'center',
};

// ─── Layout primitive (Phase 2) ─────────────────────────────────────────────

export type BlockWidth =
  | 'full'
  | 'half'
  | 'third'
  | 'two-thirds'
  | 'quarter'
  | 'three-quarters';

export interface BlockLayout {
  width: BlockWidth;
  /** Blocks sharing the same row id render side-by-side in a 12-col grid. */
  row?: string;
  /** Position within a row. */
  order?: number;
}

export const DEFAULT_LAYOUT: BlockLayout = { width: 'full' };

/**
 * Map a width keyword to the desktop (>=md) Tailwind col-span class.
 * Strings are explicit so the JIT picks them up.
 */
export const widthToColSpan = (w: BlockWidth): string => {
  switch (w) {
    case 'half':            return 'md:col-span-6';
    case 'third':           return 'md:col-span-4';
    case 'two-thirds':      return 'md:col-span-8';
    case 'quarter':         return 'md:col-span-3';
    case 'three-quarters':  return 'md:col-span-9';
    case 'full':
    default:                return 'md:col-span-12';
  }
};

export const WIDTH_OPTIONS: { value: BlockWidth; label: string }[] = [
  { value: 'full',            label: 'Full'           },
  { value: 'three-quarters',  label: '3/4'            },
  { value: 'two-thirds',      label: '2/3'            },
  { value: 'half',            label: '1/2'            },
  { value: 'third',           label: '1/3'            },
  { value: 'quarter',         label: '1/4'            },
];

/**
 * Canonicalize a copilot block: `placement` lives at the top level, never
 * nested inside `config`. `target_section` is the old API and is dropped.
 * Tolerates legacy/AI shapes that wrote `config.placement` instead.
 */
export function normalizeBlock(raw: any): CopilotBlockInstance {
  if (!raw || typeof raw !== 'object') return raw;
  const cfg = { ...(raw.config ?? {}) };
  const nestedPlacement = (cfg as any).placement;
  delete (cfg as any).placement;
  const nestedLayout = (cfg as any).layout;
  delete (cfg as any).layout;
  const merged: BlockPlacement = {
    ...DEFAULT_PLACEMENT,
    ...(nestedPlacement && typeof nestedPlacement === 'object' ? nestedPlacement : {}),
    ...(raw.placement && typeof raw.placement === 'object' ? raw.placement : {}),
  };
  const mergedLayout: BlockLayout = {
    ...DEFAULT_LAYOUT,
    ...(nestedLayout && typeof nestedLayout === 'object' ? nestedLayout : {}),
    ...(raw.layout && typeof raw.layout === 'object' ? raw.layout : {}),
  };
  const { target_section, ...rest } = raw;
  return {
    ...rest,
    config: cfg,
    placement: merged,
    layout: mergedLayout,
  } as CopilotBlockInstance;
}

export function normalizeBlocks(list: any): CopilotBlockInstance[] {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeBlock);
}

export interface CoinData {
  // Site type
  siteType: SiteType;

  // Step 1
  name: string;
  ticker: string;
  tagline: string;
  description: string;
  logoUrl: string;
  blockchain: string;
  contractAddress: string;
  
  // Step 2 — Memecoin tokenomics
  totalSupply: string;
  buyTax: number;
  sellTax: number;
  distribution: {
    lp: number;
    team: number;
    marketing: number;
    burn: number;
  };
  liquidityStatus: 'locked' | 'burned';

  // Step 2 — NFT fields
  mintLink: string;
  mintPrice: string;
  nftTotalSupply: string;
  mintStatus: 'upcoming' | 'live' | 'sold_out';
  mintDate: string | null;
  isWhitelist: boolean;
  galleryImages: string[];

  // Step 3
  socials: {
    telegram: string;
    twitter: string;
    discord: string;
    dex: string;
    magicEden: string;
    launchnft: string;
  };

  // NFT extras
  team: TeamMember[];
  faq: FaqItem[];
  
  // Step 4
  roadmap: RoadmapPhase[];
  
  // Step 5
  theme: ThemeId;
  /** Optional per-field overrides applied on top of the preset theme. */
  themeOverrides?: ThemeOverrides;
  layout: LayoutStyle;
  showCountdown: boolean;
  launchDate: Date | null;

  // Optional
  customDomain?: string;

  // Copilot-inserted utility blocks (rendered at the bottom of the site preview)
  copilotBlocks?: CopilotBlockInstance[];

  // Where the UTILITIES section should render on the published site.
  utilitiesPosition?: 'top' | 'after-hero' | 'before-footer' | 'bottom';
}

export type ThemeId = 'degen-dark' | 'pepe-classic' | 'moon-cult' | 'cyber-punk' | 'golden-ape' | 'arctic-whale' | 'solana-sun' | 'bitcoin-og' | 'fire-sale' | 'matrix' | 'stealth-ops' | 'crude-energy' | 'neon-romance' | 'lavender-pop' | 'sky-toon' | 'sponge-pop' | 'ocean-bolt' | 'rose-garden' | 'midnight-chrome' | 'cartoon-sky';

export type LayoutStyle = 'classic' | 'split-hero' | 'bento' | 'minimal' | 'mascot-hero' | 'cinematic' | 'cartoon' | 'cartoon-sky' | 'comic-hero' | 'terminal' | 'neon-cyberpunk' | 'luxury' | 'retro-8bit' | 'newspaper' | 'minimalist' | 'nft-dark' | 'nft-gallery' | 'nft-comic' | 'nft-retro-pop' | 'nft-minimal-gallery' | 'nft-streetwear' | 'nft-gallery-wall' | 'nft-anime' | 'nft-blueprint' | 'nft-luxury';

export interface RoadmapPhase {
  id: string;
  title: string;
  items: string[];
}

export const defaultCoinData: CoinData = {
  siteType: 'memecoin',
  name: '',
  ticker: '',
  tagline: '',
  description: '',
  logoUrl: '',
  blockchain: 'solana',
  contractAddress: '',
  totalSupply: '1,000,000,000',
  buyTax: 0,
  sellTax: 0,
  distribution: { lp: 50, team: 10, marketing: 15, burn: 25 },
  liquidityStatus: 'locked',
  mintLink: '',
  mintPrice: '',
  nftTotalSupply: '',
  mintStatus: 'upcoming',
  mintDate: null,
  isWhitelist: false,
  galleryImages: [],
  socials: { telegram: '', twitter: '', discord: '', dex: '', magicEden: '', launchnft: '' },
  team: [],
  faq: [],
  roadmap: [
    { id: '1', title: 'Phase 1: Launch', items: ['Token launch', 'Community building', 'Initial marketing push'] },
    { id: '2', title: 'Phase 2: Growth', items: ['CEX listings', 'Partnerships', 'Utility development'] },
    { id: '3', title: 'Phase 3: Moon', items: ['Major exchange listing', 'Global marketing', 'Ecosystem expansion'] },
  ],
  theme: 'degen-dark',
  layout: 'classic',
  showCountdown: false,
  launchDate: null,
  copilotBlocks: [],
  utilitiesPosition: 'bottom',
};
