import { CoinData, ThemeId, BlockPlacement, BlockPosition, BlockLayout } from '@/types/coin';
import { cn } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';
import { themes, resolveTheme } from '@/lib/themes';
import ClassicLayout from './layouts/ClassicLayout';
import SplitHeroLayout from './layouts/SplitHeroLayout';
import BentoLayout from './layouts/BentoLayout';
import MinimalLayout from './layouts/MinimalLayout';
import MascotHeroLayout from './layouts/MascotHeroLayout';
import CinematicLayout from './layouts/CinematicLayout';
import CartoonLayout from './layouts/CartoonLayout';
import CartoonSkyLayout from './layouts/CartoonSkyLayout';
import ComicHeroLayout from './layouts/ComicHeroLayout';
import TerminalLayout from './layouts/TerminalLayout';
import NeonCyberpunkLayout from './layouts/NeonCyberpunkLayout';
import LuxuryLayout from './layouts/LuxuryLayout';
import Retro8BitLayout from './layouts/Retro8BitLayout';
import NewspaperLayout from './layouts/NewspaperLayout';
import MinimalistLayout from './layouts/MinimalistLayout';
import NftDarkLayout from './layouts/NftDarkLayout';
import NftGalleryLayout from './layouts/NftGalleryLayout';
import NftComicLayout from './layouts/NftComicLayout';
import NftRetroPopLayout from './layouts/NftRetroPopLayout';
import NftMinimalGalleryLayout from './layouts/NftMinimalGalleryLayout';
import NftStreetwearLayout from './layouts/NftStreetwearLayout';
import NftGalleryWallLayout from './layouts/NftGalleryWallLayout';
import NftAnimeLayout from './layouts/NftAnimeLayout';
import NftBlueprintLayout from './layouts/NftBlueprintLayout';
import NftLuxuryEditorialLayout from './layouts/NftLuxuryEditorialLayout';
import { CopilotBlocksRenderer } from './blocks/CopilotBlocks';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface Props {
  data: CoinData;
  showWatermark?: boolean;
  siteId?: string;
  editor?: boolean;
  onDeleteBlock?: (id: string) => void;
  onMoveBlock?: (id: string, dir: 'up' | 'down') => void;
  onDuplicateBlock?: (id: string) => void;
  onConfigBlockChange?: (id: string, cfg: Record<string, any>) => void;
  onPlacementChange?: (id: string, patch: Partial<BlockPlacement>) => void;
  onLayoutChange?: (id: string, patch: Partial<BlockLayout>) => void;
  onGroupAbove?: (id: string) => void;
  onBreakRow?: (id: string) => void;
  onOpenCopilot?: () => void;
}

// Deep-merged or AI-generated site data may contain an unknown theme id.
// Falling back to the default theme prevents `style.bgGradient` crashes.
const FALLBACK_THEME: ThemeId = 'degen-dark';

