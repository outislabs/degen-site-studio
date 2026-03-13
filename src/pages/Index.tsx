import { Button } from '@/components/ui/button';
import { Rocket, Zap, Trash2, ExternalLink, Pencil, LogOut, LogIn, LayoutGrid, Plus, Sparkles, Globe, Palette, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { themes, themeList } from '@/lib/themes';
import { ThemeId } from '@/types/coin';
import { cn } from '@/lib/utils';

interface SavedSite {
  id: string;
  name: string;
  ticker: string;
  data: Record<string, any>;
  created_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sites, setSites] = useState<SavedSite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchSites();
  }, [user]);

  const fetchSites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setSites(data as SavedSite[]);
    setLoading(false);
  };

  const deleteSite = async (id: string) => {
    const { error } = await supabase.from('sites').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete site');
    } else {
      setSites(prev => prev.filter(s => s.id !== id));
      toast.success('Site deleted');
    }
  };

  const handleNewSite = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/builder');
  };

  const getThemeColor = (data: Record<string, any>): string => {
    const themeId = data?.theme as ThemeId;
    return themes[themeId]?.accentHex || '#22c55e';
  };

  // If user is logged in, show dashboard
  if (user) {
    return (
      <div className="min-h-screen gradient-degen">
        {/* Dashboard Header */}
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-sm text-primary text-glow">MEMELAUNCH</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
            <Button size="sm" variant="ghost" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Sites', value: sites.length, icon: Globe, color: 'hsl(var(--primary))' },
              { label: 'This Week', value: sites.filter(s => {
                const d = new Date(s.created_at);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 86400000);
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

          {/* Create New + Title */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xs text-primary tracking-wider">YOUR SITES</h2>
            <Button onClick={handleNewSite} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1" /> New Site
            </Button>
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
              <Button onClick={handleNewSite} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                    {/* Theme Color Bar */}
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)` }} />
                    
                    {/* Card Content */}
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
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete" onClick={() => deleteSite(site.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* New site card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/30 cursor-pointer transition-all min-h-[180px]"
                onClick={handleNewSite}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Create New Site</p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Landing page for non-logged in users
  return (
    <div className="min-h-screen gradient-degen">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-sm text-primary text-glow">MEMELAUNCH</h1>
        <Button size="sm" onClick={() => navigate('/auth')} variant="outline">
          <LogIn className="w-4 h-4 mr-1" /> Sign In
        </Button>
      </header>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="text-7xl mb-8 animate-float">🚀</div>
          <h2 className="font-display text-xl md:text-3xl text-primary text-glow mb-6 leading-relaxed">
            BUILD YOUR MEME COIN SITE<br />IN MINUTES
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            No code. No designer. Just fill in your coin details and get a degen-approved landing page. Ship it before the next candle.
          </p>
          <Button size="lg" onClick={handleNewSite} className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xs px-10 py-6">
            <Zap className="w-4 h-4 mr-2" /> START BUILDING
          </Button>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20">
          {[
            { icon: '⚡', title: 'Instant', desc: 'Go from zero to live in under 5 minutes' },
            { icon: '🎨', title: '6 Themes', desc: 'Degen Dark, Pepe Classic, Cyber Punk & more' },
            { icon: '📊', title: 'Tokenomics', desc: 'Auto-generated donut charts & roadmaps' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="gradient-card border border-border rounded-xl p-6 text-left"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Theme Showcase */}
        <div className="mt-20">
          <h3 className="font-display text-xs text-primary mb-6 tracking-wider">CHOOSE YOUR VIBE</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {themeList.map(t => (
              <div key={t.id} className="px-4 py-2 rounded-full border border-border flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t.emoji}</span>
                <span>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Built for degens, by degens. Not financial advice. DYOR. 🐸
        </p>
      </footer>
    </div>
  );
};

export default Index;
