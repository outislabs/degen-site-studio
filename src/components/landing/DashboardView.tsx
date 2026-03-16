import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Pencil, Plus, Sparkles, Globe, Palette, BarChart3, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { themes } from '@/lib/themes';
import { ThemeId } from '@/types/coin';
import { Badge } from '@/components/ui/badge';
import { PlanId, PlanConfig, PLANS } from '@/lib/plans';

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
}

const DashboardView = ({ sites, onDelete, onNewSite, planId, plan }: Props) => {
  const navigate = useNavigate();

  const getThemeColor = (data: Record<string, any>): string => {
    const themeId = data?.theme as ThemeId;
    return themes[themeId]?.accentHex || '#22c55e';
  };

  const siteLimit = plan.maxSites === -1 ? '∞' : plan.maxSites;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Plan banner */}
      <div className="flex items-center justify-between mb-6 gradient-card border border-border rounded-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <Crown className="w-4 h-4 text-primary" />
          <div>
            <span className="text-sm font-semibold text-foreground">{plan.name} Plan</span>
            <span className="text-xs text-muted-foreground ml-2">
              {sites.length}/{siteLimit} sites
            </span>
          </div>
        </div>
        {planId !== 'whale' && (
          <Button size="sm" variant="outline" onClick={() => navigate('/pricing')} className="text-xs">
            Upgrade
          </Button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Sites', value: sites.length, icon: Globe, color: 'hsl(var(--primary))' },
          { label: 'This Week', value: sites.filter(s => {
            const d = new Date(s.created_at);
            const weekAgo = new Date(Date.now() - 7 * 86400000);
            return d >= weekAgo;
          }).length, icon: Sparkles, color: 'hsl(var(--neon-pink))' },
          { label: 'Themes Used', value: new Set(sites.map(s => (s.data as any)?.theme).filter(Boolean)).size, icon: Palette, color: 'hsl(var(--neon-purple))' },
          { label: 'Blockchains', value: new Set(sites.map(s => (s.data as any)?.blockchain).filter(Boolean)).size, icon: BarChart3, color: 'hsl(var(--neon-blue))' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="gradient-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xs text-primary tracking-wider">YOUR SITES</h2>
      </div>

      {/* Sites Grid */}
      {sites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-2 border-dashed border-border rounded-2xl p-16 text-center"
        >
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No sites yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Create your first meme coin landing page in minutes</p>
          <Button onClick={onNewSite} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                className="group border border-border rounded-xl overflow-hidden hover:border-opacity-50 transition-all cursor-pointer"
                style={{ borderColor: `${accentColor}30` }}
                onClick={() => navigate(`/builder?id=${site.id}`)}
              >
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)` }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {(site.data as any)?.logoUrl ? (
                        <img src={(site.data as any).logoUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-1" style={{ '--tw-ring-color': `${accentColor}40` } as React.CSSProperties} />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${accentColor}15` }}>
                          {theme?.emoji || '🪙'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground text-sm">{site.name || 'Untitled'}</p>
                        <p className="text-xs" style={{ color: accentColor }}>{site.ticker || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {site.slug && (
                    <a
                      href={`https://${site.slug}.degentools.co`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary font-mono hover:underline truncate block mb-2"
                      onClick={e => e.stopPropagation()}
                    >
                      🌐 {site.slug}.degentools.co
                    </a>
                  )}
                  {(site.data as any)?.tagline && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{(site.data as any).tagline}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                        {theme?.name || 'Unknown'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(site.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="View" onClick={() => navigate(`/site/${site.id}`)}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => navigate(`/builder?id=${site.id}`)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete" onClick={() => onDelete(site.id)}>
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
            className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/30 cursor-pointer transition-all min-h-[180px]"
            onClick={onNewSite}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Create New Site</p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
