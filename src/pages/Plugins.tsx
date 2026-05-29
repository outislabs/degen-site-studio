import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Puzzle, Check, Loader2, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

type Plugin = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  logo_url: string | null;
  status: 'available' | 'coming_soon' | string;
  enables_blocks: string[];
  sort_order: number;
};

const CATEGORIES = ['All', 'Trading', 'Launchpads', 'Analytics', 'NFTs', 'Social', 'Infra'];

const BLOCK_LABELS: Record<string, string> = {
  'swap-widget': 'Swap Widget',
  'lp-stats': 'LP Stats',
  'trending-feed': 'Trending Feed',
  'holder-gate': 'Holder Gate',
  'claim-page': 'Claim Page',
  'holder-leaderboard': 'Holder Leaderboard',
  'live-chart': 'Live Chart',
  'social-cta': 'Social CTA',
};

const PluginsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmConnect, setConfirmConnect] = useState<Plugin | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState<Plugin | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: pluginRows }, { data: connRows }] = await Promise.all([
        supabase.from('plugins' as any).select('*').order('sort_order', { ascending: true }),
        supabase.from('user_plugin_connections' as any).select('plugin_slug').eq('user_id', user.id),
      ]);
      if (cancelled) return;
      setPlugins((pluginRows as any) ?? []);
      setConnected(new Set(((connRows as any) ?? []).map((r: any) => r.plugin_slug)));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, navigate]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return plugins.filter(p => {
      if (category !== 'All' && p.category !== category) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [plugins, search, category]);

  const handleConnect = async (plugin: Plugin) => {
    if (!user) return;
    setBusy(plugin.slug);
    const { error } = await supabase.from('user_plugin_connections' as any).insert({
      user_id: user.id,
      plugin_slug: plugin.slug,
      config: {},
    } as any);
    setBusy(null);
    setConfirmConnect(null);
    if (error) {
      toast.error(`Couldn't connect ${plugin.name}`, { description: error.message });
      return;
    }
    setConnected(prev => new Set(prev).add(plugin.slug));
    toast.success(`${plugin.name} connected — utilities unlocked.`);
  };

  const handleDisconnect = async (plugin: Plugin) => {
    if (!user) return;
    setBusy(plugin.slug);
    const { error } = await supabase
      .from('user_plugin_connections' as any)
      .delete()
      .eq('user_id', user.id)
      .eq('plugin_slug', plugin.slug);
    setBusy(null);
    setConfirmDisconnect(null);
    if (error) {
      toast.error(`Couldn't disconnect ${plugin.name}`, { description: error.message });
      return;
    }
    setConnected(prev => {
      const next = new Set(prev);
      next.delete(plugin.slug);
      return next;
    });
    toast.success(`${plugin.name} disconnected.`);
  };

  const hasNoConnections = !loading && connected.size === 0;
  const firstAvailable = plugins.find(p => p.status === 'available');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Puzzle className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Plugins</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Connect your favorite Solana apps to unlock more utilities in the builder.
          </p>
        </div>

        {hasNoConnections && firstAvailable && (
          <div className="mb-5 rounded-xl border border-border bg-muted/20 px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-muted-foreground">
              No plugins connected yet. Connect at least one to unlock builder utilities.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 shrink-0"
              onClick={() => setConfirmConnect(firstAvailable)}
            >
              Connect {firstAvailable.name}
            </Button>
          </div>
        )}

        {/* Search + categories */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search plugins…"
              className="pl-9 h-10 bg-muted/30 border-border"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors',
                  category === cat
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading plugins…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-sm text-muted-foreground">
            No plugins match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(plugin => {
              const isConnected = connected.has(plugin.slug);
              const comingSoon = plugin.status === 'coming_soon';
              return (
                <div
                  key={plugin.id}
                  className="rounded-2xl border border-border bg-card/40 hover:bg-card/60 hover:border-border transition-colors p-4 flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-muted/40 border border-border flex items-center justify-center overflow-hidden shrink-0">
                      {plugin.logo_url ? (
                        <img src={plugin.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base font-bold text-muted-foreground">
                          {plugin.name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {plugin.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 h-4 border-border/70 text-muted-foreground"
                        >
                          {plugin.category}
                        </Badge>
                      </div>
                      <StatusPill status={comingSoon ? 'coming_soon' : isConnected ? 'connected' : 'available'} />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                    {plugin.description}
                  </p>

                  {plugin.enables_blocks?.length > 0 && (
                    <p className="text-[10px] text-muted-foreground/70 mb-4">
                      Enables: {plugin.enables_blocks.map(b => BLOCK_LABELS[b] ?? b).join(', ')}
                    </p>
                  )}

                  <div className="mt-auto">
                    {comingSoon ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="w-full h-8 text-xs opacity-60"
                      >
                        <BellRing className="w-3.5 h-3.5 mr-1.5" /> Notify Me
                      </Button>
                    ) : isConnected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy === plugin.slug}
                        onClick={() => setConfirmDisconnect(plugin)}
                        className="w-full h-8 text-xs"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={busy === plugin.slug}
                        onClick={() => setConfirmConnect(plugin)}
                        className="w-full h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {busy === plugin.slug ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Connect'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connect modal */}
      <Dialog open={!!confirmConnect} onOpenChange={open => !open && setConfirmConnect(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Connect {confirmConnect?.name}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {confirmConnect?.description} This will unlock related utilities in the builder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setConfirmConnect(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => confirmConnect && handleConnect(confirmConnect)}
              disabled={!!busy}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect alert */}
      <AlertDialog open={!!confirmDisconnect} onOpenChange={open => !open && setConfirmDisconnect(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {confirmDisconnect?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Any utilities using this plugin will need to be reconfigured.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDisconnect && handleDisconnect(confirmDisconnect)}
              disabled={!!busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

const StatusPill = ({ status }: { status: 'connected' | 'available' | 'coming_soon' }) => {
  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary mt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Connected
      </span>
    );
  }
  if (status === 'coming_soon') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70 mt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> Coming Soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground mt-1">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" /> Available
    </span>
  );
};

export default PluginsPage;