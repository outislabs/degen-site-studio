import {
  CoinData, CopilotBlockInstance, defaultCoinData, normalizeBlocks, normalizeBlock,
} from '@/types/coin';
import type { Block, Page, SiteDoc, SiteMeta, SiteTheme, SectionBlockType } from '@/types/site';

/**
 * Architecture-only adapter between the legacy flat CoinData persisted shape
 * and the unified SiteDoc/page/block schema. CoinData remains the working
 * in-memory view used by the existing layouts and step forms; SiteDoc is the
 * canonical shape we now persist to `sites.data`.
 *
 * Lazy migration: toSiteDoc accepts either shape and is idempotent.
 */

const SECTION_TYPES: ReadonlySet<string> = new Set([
  'hero', 'tokenomics', 'socials', 'roadmap',
]);

const newId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `b_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
};

function isSiteDoc(raw: any): raw is SiteDoc {
  return !!raw && typeof raw === 'object' && Array.isArray(raw.pages)
    && !!raw.theme && !!raw.meta;
}

function blocksFromCoinData(data: CoinData): Block[] {
  const sectionBlocks: Block[] = [
    {
      id: newId(),
      type: 'hero',
      config: {
        name: data.name,
        ticker: data.ticker,
        tagline: data.tagline,
        description: data.description,
        logoUrl: data.logoUrl,
        contractAddress: data.contractAddress,
      },
    },
    {
      id: newId(),
      type: 'tokenomics',
      config: {
        totalSupply: data.totalSupply,
        distribution: data.distribution,
        buyTax: data.buyTax,
        sellTax: data.sellTax,
        liquidityStatus: data.liquidityStatus,
      },
    },
    {
      id: newId(),
      type: 'socials',
      config: { ...data.socials },
    },
    {
      id: newId(),
      type: 'roadmap',
      config: { phases: data.roadmap ?? [] },
    },
  ];

  const utility: Block[] = (normalizeBlocks(data.copilotBlocks) ?? []).map(b => ({
    id: b.id,
    type: b.block_type,
    config: b.config ?? {},
    placement: b.placement,
    layout: b.layout,
    created_at: b.created_at,
  }));

  return [...sectionBlocks, ...utility];
}

/** Build a SiteDoc from any persisted shape. Idempotent. */
export function toSiteDoc(raw: any): SiteDoc {
  if (isSiteDoc(raw)) {
    // Already migrated. Defensive normalize on utility-block placements.
    return {
      ...raw,
      schema_version: 2,
      pages: (raw.pages ?? []).map((p: Page) => ({
        ...p,
        blocks: (p.blocks ?? []).map(b => {
          if (SECTION_TYPES.has(b.type)) return b;
          const normalized = normalizeBlock({
            id: b.id,
            block_type: b.type,
            config: b.config ?? {},
            placement: b.placement,
            layout: b.layout,
            created_at: b.created_at ?? Date.now(),
          } as any);
          return {
            id: normalized.id,
            type: normalized.block_type,
            config: normalized.config ?? {},
            placement: normalized.placement,
            layout: normalized.layout,
            created_at: normalized.created_at,
          };
        }),
      })),
    };
  }

  // Legacy CoinData shape (or partial). Merge defaults so missing fields don't
  // crash the builders.
  const data: CoinData = { ...defaultCoinData, ...(raw ?? {}) } as CoinData;

  const meta: SiteMeta = {
    siteType: data.siteType,
    name: data.name,
    ticker: data.ticker,
    tagline: data.tagline,
    description: data.description,
    logoUrl: data.logoUrl,
    blockchain: data.blockchain,
    contractAddress: data.contractAddress,
    customDomain: data.customDomain,
    mintLink: data.mintLink,
    mintPrice: data.mintPrice,
    nftTotalSupply: data.nftTotalSupply,
    mintStatus: data.mintStatus,
    mintDate: data.mintDate,
    isWhitelist: data.isWhitelist,
    galleryImages: data.galleryImages,
    team: data.team,
    faq: data.faq,
  };

  const theme: SiteTheme = {
    id: data.theme,
    overrides: data.themeOverrides,
    layout: data.layout,
    showCountdown: data.showCountdown,
    launchDate: data.launchDate ? new Date(data.launchDate as any).toISOString() : null,
  };

  return {
    schema_version: 2,
    pages: [{
      page_id: 'home',
      slug: '/',
      title: 'Home',
      blocks: blocksFromCoinData(data),
    }],
    theme,
    meta,
  };
}

/**
 * Back-compat view: project a SiteDoc back to the flat CoinData shape that the
 * existing 25 layouts and step forms consume. Used during the transition.
 */
export function fromSiteDoc(doc: SiteDoc): CoinData {
  const home = doc.pages[0];
  const find = (t: SectionBlockType) => home?.blocks.find(b => b.type === t)?.config ?? {};
  const hero = find('hero');
  const tk = find('tokenomics');
  const soc = find('socials');
  const rm = find('roadmap');

  const utility: CopilotBlockInstance[] = (home?.blocks ?? [])
    .filter(b => !SECTION_TYPES.has(b.type))
    .map(b => ({
      id: b.id,
      block_type: b.type,
      config: b.config ?? {},
      placement: b.placement,
      layout: b.layout,
      created_at: b.created_at ?? Date.now(),
    }));

  return {
    ...defaultCoinData,
    siteType: doc.meta.siteType,
    name: hero.name ?? doc.meta.name ?? '',
    ticker: hero.ticker ?? doc.meta.ticker ?? '',
    tagline: hero.tagline ?? doc.meta.tagline ?? '',
    description: hero.description ?? doc.meta.description ?? '',
    logoUrl: hero.logoUrl ?? doc.meta.logoUrl ?? '',
    blockchain: doc.meta.blockchain ?? 'solana',
    contractAddress: hero.contractAddress ?? doc.meta.contractAddress ?? '',

    totalSupply: tk.totalSupply ?? defaultCoinData.totalSupply,
    buyTax: tk.buyTax ?? 0,
    sellTax: tk.sellTax ?? 0,
    distribution: tk.distribution ?? defaultCoinData.distribution,
    liquidityStatus: tk.liquidityStatus ?? 'locked',

    mintLink: doc.meta.mintLink ?? '',
    mintPrice: doc.meta.mintPrice ?? '',
    nftTotalSupply: doc.meta.nftTotalSupply ?? '',
    mintStatus: doc.meta.mintStatus ?? 'upcoming',
    mintDate: doc.meta.mintDate ?? null,
    isWhitelist: !!doc.meta.isWhitelist,
    galleryImages: doc.meta.galleryImages ?? [],

    socials: { ...defaultCoinData.socials, ...soc },

    team: doc.meta.team ?? [],
    faq: doc.meta.faq ?? [],

    roadmap: Array.isArray(rm.phases) ? rm.phases : defaultCoinData.roadmap,

    theme: doc.theme.id,
    themeOverrides: doc.theme.overrides,
    layout: doc.theme.layout,
    showCountdown: !!doc.theme.showCountdown,
    launchDate: doc.theme.launchDate ? new Date(doc.theme.launchDate) : null,

    customDomain: doc.meta.customDomain,
    copilotBlocks: utility,
  };
}

/**
 * Take an edited CoinData snapshot and merge it back into the SiteDoc so the
 * canonical block list stays authoritative on save.
 *
 * Strategy: rebuild section block configs from the flat CoinData fields,
 * preserving the existing block ids (so future inline edits keep stable refs),
 * and re-derive the utility block list from data.copilotBlocks (the Copilot
 * action handlers already maintain it correctly).
 */
export function applyCoinDataToDoc(doc: SiteDoc, data: CoinData): SiteDoc {
  const home: Page = doc.pages[0] ?? { page_id: 'home', slug: '/', title: 'Home', blocks: [] };

  const existingId = (t: SectionBlockType) =>
    home.blocks.find(b => b.type === t)?.id ?? newId();

  const nextSections: Block[] = [
    {
      id: existingId('hero'),
      type: 'hero',
      config: {
        name: data.name,
        ticker: data.ticker,
        tagline: data.tagline,
        description: data.description,
        logoUrl: data.logoUrl,
        contractAddress: data.contractAddress,
      },
    },
    {
      id: existingId('tokenomics'),
      type: 'tokenomics',
      config: {
        totalSupply: data.totalSupply,
        distribution: data.distribution,
        buyTax: data.buyTax,
        sellTax: data.sellTax,
        liquidityStatus: data.liquidityStatus,
      },
    },
    {
      id: existingId('socials'),
      type: 'socials',
      config: { ...data.socials },
    },
    {
      id: existingId('roadmap'),
      type: 'roadmap',
      config: { phases: data.roadmap ?? [] },
    },
  ];

  const utility: Block[] = normalizeBlocks(data.copilotBlocks).map(b => ({
    id: b.id,
    type: b.block_type,
    config: b.config ?? {},
    placement: b.placement,
    layout: b.layout,
    created_at: b.created_at,
  }));

  const meta: SiteMeta = {
    ...doc.meta,
    siteType: data.siteType,
    name: data.name,
    ticker: data.ticker,
    tagline: data.tagline,
    description: data.description,
    logoUrl: data.logoUrl,
    blockchain: data.blockchain,
    contractAddress: data.contractAddress,
    customDomain: data.customDomain,
    mintLink: data.mintLink,
    mintPrice: data.mintPrice,
    nftTotalSupply: data.nftTotalSupply,
    mintStatus: data.mintStatus,
    mintDate: data.mintDate,
    isWhitelist: data.isWhitelist,
    galleryImages: data.galleryImages,
    team: data.team,
    faq: data.faq,
  };

  const theme: SiteTheme = {
    id: data.theme,
    overrides: data.themeOverrides,
    layout: data.layout,
    showCountdown: data.showCountdown,
    launchDate: data.launchDate ? new Date(data.launchDate as any).toISOString() : null,
  };

  return {
    schema_version: 2,
    pages: [{ ...home, blocks: [...nextSections, ...utility] }],
    theme,
    meta,
  };
}

/** Convenience: read a row's persisted data column and return CoinData. */
export function coinDataFromRaw(raw: any): CoinData {
  return fromSiteDoc(toSiteDoc(raw));
}

/** Convenience: produce the JSON-safe persistence payload from CoinData. */
export function persistedDataFromCoinData(data: CoinData, prior?: any): any {
  const baseDoc = prior ? toSiteDoc(prior) : toSiteDoc({});
  const next = applyCoinDataToDoc(baseDoc, data);
  return JSON.parse(JSON.stringify(next));
}