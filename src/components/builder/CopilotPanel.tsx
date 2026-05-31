import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Sparkles, Send, Paperclip, Check, Plus, Loader2, Zap, Users, BarChart3, Gift, TrendingUp, Trophy, LineChart, MessageCircle, Wand2, Palette, Type, Layers, FileText, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CoinData } from '@/types/coin';

import type { BlockPlacement } from '@/types/coin';

export type PluginBlockType =
  | 'swap-widget'
  | 'lp-stats'
  | 'trending-feed'
  | 'holder-gate'
  | 'claim-page'
  | 'holder-leaderboard'
  | 'live-chart'
  | 'social-cta';

export interface ProposedBlock {
  block_type: PluginBlockType | string;
  config: Record<string, any>;
  target_section?: string;
}

export interface PluginSuggestion {
  id: string;
  name: string;
  description: string;
  block_type: PluginBlockType | string;
}

export type CopilotAction =
  | { type: 'insert_block'; block_type: string; config?: Record<string, any>; target_section?: string; position?: number; placement?: Partial<BlockPlacement>; requires_confirmation?: boolean }
  | { type: 'update_block'; block_id: string; patch?: Record<string, any>; config?: Record<string, any>; requires_confirmation?: boolean }
  | { type: 'delete_block'; block_id: string; requires_confirmation?: boolean }
  | { type: 'move_block'; block_id: string; target_section?: string; position?: number; requires_confirmation?: boolean }
  | { type: 'update_placement'; block_id: string; placement: Partial<BlockPlacement>; requires_confirmation?: boolean }
  | { type: 'update_section'; section_id: string; patch: Record<string, any>; requires_confirmation?: boolean }
  | { type: 'update_site'; patch: Record<string, any>; requires_confirmation?: boolean };

interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposed_block?: ProposedBlock;
  plugin_suggestions?: PluginSuggestion[];
  actions?: CopilotAction[];
  applied?: Record<number, 'applied' | 'skipped'>;
  mode?: 'bulk' | 'step';
}

const QUICK_ACTIONS: { label: string; icon: any; prompt: string }[] = [
  { label: 'Change hero text', icon: Type, prompt: 'Rewrite the hero title and subtitle to be punchier and degen-native.' },
  { label: 'Update theme colors', icon: Palette, prompt: 'Update the theme to a bolder color palette that fits this project.' },
  { label: 'Edit tokenomics', icon: BarChart3, prompt: 'Suggest improvements to the tokenomics copy and numbers.' },
  { label: 'Add a new section', icon: Layers, prompt: 'Add a new section to the site that highlights what makes this project different.' },
  { label: 'Polish copy', icon: FileText, prompt: 'Polish all copy across the site — punchier, on-brand, no filler.' },
  { label: 'Add swap widget', icon: Zap, prompt: 'Add a Jupiter swap widget to this page.' },
  { label: 'Add holder gate', icon: Users, prompt: 'Add a holder gate so only token holders can view content.' },
  { label: 'Add leaderboard', icon: Trophy, prompt: 'Add a holder leaderboard.' },
];

const BLOCK_META: Record<string, { label: string; icon: any }> = {
  'swap-widget': { label: 'Swap Widget (Jupiter)', icon: Zap },
  'lp-stats': { label: 'LP Stats Card', icon: BarChart3 },
  'trending-feed': { label: 'Trending Feed', icon: TrendingUp },
  'holder-gate': { label: 'Holder Gate', icon: Users },
  'claim-page': { label: 'Claim Page', icon: Gift },
  'holder-leaderboard': { label: 'Holder Leaderboard', icon: Trophy },
  'live-chart': { label: 'Live Chart', icon: LineChart },
  'social-cta': { label: 'Telegram / Discord CTA', icon: MessageCircle },
  'swap_widget': { label: 'Swap Widget (Jupiter)', icon: Zap },
  'lp_stats': { label: 'LP Stats Card', icon: BarChart3 },
  'trending_feed': { label: 'Trending Feed', icon: TrendingUp },
  'holder_gate': { label: 'Holder Gate', icon: Users },
  'claim_page': { label: 'Claim Page', icon: Gift },
  'holder_leaderboard': { label: 'Holder Leaderboard', icon: Trophy },
  'live_chart': { label: 'Live Chart', icon: LineChart },
  'social_cta': { label: 'Telegram / Discord CTA', icon: MessageCircle },
};

interface Props {
  open: boolean;
  onClose: () => void;
  siteId: string | null;
  activePage: string;
  data: CoinData;
  siteSchema: any;
  onExecuteAction: (action: CopilotAction) => void;
}

const storageKey = (siteId: string | null) =>
  `copilot-thread:${siteId ?? 'draft'}`;

