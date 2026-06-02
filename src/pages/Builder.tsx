import { useState, useEffect, useMemo, useRef } from 'react';
import {
  CoinData, CopilotBlockInstance, defaultCoinData, BlockPlacement, DEFAULT_PLACEMENT,
  BlockLayout, DEFAULT_LAYOUT, normalizeBlock,
} from '@/types/coin';
import { coinDataFromRaw, persistedDataFromCoinData } from '@/lib/siteSchema';
import StepTheme from '@/components/builder/StepTheme';
import LivePreview from '@/components/builder/LivePreview';
import PublishModal from '@/components/builder/PublishModal';
import { Button } from '@/components/ui/button';
import { ChevronRight, Rocket, Eye, Palette, PanelLeft, Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CopilotPanel, { CopilotAction } from '@/components/builder/CopilotPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { deepMerge } from '@/lib/deepMerge';
import { themes, resolvedColors } from '@/lib/themes';
import { BlockOutline } from '@/components/builder/BlockOutline';
import BlockConfigSheet from '@/components/builder/BlockConfigSheet';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const validateSlug = (s: string): string | null => {
  if (!s.trim()) return 'Site slug is required.';
  if (s.length < 3) return 'Slug must be at least 3 characters.';
  if (!/^[a-z0-9-]+$/.test(s)) return 'Only lowercase letters, numbers, and hyphens allowed.';
  if (s.startsWith('-') || s.endsWith('-')) return 'Slug cannot start or end with a hyphen.';
  return null;
};

const formatSlug = (v: string) =>
  v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const Builder = () => {
  const [data, setData] = useState<CoinData>({ ...defaultCoinData });
  const [showPublish, setShowPublish] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);
  const [domainPaymentStatus, setDomainPaymentStatus] = useState('unpaid');
  const [showCopilot, setShowCopilot] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('section:hero');
  const [configureId, setConfigureId] = useState<string | null>(null);
  const [showTheme, setShowTheme] = useState(false);
  // Snapshot of the raw `sites.data` payload (in new SiteDoc shape) so each
  // save preserves existing block ids instead of regenerating them.
  const rawSiteDocRef = useRef<any>(null);

  const isNft = data.siteType === 'nft';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && user) {
      setEditingId(id);
      setPublishedId(id);
      supabase.from('sites').select('*').eq('id', id).single().then(({ data: site }) => {
        if (site) {
          // Lazy-migrate legacy CoinData -> SiteDoc on read.
          const coinData = coinDataFromRaw(site.data);
          coinData.customDomain = (site as any).custom_domain || coinData.customDomain || '';
          rawSiteDocRef.current = site.data;
          setData(coinData);
          setSlug((site as any).slug || '');
          setDomainPaymentStatus((site as any).domain_payment_status || 'unpaid');
        }
      });
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const id = searchParams.get('id');
    if (payment === 'success' && id) {
      const checkPayment = async () => {
        const { data: site } = await supabase.from('sites').select('domain_payment_status').eq('id', id).single();
        if (site) {
          setDomainPaymentStatus((site as any).domain_payment_status || 'unpaid');
          if ((site as any).domain_payment_status === 'paid') {
            toast.success('Custom domain unlocked! 🎉');
          }
        }
      };
      checkPayment();
    }
  }, [searchParams]);

  const update = (partial: Partial<CoinData>) => setData(prev => ({ ...prev, ...partial }));

  const handlePublish = async () => {
    const slugErr = validateSlug(slug);
    if (slugErr) {
      setSlugError(slugErr);
      toast.error(slugErr);
      setConfigureId('section:hero');
      return;
    }
    if (!user) return;
    try {
      const slugValue = slug.trim() || null;
      const sitePayload = {
        name: data.name,
        ticker: data.ticker || '',
        slug: slugValue,
        custom_domain: data.customDomain || null,
        site_type: data.siteType || 'memecoin',
        // Persist in the unified SiteDoc shape. Preserve prior block ids.
        data: persistedDataFromCoinData(data, rawSiteDocRef.current),
      } as any;

      let siteId = editingId;

      if (editingId) {
        const { error } = await supabase.from('sites').update(sitePayload).eq('id', editingId);
        if (error) throw error;
        rawSiteDocRef.current = sitePayload.data;
        setPublishedId(editingId);
        toast.success('Site updated! 🚀');
      } else {
        const { data: inserted, error } = await supabase.from('sites').insert([{
          user_id: user.id,
          ...sitePayload,
        }]).select('id').single();
        if (error) throw error;
        siteId = inserted.id;
        rawSiteDocRef.current = sitePayload.data;
        setEditingId(siteId);
        setPublishedId(siteId);
        toast.success('Site published! 🚀');
      }

      // Upsert NFT collection data if NFT site type
      if (data.siteType === 'nft' && siteId) {
        const nftPayload = {
          site_id: siteId,
          user_id: user.id,
          mint_price: data.mintPrice ? parseFloat(data.mintPrice) : null,
          total_supply: data.nftTotalSupply ? parseInt(data.nftTotalSupply) : null,
          mint_status: data.mintStatus || 'upcoming',
          mint_date: data.mintDate || null,
          is_whitelist: data.isWhitelist || false,
          team: data.team || [],
          faq: data.faq || [],
          gallery_images: data.galleryImages || [],
          collection_address: data.contractAddress || null,
        };

        const { error: nftError } = await supabase.from('nft_collections' as any)
          .upsert(nftPayload as any, { onConflict: 'site_id' });
        if (nftError) console.error('NFT collection save error:', nftError);
      }

      setShowPublish(true);
    } catch (error: any) {
      const msg = error?.message?.toLowerCase() || '';
      const supportLink = 'https://x.com/degentoolshq';
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('already exists') || msg.includes('slug')) {
        toast.error('This URL is already in use, try a different one', {
          description: 'Change your site slug and try again.',
          action: { label: 'Contact support', onClick: () => window.open(supportLink, '_blank') },
        });
      } else if (msg.includes('permission') || msg.includes('rls') || msg.includes('policy') || msg.includes('row-level')) {
        toast.error('Something went wrong saving your site. Please try again or contact support', {
          action: { label: 'Contact support', onClick: () => window.open(supportLink, '_blank') },
        });
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch') || error?.name === 'TypeError') {
        toast.error('Connection issue. Check your internet and try again', {
          action: { label: 'Contact support', onClick: () => window.open(supportLink, '_blank') },
        });
      } else {
        toast.error(error.message || 'Failed to save site', {
          action: { label: 'Contact support', onClick: () => window.open(supportLink, '_blank') },
        });
      }
    }
  };

  const activePage = 'Home page';

  // Snapshot of the editable site structure passed to the Copilot edge function
  // so the AI can reference real section/block IDs in its actions.
  const siteSchema = useMemo(() => ({
    site_id: editingId,
    site_type: data.siteType,
    name: data.name,
    ticker: data.ticker,
    theme: {
      theme_id: data.theme,
      layout: data.layout,
      resolved_colors: resolvedColors(data.theme, data.themeOverrides),
      overrides: data.themeOverrides ?? {},
    },
    socials: data.socials,
    pages: [{
      page_id: 'home',
      title: 'Home',
      sections: [
        {
          section_id: 'hero',
          type: 'hero',
          title: data.name,
          subtitle: data.tagline,
          description: data.description,
        },
        {
          section_id: 'blocks',
          type: 'free_floating_blocks',
          blocks: (data.copilotBlocks ?? []).map(b => ({
            block_id: b.id,
            block_type: b.block_type,
            config: b.config,
            placement: { ...DEFAULT_PLACEMENT, ...(b.placement ?? {}) },
          })),
        },
      ],
    }],
  }), [editingId, data]);

  // Executes a structured action from the Copilot against the live site state.
  const handleExecuteAction = (action: CopilotAction) => {
    setData(prev => {
      let next: CoinData = prev;
      switch (action.type) {
        case 'insert_block': {
          // Tolerate placement supplied either at the action top level or
          // (legacy AI shape) inside config.placement. normalizeBlock collapses
          // both into the canonical top-level placement.
          const rawCfg = { ...((action as any).config ?? {}) };
          const instance = normalizeBlock({
            id: crypto.randomUUID(),
            block_type: action.block_type,
            config: rawCfg,
            created_at: Date.now(),
            placement: (action as any).placement,
          });
          const blocks = [...(prev.copilotBlocks ?? [])];
          const pos = typeof action.position === 'number'
            ? Math.max(0, Math.min(action.position, blocks.length))
            : blocks.length;
          blocks.splice(pos, 0, instance);
          next = { ...prev, copilotBlocks: blocks };
          break;
        }
        case 'update_block': {
          const patch = action.patch ?? action.config ?? {};
          next = {
            ...prev,
            copilotBlocks: (prev.copilotBlocks ?? []).map(b =>
              b.id === action.block_id
                ? { ...b, config: { ...(b.config ?? {}), ...patch } }
                : b,
            ),
          };
          break;
        }
        case 'delete_block': {
          next = {
            ...prev,
            copilotBlocks: (prev.copilotBlocks ?? []).filter(b => b.id !== action.block_id),
          };
          break;
        }
        case 'move_block': {
          const blocks = [...(prev.copilotBlocks ?? [])];
          const idx = blocks.findIndex(b => b.id === action.block_id);
          if (idx < 0) break;
          const [moved] = blocks.splice(idx, 1);
          const pos = typeof action.position === 'number'
            ? Math.max(0, Math.min(action.position, blocks.length))
            : blocks.length;
          blocks.splice(pos, 0, moved);
          next = { ...prev, copilotBlocks: blocks };
          break;
        }
        case 'update_placement': {
          const partial = (action as any).placement ?? {};
          next = {
            ...prev,
            copilotBlocks: (prev.copilotBlocks ?? []).map(b =>
              b.id === (action as any).block_id
                ? normalizeBlock({ ...b, placement: { ...DEFAULT_PLACEMENT, ...(b.placement ?? {}), ...partial } })
                : b,
            ),
          };
          break;
        }
        case 'update_section': {
          const patch = action.patch ?? {};
          if (action.section_id === 'hero') {
            // Map hero patch fields, deep-merging anything else into the site.
            const { title, subtitle, description, ...rest } = patch;
            next = deepMerge(prev, {
              ...(title != null ? { name: String(title) } : {}),
              ...(subtitle != null ? { tagline: String(subtitle) } : {}),
              ...(description != null ? { description: String(description) } : {}),
              ...rest,
            } as Partial<CoinData>);
          } else {
            // Generic deep-merge fallback for any other section patch.
            next = deepMerge(prev, patch as Partial<CoinData>);
          }
          break;
        }
        case 'update_site': {
          const patch = { ...(action.patch ?? {}) };
          // Only accept known theme ids — unknown values would crash the renderer.
          if (patch.theme != null && !(patch.theme in themes)) {
            // The Copilot may send theme as an object { theme_id, overrides }.
            // Translate it into the flat CoinData fields used in state.
            if (typeof patch.theme === 'object') {
              const t: any = patch.theme;
              const nextOverrides = t.overrides
                ? deepMerge(prev.themeOverrides ?? {}, t.overrides)
                : prev.themeOverrides;
              const flat: Partial<CoinData> = {};
              if (typeof t.theme_id === 'string' && t.theme_id in themes) {
                flat.theme = t.theme_id;
              }
              if (typeof t.layout === 'string') flat.layout = t.layout;
              if (nextOverrides) flat.themeOverrides = nextOverrides as any;
              delete patch.theme;
              Object.assign(patch, flat);
            } else {
              console.warn('Copilot tried to set unknown theme:', patch.theme);
              delete patch.theme;
            }
          }
          // Deep-merge themeOverrides instead of replacing wholesale so the AI
          // can tweak a single field without wiping the rest.
          if (patch.themeOverrides) {
            patch.themeOverrides = deepMerge(prev.themeOverrides ?? {}, patch.themeOverrides);
          }
          // Deep-merge the entire patch so nested objects (theme settings,
          // socials, distribution, etc.) don't wipe sibling fields.
          next = deepMerge(prev, patch as Partial<CoinData>);
          break;
        }
      }
      if (next !== prev) persistData(next);
      return next;
    });
  };

  // Persist the current data.copilotBlocks (and related fields) to the DB,
  // but only when the site already exists.
  const persistData = (next: CoinData) => {
    if (!editingId) return;
    const payload = persistedDataFromCoinData(next, rawSiteDocRef.current);
    rawSiteDocRef.current = payload;
    (async () => {
      const { error } = await supabase
        .from('sites')
        .update({ data: payload } as any)
        .eq('id', editingId);
      if (error) console.error('Failed to persist site data:', error);
    })();
  };

  const updateBlocks = (mutator: (blocks: CopilotBlockInstance[]) => CopilotBlockInstance[]) => {
    setData(prev => {
      const next = { ...prev, copilotBlocks: mutator(prev.copilotBlocks ?? []) };
      persistData(next);
      return next;
    });
  };

  const handleDeleteBlock = (id: string) =>
    updateBlocks(blocks => blocks.filter(b => b.id !== id));

  const handleMoveBlock = (id: string, dir: 'up' | 'down') =>
    updateBlocks(blocks => {
      const idx = blocks.findIndex(b => b.id === id);
      if (idx < 0) return blocks;
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= blocks.length) return blocks;
      const next = blocks.slice();
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });

  const handleDuplicateBlock = (id: string) =>
    updateBlocks(blocks => {
      const idx = blocks.findIndex(b => b.id === id);
      if (idx < 0) return blocks;
      const orig = blocks[idx];
      const copy: CopilotBlockInstance = {
        ...orig,
        id: crypto.randomUUID(),
        config: { ...(orig.config ?? {}) },
        created_at: Date.now(),
      };
      const next = blocks.slice();
      next.splice(idx + 1, 0, copy);
      toast.success('Block duplicated');
      return next;
    });

  const handleConfigBlockChange = (id: string, cfg: Record<string, any>) =>
    updateBlocks(blocks => blocks.map(b => (b.id === id ? { ...b, config: cfg } : b)));

  const handlePlacementChange = (id: string, patch: Partial<BlockPlacement>) =>
    updateBlocks(blocks => blocks.map(b =>
      b.id === id
        ? { ...b, placement: { ...DEFAULT_PLACEMENT, ...(b.placement ?? {}), ...patch } }
        : b,
    ));

  const handleLayoutChange = (id: string, patch: Partial<BlockLayout>) =>
    updateBlocks(blocks => blocks.map(b =>
      b.id === id
        ? { ...b, layout: { ...DEFAULT_LAYOUT, ...(b.layout ?? {}), ...patch } }
        : b,
    ));

  const handleGroupAbove = (id: string) =>
    updateBlocks(blocks => {
      const idx = blocks.findIndex(b => b.id === id);
      if (idx <= 0) return blocks;
      const above = blocks[idx - 1];
      const aboveLayout = { ...DEFAULT_LAYOUT, ...(above.layout ?? {}) };
      const rowId = aboveLayout.row ?? `row_${crypto.randomUUID().slice(0, 8)}`;
      // Highest order currently in the row, so the new block lands at the end.
      const orders = blocks
        .filter(b => (b.layout?.row ?? null) === rowId)
        .map(b => b.layout?.order ?? 0);
      const baseOrder = orders.length ? Math.max(...orders) : 0;
      return blocks.map((b, i) => {
        if (i === idx - 1 && !aboveLayout.row) {
          return { ...b, layout: { ...aboveLayout, row: rowId, order: baseOrder } };
        }
        if (b.id === id) {
          return {
            ...b,
            layout: {
              ...DEFAULT_LAYOUT,
              ...(b.layout ?? {}),
              row: rowId,
              order: baseOrder + 1,
            },
          };
        }
        return b;
      });
    });

  const handleBreakRow = (id: string) =>
    updateBlocks(blocks => {
      const target = blocks.find(b => b.id === id);
      const rowId = target?.layout?.row;
      if (!rowId) return blocks;
      // Drop row+order on this block. If the row now has <2 members, drop it
      // from the remaining sole member too so it returns to solo rendering.
      const remaining = blocks.filter(b => b.id !== id && b.layout?.row === rowId);
      const collapseSole = remaining.length === 1;
      return blocks.map(b => {
        if (b.id === id) {
          const { row, order, ...rest } = (b.layout ?? {}) as BlockLayout;
          return { ...b, layout: { ...DEFAULT_LAYOUT, ...rest } };
        }
        if (collapseSole && b.id === remaining[0].id) {
          const { row, order, ...rest } = (b.layout ?? {}) as BlockLayout;
          return { ...b, layout: { ...DEFAULT_LAYOUT, ...rest } };
        }
        return b;
      });
    });

  // Section layout — persisted via SiteDoc round-trip.
  const handleSectionLayoutChange = (
    type: 'hero' | 'tokenomics' | 'socials' | 'roadmap' | 'gallery',
    patch: Partial<BlockLayout>,
  ) => {
    if (type === 'gallery') return; // not part of unified block schema yet
    setData(prev => {
      const current = prev.sectionLayouts?.[type] ?? DEFAULT_LAYOUT;
      const nextLayout: BlockLayout = { ...DEFAULT_LAYOUT, ...current, ...patch };
      const next: CoinData = {
        ...prev,
        sectionLayouts: {
          ...(prev.sectionLayouts ?? {}),
          [type]: nextLayout,
        },
      };
      persistData(next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Logo + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/')} className="flex-shrink-0 group">
              <img src={logo} alt="Degen Tools" className="h-7 w-auto transition-transform group-hover:scale-105" />
            </button>
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
              <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-1.5 min-w-0">
                {data.logoUrl ? (
                  <img src={data.logoUrl} alt="" className="w-4 h-4 rounded-full flex-shrink-0 ring-1 ring-border" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-primary" />
                  </div>
                )}
                <span className="text-xs font-medium text-foreground/80 truncate max-w-[140px]">
                  {data.name || 'Untitled Site'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: title */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <span>Editing</span>
            <span className="text-foreground font-medium">Home page</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTheme(true)}
              className="text-xs h-8 px-3 text-muted-foreground hover:text-foreground"
            >
              <Palette className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Theme</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-xs h-8 px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <PanelLeft className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
              <span className="hidden sm:inline">{showPreview ? 'Editor' : 'Preview'}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCopilot(v => !v)}
              className={cn(
                'text-xs h-8 px-3 transition-colors',
                showCopilot
                  ? 'bg-primary/15 text-primary hover:bg-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Copilot</span>
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8 px-5 font-semibold rounded-lg shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_28px_hsl(var(--primary)/0.35)] transition-shadow"
            >
              <Rocket className="w-3.5 h-3.5 mr-1.5" />
              {editingId ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <div
        className={cn(
          'flex flex-1 overflow-hidden transition-[margin] duration-300',
          showCopilot && 'lg:mr-[400px]'
        )}
      >
        {/* ── LEFT PANEL: BLOCK OUTLINE ── */}
        <div
          className={cn(
            'w-full lg:w-[360px] xl:w-[400px] border-r border-border overflow-y-auto flex flex-col pb-20 lg:pb-0',
            showPreview && 'hidden lg:flex'
          )}
          style={{ height: 'calc(100vh - 56px)' }}
        >
          <div className="flex-1 px-4 py-4 overflow-y-auto">
            <BlockOutline
              data={data}
              isNft={isNft}
              selectedId={selectedBlockId}
              onSelect={setSelectedBlockId}
              onConfigure={(id) => { setSelectedBlockId(id); setConfigureId(id); }}
              onSectionLayoutChange={handleSectionLayoutChange}
              onMoveBlock={handleMoveBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onDeleteBlock={handleDeleteBlock}
              onLayoutChange={handleLayoutChange}
              onGroupAbove={handleGroupAbove}
              onBreakRow={handleBreakRow}
              onOpenCopilot={() => setShowCopilot(true)}
            />
          </div>
        </div>

        {/* ── RIGHT PANEL: PREVIEW ── */}
        <div
          className={cn(
            'flex-1 overflow-y-auto bg-muted/20',
            !showPreview && 'hidden lg:block'
          )}
          style={{ height: 'calc(100vh - 56px)' }}
        >
          <div className="p-3 sm:p-5">
            {/* Preview chrome */}
            <div className="rounded-xl overflow-hidden border border-border shadow-2xl shadow-black/20">
              {/* Browser bar */}
              <div className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-2.5 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-muted/60 rounded-md px-4 py-1 text-[10px] text-muted-foreground font-mono max-w-[280px] truncate">
                    {slug ? `degentools.com/s/${slug}` : 'degentools.com/s/your-site'}
                  </div>
                </div>
                <div className="w-[54px]" /> {/* spacer to center URL */}
              </div>

              {/* Actual preview */}
              <ErrorBoundary
                label="builder-canvas"
                fallback={
                  <div className="p-8 text-center text-sm text-white/60">
                    The preview hit an error and was prevented from crashing the editor. Try undoing your last change or reloading.
                  </div>
                }
              >
                <LivePreview
                  data={data}
                  editor
                  onDeleteBlock={handleDeleteBlock}
                  onMoveBlock={handleMoveBlock}
                  onDuplicateBlock={handleDuplicateBlock}
                  onConfigBlockChange={handleConfigBlockChange}
                  onPlacementChange={handlePlacementChange}
                  onLayoutChange={handleLayoutChange}
                  onGroupAbove={handleGroupAbove}
                  onBreakRow={handleBreakRow}
                  onOpenCopilot={() => setShowCopilot(true)}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
      <PublishModal open={showPublish} onClose={() => setShowPublish(false)} data={data} siteId={publishedId} slug={slug} />
      <BlockConfigSheet
        open={!!configureId && configureId.startsWith('section:')}
        onClose={() => setConfigureId(null)}
        selectedId={configureId}
        data={data}
        onChange={update}
        slug={slug}
        onSlugChange={(v) => { setSlug(formatSlug(v)); setSlugError(null); }}
        siteId={editingId}
        domainPaymentStatus={domainPaymentStatus}
        onPaymentStatusChange={setDomainPaymentStatus}
        slugError={slugError}
      />
      <Sheet open={showTheme} onOpenChange={(o) => !o && setShowTheme(false)}>
        <SheetContent side="right" className="w-full sm:max-w-[440px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Theme & layout</SheetTitle>
            <SheetDescription>Site-wide visual settings.</SheetDescription>
          </SheetHeader>
          <StepTheme data={data} onChange={update} />
        </SheetContent>
      </Sheet>
      <CopilotPanel
        open={showCopilot}
        onClose={() => setShowCopilot(false)}
        siteId={editingId}
        activePage={activePage}
        data={data}
        siteSchema={siteSchema}
        onExecuteAction={handleExecuteAction}
      />
    </div>
  );
};

export default Builder;
