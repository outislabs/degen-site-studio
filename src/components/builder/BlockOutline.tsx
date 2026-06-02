import { useState } from 'react';
import {
  Sparkles, ArrowUp, ArrowDown, Settings, Trash2, Copy,
  Link2, Link2Off, AlertTriangle, Coins, PieChart, Share2, Map, ImageIcon, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CoinData, CopilotBlockInstance, BlockLayout, BlockWidth, DEFAULT_LAYOUT,
  WIDTH_OPTIONS,
} from '@/types/coin';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type SectionType = 'hero' | 'tokenomics' | 'socials' | 'roadmap' | 'gallery';

export type OutlineBlock =
  | { kind: 'section'; type: SectionType; id: string; label: string; icon: any; layout: BlockLayout }
  | { kind: 'utility'; block: CopilotBlockInstance; label: string; layout: BlockLayout };

interface Props {
  data: CoinData;
  isNft: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConfigure: (id: string) => void;

  // Section ops
  onSectionLayoutChange: (type: SectionType, patch: Partial<BlockLayout>) => void;

  // Utility ops
  onMoveBlock: (id: string, dir: 'up' | 'down') => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onLayoutChange: (id: string, patch: Partial<BlockLayout>) => void;
  onGroupAbove: (id: string) => void;
  onBreakRow: (id: string) => void;
  onOpenCopilot?: () => void;
}

const SECTION_DEFS: { type: SectionType; label: string; icon: any; memeOnly?: boolean; nftOnly?: boolean }[] = [
  { type: 'hero',       label: 'Hero',        icon: Coins },
  { type: 'tokenomics', label: 'Tokenomics',  icon: PieChart, memeOnly: true },
  { type: 'gallery',    label: 'Gallery',     icon: ImageIcon, nftOnly: true },
  { type: 'socials',    label: 'Socials',     icon: Share2 },
  { type: 'roadmap',    label: 'Roadmap',     icon: Map },
];

