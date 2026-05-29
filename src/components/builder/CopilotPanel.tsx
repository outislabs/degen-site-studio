import { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Send, Paperclip, Check, Plus, Loader2, Zap, Users, BarChart3, Gift, TrendingUp, Trophy, LineChart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CoinData } from '@/types/coin';

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

interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposed_block?: ProposedBlock;
  plugin_suggestions?: PluginSuggestion[];
  inserted?: boolean;
  pending?: boolean;
}

const QUICK_ACTIONS: { label: string; icon: any; prompt: string }[] = [
  { label: 'Add swap widget', icon: Zap, prompt: 'Add a Jupiter swap widget to this page.' },
  { label: 'Add holder gate', icon: Users, prompt: 'Add a holder gate so only token holders can view content.' },
  { label: 'Add LP stats', icon: BarChart3, prompt: 'Add an LP stats card from DexScreener.' },
  { label: 'Add claim page', icon: Gift, prompt: 'Add a claim page for token rewards.' },
  { label: 'Add trending feed', icon: TrendingUp, prompt: 'Add a Birdeye trending feed.' },
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
};

interface Props {
  open: boolean;
  onClose: () => void;
  siteId: string | null;
  activePage: string;
  data: CoinData;
  onInsertBlock: (block: ProposedBlock) => void;
}

const storageKey = (siteId: string | null) =>
  `copilot-thread:${siteId ?? 'draft'}`;

const CopilotPanel = ({ open, onClose, siteId, activePage, data, onInsertBlock }: Props) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectedPlugins, setConnectedPlugins] = useState<string[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
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
      };
      const { data: res, error } = await supabase.functions.invoke('copilot-builder-chat', {
        body: {
          message: trimmed,
          context,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        },
      });
      if (error) throw error;
      const assistantMsg: CopilotMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res?.message ?? 'Done.',
        proposed_block: res?.proposed_block,
        plugin_suggestions: res?.plugin_suggestions,
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

  const handleInsert = (msgId: string, block: ProposedBlock) => {
    onInsertBlock(block);
    setMessages(prev => prev.map(m => (m.id === msgId ? { ...m, inserted: true } : m)));
    const label = BLOCK_META[block.block_type]?.label ?? block.block_type;
    toast.success(`${label} inserted`, { description: 'Added to your page with a sparkle.' });
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
                  Editing: {activePage}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close copilot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Thread */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map(m => (
              <MessageBubble key={m.id} message={m} onInsert={(b) => handleInsert(m.id, b)} />
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

const MessageBubble = ({
  message,
  onInsert,
}: {
  message: CopilotMessage;
  onInsert: (b: ProposedBlock) => void;
}) => {
  const isUser = message.role === 'user';
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

      {message.proposed_block && (
        <ProposedBlockCard
          block={message.proposed_block}
          inserted={!!message.inserted}
          onInsert={() => onInsert(message.proposed_block!)}
        />
      )}
    </div>
  );
};

const ProposedBlockCard = ({
  block,
  inserted,
  onInsert,
}: {
  block: ProposedBlock;
  inserted: boolean;
  onInsert: () => void;
}) => {
  const meta = BLOCK_META[block.block_type] ?? { label: block.block_type, icon: Sparkles };
  const Icon = meta.icon;
  return (
    <div className="w-full max-w-[88%] rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground">{meta.label}</div>
          {block.target_section && (
            <div className="text-[10px] text-muted-foreground">
              Into: {block.target_section}
            </div>
          )}
        </div>
      </div>

      {/* mini preview */}
      <div className="rounded-md border border-border bg-background/60 p-2.5 text-[10px] text-muted-foreground font-mono max-h-24 overflow-hidden">
        {Object.entries(block.config ?? {}).slice(0, 4).map(([k, v]) => (
          <div key={k} className="truncate">
            <span className="text-foreground/70">{k}:</span> {String(v)}
          </div>
        ))}
        {(!block.config || Object.keys(block.config).length === 0) && (
          <div className="opacity-60">No configuration required.</div>
        )}
      </div>

      <Button
        size="sm"
        onClick={onInsert}
        disabled={inserted}
        className={cn(
          'w-full h-8 text-xs font-semibold',
          inserted
            ? 'bg-muted text-muted-foreground hover:bg-muted'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
      >
        {inserted ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1" /> Inserted
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5 mr-1" /> Insert this block
          </>
        )}
      </Button>
    </div>
  );
};

export default CopilotPanel;