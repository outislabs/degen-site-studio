import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Pencil, Plus, Sparkles, Globe, Palette, BarChart3, Zap, Crown, Rocket, ChartLine, X, Coins } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { themes } from '@/lib/themes';
import { ThemeId } from '@/types/coin';
import { Badge } from '@/components/ui/badge';
import { PlanId, PlanConfig, PLANS } from '@/lib/plans';
import SiteAnalyticsPanel from '@/components/analytics/SiteAnalyticsPanel';
interface SavedSite {
  id: string;
  name: string;
  ticker: string;
  slug?: string | null;
  data: Record<string, any>;
  created_at: string;
}

interface Props {
  sites: SavedSite[];
  onDelete: (id: string) => void;
  onNewSite: () => void;
  planId: PlanId;
  plan: PlanConfig;
  hasWallet?: boolean;
}

const DashboardView = ({ sites, onDelete, onNewSite, planId, plan, hasWallet }: Props) => {
  const navigate = useNavigate();
  const [analyticsSiteId, setAnalyticsSiteId] = useState<string | null>(null);
  const [analyticsSiteName, setAnalyticsSiteName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<SavedSite | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [tokenBannerDismissed, setTokenBannerDismissed] = useState(false);

  // If analytics panel is open, show it instead
  if (analyticsSiteId) {
    return (
      <SiteAnalyticsPanel
        siteId={analyticsSiteId}
        siteName={analyticsSiteName}
        onClose={() => setAnalyticsSiteId(null)}
      />
    );
  }

  const getThemeColor = (data: Record<string, any>): string => {
    const themeId = data?.theme as ThemeId;
    return themes[themeId]?.accentHex || '#22c55e';
  };

  const siteLimit = plan.maxSites === -1 ? '∞' : plan.maxSites;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {plan.name} plan · {sites.length}/{siteLimit} sites
          </p>
        </div>
        {planId !== 'whale' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/pricing')}
            className="text-xs border-border/80 hover:bg-accent w-full sm:w-auto"
          >
            <Crown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            Upgrade plan
          </Button>
        )}
      </div>

      {/* Token Gate Banner */}
      {planId === 'free' && hasWallet && !tokenBannerDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 gradient-card border border-border rounded-xl px-5 py-3 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <Coins className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Hold <span className="text-foreground font-semibold">$DEGENTOOLS</span> tokens? Check if you qualify for a{' '}
              <button onClick={() => navigate('/account')} className="text-primary font-medium hover:underline">
                free upgrade
              </button>
            </p>
          </div>
          <button onClick={() => setTokenBannerDismissed(true)} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Sites', value: sites.length, icon: Globe },
          { label: 'This Week', value: sites.filter(s => {
            const d = new Date(s.created_at);
            const weekAgo = new Date(Date.now() - 7 * 86400000);
            return d >= weekAgo;
          }).length, icon: Sparkles },
          { label: 'Themes Used', value: new Set(sites.map(s => (s.data as any)?.theme).filter(Boolean)).size, icon: Palette },
          { label: 'Blockchains', value: new Set(sites.map(s => (s.data as any)?.blockchain).filter(Boolean)).size, icon: BarChart3 },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="gradient-card border border-border/70 rounded-xl p-4 hover:border-border transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-2xl font-semibold text-foreground tracking-tight">{stat.value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Launch CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 gradient-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:border-border/60 transition-colors"
        onClick={() => navigate('/launch')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Launch a Token on Bags.fm</p>
            <p className="text-xs text-muted-foreground">Deploy a Solana token in minutes — no code needed</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="border-border/80 hover:bg-accent shrink-0">
          Launch Now
        </Button>
      </motion.div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-heading font-semibold text-foreground tracking-tight">Your sites</h2>
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{sites.length} total</span>
      </div>

      {/* Sites Grid */}
      {sites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border border-dashed border-border/70 rounded-2xl p-16 text-center gradient-card"
        >
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No sites yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Create your first meme coin landing page in minutes</p>
          <Button onClick={onNewSite} className="bg-foreground text-background hover:bg-foreground/90">
            <Zap className="w-4 h-4 mr-1" /> Start Building
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site, i) => {
            const accentColor = getThemeColor(site.data);
            const themeId = (site.data as any)?.theme as ThemeId;
            const theme = themes[themeId];

            return (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group gradient-card border border-border/70 rounded-xl overflow-hidden hover:border-border transition-all cursor-pointer"
                onClick={() => navigate(`/builder?id=${site.id}`)}
              >
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {(site.data as any)?.logoUrl ? (
                        <img src={(site.data as any).logoUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-muted/40 border border-border/60">
                          {theme?.emoji || '🪙'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground text-sm">{site.name || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground">{site.ticker || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {site.slug && (
                    <a
                      href={`https://${site.slug}.degentools.co`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-muted-foreground hover:text-foreground font-mono hover:underline truncate block mb-2"
                      onClick={e => e.stopPropagation()}
                    >
                      {site.slug}.degentools.co
                    </a>
                  )}
                  {(site.data as any)?.tagline && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{(site.data as any).tagline}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/70 text-muted-foreground">
                        {theme?.name || 'Unknown'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(site.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Analytics" onClick={() => { setAnalyticsSiteId(site.id); setAnalyticsSiteName(site.name || 'Untitled'); }}>
                        <ChartLine className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="View" onClick={() => {
                        const customDomain = (site.data as any)?.customDomain;
                        const url = customDomain
                          ? `https://${customDomain}`
                          : site.slug
                            ? `https://${site.slug}.degentools.co`
                            : `https://degentools.co/site/${site.id}`;
                        window.open(url, '_blank');
                      }}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => navigate(`/builder?id=${site.id}`)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Launch on Bags.fm" onClick={() => navigate(`/launch?siteId=${site.id}`)}>
                        <Rocket className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete" onClick={() => setDeleteTarget(site)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-dashed border-border/70 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-border hover:bg-card/40 cursor-pointer transition-all min-h-[180px]"
            onClick={onNewSite}
          >
            <div className="w-11 h-11 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Create New Site</p>
          </motion.div>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteConfirmText(''); } }}>
        <AlertDialogContent className="border-border bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name || 'Untitled'}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Type <span className="font-bold text-destructive">DELETE</span> below to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Type DELETE to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="font-mono"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText !== 'DELETE'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              onClick={() => {
                if (deleteTarget) onDelete(deleteTarget.id);
                setDeleteTarget(null);
                setDeleteConfirmText('');
              }}
            >
              Delete Site
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardView;