export const BlockOutline = ({
  data, isNft, selectedId, onSelect, onConfigure,
  onSectionLayoutChange, onMoveBlock, onDuplicateBlock, onDeleteBlock,
  onLayoutChange, onGroupAbove, onBreakRow, onOpenCopilot,
}: Props) => {
  const sections = SECTION_DEFS.filter(s =>
    isNft ? !s.memeOnly : !s.nftOnly,
  );
  const utility = data.copilotBlocks ?? [];

  return (
    <div className="space-y-4">
      <div>
        <div className="px-1 mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Page · Home</h3>
        </div>
        <div className="space-y-2">
          {sections.map(({ type, label, icon: Icon }) => {
            const layout = (data.sectionLayouts?.[type as Exclude<SectionType, 'gallery'>] ?? DEFAULT_LAYOUT);
            const id = `section:${type}`;
            const selected = selectedId === id;
            return (
              <BlockCard
                key={id}
                id={id}
                label={label}
                icon={Icon}
                selected={selected}
                onSelect={() => onSelect(id)}
                badge="SECTION"
                layout={layout}
                onLayoutChange={(patch) => {
                  if (type === 'gallery') return; // gallery has no layout slot yet
                  onSectionLayoutChange(type, patch);
                }}
                onConfigure={() => onConfigure(id)}
                // Sections can't be moved/duplicated/deleted via the toolbar.
                disableMove
                disableDuplicate
                disableDelete
                disableGroup
                disableBreakRow
              />
            );
          })}
        </div>
      </div>

      <div>
        <div className="px-1 mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Utility blocks</h3>
          {onOpenCopilot && (
            <button
              type="button"
              onClick={onOpenCopilot}
              className="text-[10px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Add via Copilot
            </button>
          )}
        </div>
        {utility.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-[11px] text-muted-foreground">
            No utility blocks yet. Open Copilot to add a swap widget, holder gate, leaderboard, and more.
          </div>
        ) : (
          <div className="space-y-2">
            {utility.map((b, i) => {
              const layout = { ...DEFAULT_LAYOUT, ...(b.layout ?? {}) };
              const id = `utility:${b.id}`;
              const selected = selectedId === id;
              return (
                <BlockCard
                  key={id}
                  id={id}
                  label={b.block_type.replace(/[_-]/g, ' ')}
                  icon={Zap}
                  badge="AI"
                  selected={selected}
                  onSelect={() => onSelect(id)}
                  layout={layout}
                  onLayoutChange={(patch) => onLayoutChange(b.id, patch)}
                  onConfigure={() => onConfigure(id)}
                  onMoveUp={() => onMoveBlock(b.id, 'up')}
                  onMoveDown={() => onMoveBlock(b.id, 'down')}
                  onDuplicate={() => onDuplicateBlock(b.id)}
                  onDelete={() => {
                    if (confirm('Delete this block?')) {
                      onDeleteBlock(b.id);
                      toast.success('Block removed');
                    }
                  }}
                  onGroupAbove={() => onGroupAbove(b.id)}
                  onBreakRow={() => onBreakRow(b.id)}
                  grouped={!!layout.row}
                  isFirst={i === 0}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

interface BlockCardProps {
  id: string;
  label: string;
  icon: any;
  badge: string;
  selected: boolean;
  onSelect: () => void;
  layout: BlockLayout;
  onLayoutChange: (patch: Partial<BlockLayout>) => void;
  onConfigure: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onGroupAbove?: () => void;
  onBreakRow?: () => void;
  grouped?: boolean;
  isFirst?: boolean;
  disableMove?: boolean;
  disableDuplicate?: boolean;
  disableDelete?: boolean;
  disableGroup?: boolean;
  disableBreakRow?: boolean;
}

const BlockCard = ({
  label, icon: Icon, badge, selected, onSelect, layout, onLayoutChange,
  onConfigure, onMoveUp, onMoveDown, onDuplicate, onDelete,
  onGroupAbove, onBreakRow, grouped, isFirst,
  disableMove, disableDuplicate, disableDelete, disableGroup, disableBreakRow,
}: BlockCardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card transition-colors',
        selected ? 'border-primary/60 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]' : 'border-border hover:border-border/80',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold capitalize truncate">{label}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{badge}</div>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {layout.width}
        </span>
      </button>

      <div className="px-2 pb-2 flex flex-wrap items-center gap-1">
        <Select
          value={layout.width}
          onValueChange={(v) => onLayoutChange({ width: v as BlockWidth })}
        >
          <SelectTrigger className="h-7 w-[90px] text-[10px]" title="Block width (applies in a row)">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WIDTH_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!disableGroup && !disableBreakRow && (
          grouped ? (
            <ToolbarBtn title="Break row" onClick={onBreakRow}>
              <Link2Off className="w-3.5 h-3.5" />
            </ToolbarBtn>
          ) : (
            <ToolbarBtn
              title={isFirst ? 'No block above' : 'Group with block above'}
              disabled={isFirst}
              onClick={onGroupAbove}
            >
              <Link2 className="w-3.5 h-3.5" />
            </ToolbarBtn>
          )
        )}

        <div className="ml-auto flex items-center gap-0.5">
          <ToolbarBtn title="Configure" onClick={onConfigure}>
            <Settings className="w-3.5 h-3.5" />
          </ToolbarBtn>
          {!disableMove && (
            <>
              <ToolbarBtn title="Move up" onClick={onMoveUp}>
                <ArrowUp className="w-3.5 h-3.5" />
              </ToolbarBtn>
              <ToolbarBtn title="Move down" onClick={onMoveDown}>
                <ArrowDown className="w-3.5 h-3.5" />
              </ToolbarBtn>
            </>
          )}
          {!disableDuplicate && (
            <ToolbarBtn title="Duplicate" onClick={onDuplicate}>
              <Copy className="w-3.5 h-3.5" />
            </ToolbarBtn>
          )}
          {!disableDelete && (
            <ToolbarBtn title="Delete" destructive onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </ToolbarBtn>
          )}
        </div>
      </div>
    </div>
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
      'w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
      destructive && 'hover:text-destructive hover:bg-destructive/10',
      disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground',
    )}
  >
    {children}
  </button>
);

export default BlockOutline;