const LivePreview = ({
  data, showWatermark = false, siteId, editor = false,
  onDeleteBlock, onMoveBlock, onDuplicateBlock, onConfigBlockChange,
  onPlacementChange, onLayoutChange, onGroupAbove, onBreakRow, onOpenCopilot,
}: Props) => {
  const style = resolveTheme(data.theme ?? FALLBACK_THEME, data.themeOverrides);
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!data.showCountdown || !data.launchDate) return;
    const timer = setInterval(() => {
      const diff = new Date(data.launchDate!).getTime() - Date.now();
      if (diff <= 0) { setCountdown({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [data.showCountdown, data.launchDate]);

  const layout = data.layout || 'classic';
  const layoutProps = { data, style, countdown, showWatermark };

  const pageTitle = useMemo(() => {
    if (!data.name) return '';
    return `${data.name}${data.ticker ? ` ($${data.ticker})` : ''}`;
  }, [data.name, data.ticker]);

  // Render the same blocks list at every position — the renderer filters by
  // placement.position. No group framing, no "Utilities" header anywhere.
  const blocks = data.copilotBlocks ?? [];
  const bandAt = (pos: BlockPosition, showEmpty = false) => (
    <ErrorBoundary label={`copilot-blocks:${pos}`}>
      <CopilotBlocksRenderer
        blocks={blocks}
        position={pos}
        editor={editor}
        showEmptyState={showEmpty}
        onDelete={onDeleteBlock}
        onMove={onMoveBlock}
        onDuplicate={onDuplicateBlock}
        onConfigChange={onConfigBlockChange}
        onPlacementChange={onPlacementChange}
        onLayoutChange={onLayoutChange}
        onGroupAbove={onGroupAbove}
        onBreakRow={onBreakRow}
        onOpenCopilot={onOpenCopilot}
        contractAddress={data.contractAddress}
        accentHex={style?.accentHex}
        bgHex={style?.bg?.match(/#([0-9a-f]{3,8})/i)?.[0]}
      />
    </ErrorBoundary>
  );

  // Show empty-state once, at before_footer, when in editor mode with no blocks.
  const noBlocks = blocks.length === 0;

  return (
    <div className={cn('min-h-full rounded-xl overflow-hidden text-white relative')} style={{ background: style?.bgGradient ?? '#050a05' }}>
      {pageTitle && (
        <h1 className="sr-only">{pageTitle}</h1>
      )}
      {bandAt('top')}
      {layout === 'classic' && <ClassicLayout {...layoutProps} />}
      {layout === 'split-hero' && <SplitHeroLayout {...layoutProps} />}
      {layout === 'bento' && <BentoLayout {...layoutProps} />}
      {layout === 'minimal' && <MinimalLayout {...layoutProps} />}
      {layout === 'mascot-hero' && <MascotHeroLayout {...layoutProps} />}
      {layout === 'cinematic' && <CinematicLayout {...layoutProps} />}
      {layout === 'cartoon' && <CartoonLayout {...layoutProps} />}
      {layout === 'cartoon-sky' && <CartoonSkyLayout {...layoutProps} />}
      {layout === 'comic-hero' && <ComicHeroLayout {...layoutProps} />}
      {layout === 'terminal' && <TerminalLayout {...layoutProps} />}
      {layout === 'neon-cyberpunk' && <NeonCyberpunkLayout {...layoutProps} />}
      {layout === 'luxury' && <LuxuryLayout {...layoutProps} />}
      {layout === 'retro-8bit' && <Retro8BitLayout {...layoutProps} />}
      {layout === 'newspaper' && <NewspaperLayout {...layoutProps} />}
      {layout === 'minimalist' && <MinimalistLayout {...layoutProps} />}
      {layout === 'nft-dark' && <NftDarkLayout {...layoutProps} />}
      {layout === 'nft-gallery' && <NftGalleryLayout {...layoutProps} />}
      {layout === 'nft-comic' && <NftComicLayout {...layoutProps} />}
      {layout === 'nft-retro-pop' && <NftRetroPopLayout {...layoutProps} />}
      {layout === 'nft-minimal-gallery' && <NftMinimalGalleryLayout {...layoutProps} />}
      {layout === 'nft-streetwear' && <NftStreetwearLayout {...layoutProps} />}
      {layout === 'nft-gallery-wall' && <NftGalleryWallLayout {...layoutProps} />}
      {layout === 'nft-anime' && <NftAnimeLayout {...layoutProps} />}
      {layout === 'nft-blueprint' && <NftBlueprintLayout {...layoutProps} />}
      {layout === 'nft-luxury' && <NftLuxuryEditorialLayout {...layoutProps} />}
      {bandAt('after_hero')}
      {bandAt('after_tokenomics')}
      {bandAt('after_roadmap')}
      {bandAt('after_socials')}
      {bandAt('before_footer', editor && noBlocks)}
      {bandAt('bottom')}
    </div>
  );
};

export default LivePreview;
