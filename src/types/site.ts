import type { ThemeOverrides } from '@/lib/themes';
import type {
  CoinData, ThemeId, LayoutStyle, SiteType, BlockPlacement,
  RoadmapPhase, TeamMember, FaqItem, BlockLayout,
} from './coin';

/**
 * Unified block schema. Sections (hero/tokenomics/socials/roadmap) and utility
 * blocks (swap_widget, lp_stats, ...) all live in one ordered list per page.
 *
 * Persisted shape lives in `sites.data`. Reading is lazy-migrated from the old
 * flat CoinData via siteSchema.toSiteDoc.
 */

export type SectionBlockType =
  | 'hero'
  | 'tokenomics'
  | 'socials'
  | 'roadmap';

export type UtilityBlockType =
  | 'swap_widget'
  | 'lp_stats'
  | 'trending_feed'
  | 'holder_gate'
  | 'claim_page'
  | 'holder_leaderboard'
  | 'live_chart'
  | 'social_cta';

export type BlockType = SectionBlockType | UtilityBlockType | string;

export interface Block {
  id: string;
  type: BlockType;
  config: Record<string, any>;
  /** Free-floating placement (utility blocks only for now). */
  placement?: BlockPlacement;
  /** Layout primitive (width + row grouping). Phase 2. */
  layout?: BlockLayout;
  created_at?: number;
}

export interface Page {
  page_id: string;
  slug: string;
  title: string;
  blocks: Block[];
}

export interface SiteTheme {
  id: ThemeId;
  overrides?: ThemeOverrides;
  layout: LayoutStyle;
  showCountdown: boolean;
  launchDate: string | null;
}

export interface SiteMeta {
  siteType: SiteType;
  name: string;
  ticker: string;
  tagline: string;
  description: string;
  logoUrl: string;
  blockchain: string;
  contractAddress: string;
  customDomain?: string;

  // NFT-only meta (kept here so it persists alongside the page blocks; the
  // gallery/team/faq lists are still also surfaced through fromSiteDoc).
  mintLink?: string;
  mintPrice?: string;
  nftTotalSupply?: string;
  mintStatus?: 'upcoming' | 'live' | 'sold_out';
  mintDate?: string | null;
  isWhitelist?: boolean;
  galleryImages?: string[];
  team?: TeamMember[];
  faq?: FaqItem[];
}

export interface SiteDoc {
  schema_version: 2;
  pages: Page[];
  theme: SiteTheme;
  meta: SiteMeta;
}

/** Re-export for callers that already type against CoinData. */
export type { CoinData, RoadmapPhase };