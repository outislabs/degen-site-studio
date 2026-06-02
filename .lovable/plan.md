# Unified Block System Refactor — Plan

This is an architecture-only change. Same UI, same behavior, same edit forms. Before I touch code I want to align on scope, because a naive read of the brief would have me rewrite ~30 files (every layout + every step form + the entire Builder + SiteView) and that's almost guaranteed to ship regressions on the ALONA acceptance test.

## Recommended approach: thin adapter, not a full rewrite

Instead of literally rebuilding `ClassicLayout`, `BentoLayout`, `NftDarkLayout`, …, 25 layouts as a `<BlockRenderer>` switch, introduce the new `pages[]` schema as **the canonical persisted shape**, but keep the existing layout components as the rendering implementation for `hero/tokenomics/socials/roadmap` for now. The "one renderer to rule them all" lands incrementally — utility blocks already flow through `CopilotBlocks`; section blocks initially delegate to the existing shared section components (`ContractBlock`, `TokenomicsBlock`, `RoadmapBlock`, `SocialsBlock` from `layouts/shared.tsx`).

Why: the brief explicitly says "No visual or functional changes", "Same UI, same behavior, same edit forms", and "No layout engine … Those come next." Rewriting 25 layouts to consume `blocks[]` is a layout-engine change and will break visual parity. Keeping layouts as-is but feeding them from the new schema satisfies the data-model unification without the regression risk.

If you actually want every layout torn out and replaced by a single `BlockRenderer` switch right now (losing the 25 bespoke hero treatments), tell me and I'll re-plan — but that contradicts "no visual changes".

## Schema

`src/types/site.ts` (new):

```ts
export interface Block { id: string; type: BlockType; config: Record<string, any>; placement?: BlockPlacement; }
export interface Page { page_id: string; slug: string; title: string; blocks: Block[]; }
export interface SiteDoc {
  pages: Page[];
  theme: { id: ThemeId; overrides?: ThemeOverrides; layout: LayoutStyle; showCountdown: boolean; launchDate: string | null; };
  meta: { siteType: SiteType; name: string; ticker: string; tagline: string; description: string; logoUrl: string; blockchain: string; contractAddress: string; customDomain?: string; /* NFT meta too */ };
}
```

Block types accepted now: `hero | tokenomics | socials | roadmap | swap_widget | lp_stats | trending_feed | holder_gate | claim_page | holder_leaderboard | live_chart | social_cta`.

## Lazy migration

`src/lib/siteSchema.ts` (new):

- `toSiteDoc(raw: any): SiteDoc` — accepts either the legacy `CoinData` shape **or** an already-migrated `SiteDoc`. If legacy, synthesizes a single `home` page with hero/tokenomics/socials/roadmap blocks built from the corresponding fields, then appends normalized `copilotBlocks` as their own blocks. Idempotent.
- `fromSiteDoc(doc: SiteDoc): CoinData` — back-compat view used by layouts/forms during the transition so I don't have to touch every consumer. Reads block configs back into the flat `CoinData` shape they expect.
- `applyBlockEdit(doc, blockId, patch)` — used by edit forms to write back into the canonical block.

Builder load path: `raw → toSiteDoc → setDoc(doc)`. UI continues to read a derived `CoinData` via `fromSiteDoc(doc)` for the existing forms and layouts. Save path: persist `doc` as-is. On every save the row in `sites.data` is upgraded.

## File changes

- **Add** `src/types/site.ts`, `src/lib/siteSchema.ts`.
- **Edit** `src/pages/Builder.tsx`: hold `doc: SiteDoc` as source of truth; derive `coinData = fromSiteDoc(doc)` for existing children; route edits through `applyBlockEdit`; persist `doc`. `copilotBlocks` operations (insert/update_placement/move/delete) become operations on `doc.pages[0].blocks` filtered by non-section types.
- **Edit** `src/pages/SiteView.tsx`: load row → `toSiteDoc` → `fromSiteDoc` → pass `data` to `LivePreview` (unchanged signature). Utility blocks list passed through unchanged.
- **Edit** `src/components/builder/LivePreview.tsx`: no functional change. It already takes `CoinData`; we'll just keep that interface. Utility-block bands continue to come from `data.copilotBlocks` which `fromSiteDoc` populates.
- **Add** `src/components/builder/BlockRenderer.tsx`: minimal switch used **only** for utility blocks today (delegates to the existing `CopilotBlocks` renderer internally). Section types (`hero/tokenomics/socials/roadmap`) intentionally throw "rendered by layout"  — they're owned by the chosen layout component. This is the seam the next prompt (layout engine) will widen.
- **Do not touch**: any of the 25 `layouts/*.tsx`, any step form (`StepCoinBasics`, `StepTokenomics`, etc.), `CopilotPanel`, `CopilotBlocks`, edge functions, DB.

## Persistence shape in `sites.data` after this lands

```json
{
  "pages": [{ "page_id": "home", "slug": "/", "title": "Home",
    "blocks": [
      { "id": "...", "type": "hero", "config": { "name": "ALONA", "ticker": "ALONA", "tagline": "...", "logoUrl": "...", "contractAddress": "..." } },
      { "id": "...", "type": "tokenomics", "config": { "totalSupply": "1B", "distribution": {...}, "buyTax": 0, "sellTax": 0, "liquidityStatus": "locked" } },
      { "id": "...", "type": "socials", "config": { "telegram": "...", "twitter": "...", ... } },
      { "id": "...", "type": "roadmap", "config": { "phases": [...] } },
      { "id": "0c160c5e-...", "type": "swap_widget", "config": { "chain": "solana", "token": "ALONA" }, "placement": { "position": "top", "size": "small", "alignment": "center" } }
    ]
  }],
  "theme": { "id": "degen-dark", "layout": "classic", "showCountdown": false, "launchDate": null },
  "meta": { "siteType": "memecoin", "name": "ALONA", "ticker": "ALONA", "contractAddress": "...", "customDomain": "alona.degentools.co" }
}
```

The legacy top-level `data.basics`, `data.tokenomics`, `data.socials`, `data.roadmap`, `data.copilotBlocks`, `data.theme`, etc. are no longer written. (Note: today the codebase doesn't have `data.basics` — the fields are flat on `CoinData`. Migration handles both.)

## Acceptance

1. `alona.degentools.co` renders pixel-identical to before.
2. Builder edits (hero text, tokenomics %, add roadmap phase, change theme/layout) save and reload correctly.
3. Copilot can still insert/move/resize utility blocks; placement persists.
4. After one save of ALONA, `select data from sites where slug='alona'` shows the new `pages/theme/meta` structure with `data.basics` etc. absent.
5. No new console errors on the published site.

## Out of scope (explicit)

- Rewriting layouts to be `BlockRenderer`-driven (next prompt: layout engine).
- New block types, drag-and-drop, multi-page UI, copilot prompt changes.
- Bulk DB migration — strictly lazy on save.

## Confirm before I build

1. OK with the **thin adapter** approach (keep 25 layouts intact, schema flips underneath) vs. a full BlockRenderer rewrite of every layout?
2. OK that `theme` and `meta` sit alongside `pages[]` (not inside the blocks list), as your schema shows?
3. Anything in legacy `CoinData` you want explicitly dropped during migration, or preserve everything?
