# Phase 2.5: Unified Block Canvas

Replace the tab-based section editor with a single canvas where every block in `pages[0].blocks` — hero, tokenomics, socials, roadmap, and copilot/utility blocks — shows the same toolbar (width, row group, move, configure, duplicate, delete).

## The core tension

The existing 25 layouts (`ClassicLayout`, `BentoLayout`, …) render hero+tokenomics+socials+roadmap as one cohesive composition tied to a theme. Pulling those sections out into a flat vertical stack rendered by `BlockRenderer` would **break every existing site visually**, contradicting the explicit "don't break existing sites" requirement.

Resolution: **keep layouts intact for rendering**, but layer the per-block toolbar UI as overlays anchored to each section, plus stack utility blocks below. Width/row controls work as designed for utility blocks; for section blocks they apply only when the user explicitly opts in (defaults preserve current visuals).

## What changes

### 1. Builder shell — collapse the step tabs
- `src/pages/Builder.tsx`: remove the Basics/Tokenomics/Socials/Roadmap/Gallery step tabs. Keep **Theme** as a separate side panel (site-wide, per spec).
- Single canvas view shows `LivePreview` in `editor` mode, full height.
- The sidebar becomes: "Pages" (just Home for now) → block outline list with the same toolbar actions; clicking a block scrolls + opens its Configure panel.

### 2. Per-block toolbar on EVERY block
- New component `src/components/builder/BlockToolbar.tsx`: width picker, group-with-above, break-row, move up/down, configure, duplicate, delete (with confirm for destructive section deletes — hero/tokenomics warn "this will remove the section from your site").
- In `LivePreview` (editor mode), wrap each rendered section (hero/tokenomics/socials/roadmap) with an absolutely-positioned toolbar overlay anchored to a data-section marker the layouts emit. The layouts already render these sections in order; we add `data-block-id` wrappers via a thin `SectionFrame` component the layouts opt into.
  - Pragmatic shortcut: instead of touching all 25 layouts, render an editor-only **overlay rail** down the left edge of the preview with one toolbar entry per section block, aligned by IntersectionObserver to the visible section. This avoids modifying any layout file.
- Utility blocks keep their existing inline toolbar from `CopilotBlocks`.

### 3. Configure panel
- New `src/components/builder/BlockConfigPanel.tsx`: a right-side `Sheet` that opens with the form for the selected block type.
  - `hero` → reuse fields from `StepCoinBasics`
  - `tokenomics` → reuse `StepTokenomics`
  - `socials` → reuse `StepSocials`
  - `roadmap` → reuse `StepRoadmap`
  - `gallery` (NFT) → reuse `StepNftGallery`
  - utility blocks → existing forms in `CopilotBlocks`
- Forms keep operating on `CoinData` via the same `update(partial)` callback (no form rewrites).

### 4. Width persistence for section blocks
- `applyCoinDataToDoc` in `src/lib/siteSchema.ts`: preserve the `layout` field on section blocks when re-projecting from `CoinData` (currently dropped because section blocks are rebuilt from scratch).
- New `handleSectionLayoutChange(blockType, patch)` in `Builder.tsx` mutates the `rawSiteDocRef` block directly, then persists. Width on section blocks is stored in `SiteDoc` only — it doesn't round-trip through `CoinData`.
- Renderer reads section widths from the doc and wraps the layout output in a 12-col grid container when any section has a non-full width. Default (no `layout` field) → unchanged full-width rendering, preserving every existing site.

### 5. Grouping section blocks side-by-side
- When two adjacent section blocks share a `row` id, render them inside a `grid grid-cols-1 md:grid-cols-12` wrapper, each section getting its `widthToColSpan` class. The current layout's hero/tokenomics/etc components render inside their assigned cell.
- This is the one place existing layouts visibly change — but only when the user opts in.

### 6. Theme tab kept
- Theme settings live in a dedicated `Theme` button in the top bar that opens `StepTheme` in a Sheet. Not a block.

## Files touched

- `src/pages/Builder.tsx` — remove step tabs, add unified canvas + outline sidebar + configure sheet + theme sheet, wire section layout edits.
- `src/lib/siteSchema.ts` — preserve `layout` on section blocks across the CoinData↔SiteDoc round trip.
- `src/components/builder/LivePreview.tsx` — accept section-block layout map, wrap rendered layout sections when widths/rows are set, render editor-only toolbar overlay rail.
- `src/components/builder/BlockToolbar.tsx` — new shared toolbar.
- `src/components/builder/BlockConfigPanel.tsx` — new right sheet hosting the existing step forms.
- `src/components/builder/blocks/CopilotBlocks.tsx` — swap inline toolbar for the shared `BlockToolbar`.
- `src/types/site.ts` / `src/types/coin.ts` — no schema changes; `layout` already on `Block`.

## Not touched
- The 25 layout components
- Step form internals (Basics/Tokenomics/Socials/Roadmap/Theme/Gallery) — only relocated
- `CopilotPanel`, edge functions, DB schema
- Copilot action handlers

## Test plan (matches spec)
1. ALONA builder loads with no Basics/Tokenomics/Socials/Roadmap tabs; canvas shows the full site preview with a left rail of block toolbars.
2. Each section block + each utility block exposes the full toolbar.
3. Setting hero width to two-thirds saves; reload shows hero in two-thirds column; DB row's `pages[0].blocks[hero].layout.width = "two-thirds"`.
4. Configure on tokenomics opens the existing tokenomics form in a sheet; edits persist.
5. Grouping hero + socials with the row controls renders them side-by-side desktop / stacked mobile.
6. Sites with no `layout` fields render byte-identical to today.

## Out of scope (call out)
- Rewriting any layout to be `BlockRenderer`-driven
- Adding new block types
- Drag-and-drop
- Multi-page editing
- Removing the layout selector (still under Theme)