const CopilotPanel = ({ open, onClose, siteId, activePage, data, siteSchema, onExecuteAction }: Props) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectedPlugins, setConnectedPlugins] = useState<string[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [scope, setScope] = useState<'page' | 'site'>('site');
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Restore thread per site
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(storageKey(siteId));
      if (raw) setMessages(JSON.parse(raw));
      else
        setMessages([
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content:
              "Hi! I'm your build copilot. I can drop plugin-powered utilities — swap widgets, holder gates, claim pages and more — straight into your site. What would you like to add?",
          },
        ]);
    } catch {
      /* noop */
    }
  }, [open, siteId]);

  useEffect(() => {
    if (messages.length) {
      try {
        localStorage.setItem(storageKey(siteId), JSON.stringify(messages));
      } catch { /* noop */ }
    }
  }, [messages, siteId]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // Load the user's connected plugins + their unlocked block types
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        if (!cancelled) {
          setConnectedPlugins([]);
          setAvailableBlocks([]);
        }
        return;
      }
      const { data: conns } = await supabase
        .from('user_plugin_connections' as any)
        .select('plugin_slug')
        .eq('user_id', uid);
      const slugs = ((conns as any) ?? []).map((r: any) => r.plugin_slug);
      if (cancelled) return;
      setConnectedPlugins(slugs);
      if (slugs.length === 0) {
        setAvailableBlocks([]);
        return;
      }
      const { data: plugs } = await supabase
        .from('plugins' as any)
        .select('enables_blocks,status')
        .in('slug', slugs)
        .eq('status', 'available');
      if (cancelled) return;
      const blocks = new Set<string>();
      ((plugs as any) ?? []).forEach((p: any) => {
        (p.enables_blocks ?? []).forEach((b: string) => blocks.add(b));
      });
      setAvailableBlocks(Array.from(blocks));
    })();
    return () => { cancelled = true; };
  }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: CopilotMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const context = {
        site_id: siteId,
        active_page: activePage,
        site_type: data.siteType,
        name: data.name,
        ticker: data.ticker,
        existing_socials: data.socials,
        connected_plugins: connectedPlugins,
        available_blocks: availableBlocks,
        scope,
        site_schema: siteSchema,
      };
      const { data: res, error } = await supabase.functions.invoke('copilot-builder-chat', {
        body: {
          message: trimmed,
          context,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        },
      });
      if (error) throw error;
      // Normalize: if no actions but a proposed_block, synthesize an insert_block action.
      let actions: CopilotAction[] = Array.isArray(res?.actions) ? res.actions : [];
      if (actions.length === 0 && res?.proposed_block) {
        actions = [{
          type: 'insert_block',
          block_type: res.proposed_block.block_type,
          config: res.proposed_block.config ?? {},
          target_section: res.proposed_block.target_section ?? 'utilities',
        }];
      }
      const assistantMsg: CopilotMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res?.message ?? 'Done.',
        plugin_suggestions: res?.plugin_suggestions,
        actions,
        applied: {},
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `I couldn't reach the copilot service. ${e?.message ?? ''}`.trim(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyAction = (msgId: string, idx: number, action: CopilotAction) => {
    try {
      onExecuteAction(action);
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, applied: { ...(m.applied ?? {}), [idx]: 'applied' } } : m
      ));
      toast.success(actionLabel(action));
    } catch (e: any) {
      toast.error(`Couldn't apply: ${e?.message ?? 'unknown error'}`);
    }
  };

  const skipAction = (msgId: string, idx: number) => {
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, applied: { ...(m.applied ?? {}), [idx]: 'skipped' } } : m
    ));
  };

  const setMessageMode = (msgId: string, mode: 'bulk' | 'step') => {
    setMessages(prev => prev.map(m => (m.id === msgId ? { ...m, mode } : m)));
  };

  const applyAll = (msg: CopilotMessage) => {
    (msg.actions ?? []).forEach((a, i) => {
      if (msg.applied?.[i]) return;
      if (a.requires_confirmation) return; // force step mode for these
      applyAction(msg.id, i, a);
    });
    // If any action requires confirmation, flip to step mode so user can address them
    if ((msg.actions ?? []).some(a => a.requires_confirmation)) {
      setMessageMode(msg.id, 'step');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          className="fixed top-14 right-0 bottom-0 z-40 w-full sm:w-[400px] border-l border-border bg-background/95 backdrop-blur-xl flex flex-col shadow-2xl shadow-black/40"
        >
          {/* Top bar */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">Copilot</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  Editing: {scope === 'site' ? 'entire site' : activePage}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 rounded-full bg-muted/40 p-0.5">
                {(['page', 'site'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setScope(s)}
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors capitalize',
                      scope === s
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-md hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thread */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map(m => (
              <MessageBubble
                key={m.id}
                message={m}
                onApplyAll={() => applyAll(m)}
                onStepMode={() => setMessageMode(m.id, 'step')}
                onApplyOne={(i, a) => applyAction(m.id, i, a)}
                onSkipOne={(i) => skipAction(m.id, i)}
              />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Thinking…
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="px-3 pt-2 pb-1 border-t border-border flex gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_ACTIONS.map(qa => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.label}
                  onClick={() => send(qa.prompt)}
                  disabled={loading}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors disabled:opacity-40"
                >
                  <Icon className="w-3 h-3" />
                  {qa.label}
                </button>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="relative flex items-end gap-2 rounded-xl border border-border bg-muted/30 p-2 focus-within:border-primary/50 transition-colors">
              <button
                className="w-8 h-8 rounded-md hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Attach"
                type="button"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Describe a utility to add to this page…"
                className="min-h-[40px] max-h-32 flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm p-1"
              />
              <Button
                size="icon"
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

const actionLabel = (a: CopilotAction): string => {
  switch (a.type) {
    case 'insert_block': {
      const meta = BLOCK_META[a.block_type]?.label ?? a.block_type;
      return `Add ${meta} to ${a.target_section ?? 'Utilities'}`;
    }
    case 'update_block': {
      const keys = Object.keys(a.patch ?? a.config ?? {});
      return `Update block (${keys.join(', ') || 'config'})`;
    }
    case 'delete_block': return `Remove block`;
    case 'move_block': return `Move block${a.target_section ? ` to ${a.target_section}` : ''}`;
    case 'update_section': {
      const keys = Object.keys(a.patch ?? {});
      return `Update ${a.section_id} (${keys.join(', ') || 'fields'})`;
    }
    case 'update_site': {
      const keys = Object.keys(a.patch ?? {});
      return `Update site ${keys.join(', ') || 'settings'}`;
    }
  }
};

const actionGlyph = (type: CopilotAction['type']) =>
  type === 'insert_block' ? '+' : type === 'delete_block' ? '✕' : type === 'move_block' ? '↕' : '✎';

const MessageBubble = ({
  message,
  onApplyAll,
  onStepMode,
  onApplyOne,
  onSkipOne,
}: {
  message: CopilotMessage;
  onApplyAll: () => void;
  onStepMode: () => void;
  onApplyOne: (idx: number, action: CopilotAction) => void;
  onSkipOne: (idx: number) => void;
}) => {
  const isUser = message.role === 'user';
  const hasActions = (message.actions?.length ?? 0) > 0;
  return (
    <div className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted/60 text-foreground rounded-bl-sm'
        )}
      >
        {message.content}
      </div>

      {message.plugin_suggestions && message.plugin_suggestions.length > 0 && (
        <div className="w-full max-w-[88%] space-y-1.5">
          {message.plugin_suggestions.map(ps => {
            const Icon = BLOCK_META[ps.block_type]?.icon ?? Sparkles;
            return (
              <div
                key={ps.id}
                className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-2.5"
              >
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground">{ps.name}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2">{ps.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasActions && (
        <ProposedChangesCard
          message={message}
          onApplyAll={onApplyAll}
          onStepMode={onStepMode}
          onApplyOne={onApplyOne}
          onSkipOne={onSkipOne}
        />
      )}
    </div>
  );
};

const ProposedChangesCard = ({
  message,
  onApplyAll,
  onStepMode,
  onApplyOne,
  onSkipOne,
}: {
  message: CopilotMessage;
  onApplyAll: () => void;
  onStepMode: () => void;
  onApplyOne: (idx: number, action: CopilotAction) => void;
  onSkipOne: (idx: number) => void;
}) => {
  const actions = message.actions ?? [];
  const applied = message.applied ?? {};
  const total = actions.length;
  const doneCount = Object.values(applied).filter(s => s === 'applied').length;
  const allHandled = actions.every((_, i) => !!applied[i]);
  const stepMode = message.mode === 'step' || actions.some(a => a.requires_confirmation);

  return (
    <div className="w-full max-w-[88%] rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
          <Wand2 className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="text-xs font-semibold text-foreground">
          {allHandled
            ? `${doneCount}/${total} change${total === 1 ? '' : 's'} applied`
            : `${total} change${total === 1 ? '' : 's'} proposed`}
        </div>
      </div>

      <div className="space-y-1.5">
        {actions.map((a, i) => {
          const state = applied[i];
          const needsConfirm = !!a.requires_confirmation;
          return (
            <div
              key={i}
              className={cn(
                'rounded-md border border-border bg-background/60 px-2.5 py-2',
                state === 'applied' && 'border-primary/40 bg-primary/5',
                state === 'skipped' && 'opacity-50',
              )}
            >
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm leading-tight w-3 shrink-0">
                  {actionGlyph(a.type)}
                </span>
                <div className="min-w-0 flex-1 text-[11px] text-foreground/90 leading-snug">
                  {actionLabel(a)}
                  {needsConfirm && !state && (
                    <span className="ml-1.5 text-[9px] uppercase tracking-wide font-semibold text-amber-500">
                      confirm
                    </span>
                  )}
                </div>
                {state === 'applied' && (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
              </div>
              {stepMode && !state && (
                <div className="flex gap-1.5 mt-2 pl-5">
                  <Button
                    size="sm"
                    onClick={() => onApplyOne(i, a)}
                    className="h-6 px-2 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSkipOne(i)}
                    className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    <SkipForward className="w-3 h-3 mr-1" /> Skip
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!allHandled && !stepMode && (
        <div className="flex gap-1.5">
          <Button
            size="sm"
            onClick={onApplyAll}
            className="flex-1 h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Apply all
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onStepMode}
            className="flex-1 h-8 text-xs font-semibold"
          >
            One by one
          </Button>
        </div>
      )}
    </div>
  );
};

export default CopilotPanel;