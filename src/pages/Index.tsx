import { Button } from '@/components/ui/button';
import { Rocket, Zap, Trash2, ExternalLink, Pencil, LogOut, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (user) fetchSites();
  }, [user]);

  const fetchSites = async () => {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setSites(data as SavedSite[]);
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

  const todayCount = sites.filter(s => {
    const d = new Date(s.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const handleNewSite = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/builder');
  };

  return (
    <div className="min-h-screen gradient-degen">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-sm text-primary text-glow">MEMELAUNCH</h1>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button size="sm" onClick={() => navigate('/builder')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Rocket className="w-4 h-4 mr-1" /> New Site
              </Button>
              <Button size="sm" variant="ghost" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate('/auth')} variant="outline">
              <LogIn className="w-4 h-4 mr-1" /> Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="font-display text-2xl md:text-4xl text-primary text-glow mb-4 leading-relaxed">
            BUILD YOUR MEME COIN SITE IN MINUTES
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            No code. No designer. Just fill in your coin details and get a degen-approved landing page. Ship it before the next candle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={handleNewSite} className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xs px-8">
              <Zap className="w-4 h-4 mr-2" /> START BUILDING
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
          {[
            { icon: '⚡', title: 'Instant', desc: 'Go from zero to live in under 5 minutes' },
            { icon: '🎨', title: '3 Themes', desc: 'Degen Dark, Pepe Classic, Moon Cult' },
            { icon: '📊', title: 'Tokenomics', desc: 'Auto-generated donut charts & roadmaps' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="gradient-card border border-border rounded-xl p-6 text-left"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dashboard */}
      {user && sites.length > 0 && (
        <section className="px-6 pb-16 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xs text-primary">YOUR SITES</h3>
            {todayCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {todayCount} created today 🔥
              </span>
            )}
          </div>
          <div className="space-y-3">
            {sites.map(site => (
              <div key={site.id} className="gradient-card border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{site.name || 'Untitled'}</p>
                  <p className="text-xs text-muted-foreground">
                    {site.ticker} • {new Date(site.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" title="View">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => navigate(`/builder?id=${site.id}`)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Delete" onClick={() => deleteSite(site.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
