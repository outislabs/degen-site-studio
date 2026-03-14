import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { themes } from '@/lib/themes';
import { ThemeId } from '@/types/coin';
import { Globe, ImageIcon, ChevronLeft, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';

interface ShowcaseSite {
  id: string;
  name: string;
  ticker: string;
  slug: string | null;
  data: Record<string, any>;
}

interface ShowcaseMeme {
  id: string;
  title: string;
  image_url: string | null;
  type: string;
  created_at: string;
}

type Tab = 'sites' | 'memes';

const CommunityShowcase = () => {
  const [sites, setSites] = useState<ShowcaseSite[]>([]);
  const [memes, setMemes] = useState<ShowcaseMeme[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('sites');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchShowcaseData();
  }, []);

  const fetchShowcaseData = async () => {
    setLoading(true);
    const [sitesRes, memesRes] = await Promise.all([
      supabase
        .from('sites')
        .select('id, name, ticker, slug, data')
        .not('slug', 'is', null)
        .order('created_at', { ascending: false })
        .limit(12),
      supabase
        .from('generated_content')
        .select('id, title, image_url, type, created_at')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(12),
    ]);
    if (sitesRes.data) setSites(sitesRes.data as ShowcaseSite[]);
    if (memesRes.data) setMemes(memesRes.data as ShowcaseMeme[]);
    setLoading(false);
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const getThemePreview = (data: Record<string, any>) => {
    const themeId = (data.theme || 'degen-dark') as ThemeId;
    const theme = themes[themeId] || themes['degen-dark'];
    return theme;
  };

  const items = activeTab === 'sites' ? sites : memes;
  const isEmpty = !loading && items.length === 0;

  return (
    <section className="section-padding py-10 sm:py-24 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-primary/3 blur-[180px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-neon-pink/3 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 mb-5 sm:mb-6">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            <span className="text-[9px] sm:text-[10px] font-display text-primary tracking-[0.3em]">COMMUNITY</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            Built with Degen Tools Studio
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-xl mx-auto px-2">
            Real websites and memes created by our community. See what's possible.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-card border border-border rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('sites')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeTab === 'sites'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Websites
            </button>
            <button
              onClick={() => setActiveTab('memes')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeTab === 'memes'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Memes
            </button>
          </div>
        </div>

        {/* Carousel wrapper */}
        <div className="relative group">
          {/* Nav arrows */}
          {items.length > 3 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Scrollable content */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-4 px-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
                  >
                    <div className="rounded-2xl border border-border bg-card overflow-hidden">
                      <div className="h-[180px] sm:h-[200px] bg-muted animate-pulse" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : isEmpty ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    {activeTab === 'sites' ? <Globe className="w-7 h-7 text-muted-foreground" /> : <ImageIcon className="w-7 h-7 text-muted-foreground" />}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {activeTab === 'sites' ? 'No websites created yet. Be the first!' : 'No memes generated yet. Start creating!'}
                  </p>
                </motion.div>
              ) : activeTab === 'sites' ? (
                sites.map((site, i) => {
                  const theme = getThemePreview(site.data);
                  const logoUrl = site.data?.logoUrl;
                  return (
                    <motion.div
                      key={site.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start group/card"
                    >
                      <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/25 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                        {/* Site preview mini */}
                        <div
                          className="h-[180px] sm:h-[200px] relative overflow-hidden"
                          style={{ background: theme.bgGradient }}
                        >
                          {/* Decorative glow */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-40 h-40 rounded-full blur-[80px] opacity-20" style={{ backgroundColor: theme.accentHex }} />
                          </div>

                          {/* Mini site representation */}
                          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
                            {logoUrl && (
                              <img
                                src={logoUrl}
                                alt={site.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover mb-3 shadow-lg"
                                style={{ boxShadow: `0 8px 30px ${theme.accentHex}30` }}
                              />
                            )}
                            <h3
                              className="font-display text-sm sm:text-base tracking-tight font-bold"
                              style={{ color: theme.accentHex }}
                            >
                              {site.ticker ? (site.ticker.startsWith('$') ? site.ticker : `$${site.ticker}`) : site.name}
                            </h3>
                            {site.data?.tagline && (
                              <p className="text-[10px] text-white/40 mt-1 text-center line-clamp-1 max-w-[200px]">
                                {site.data.tagline}
                              </p>
                            )}
                          </div>

                          {/* Hover overlay */}
                          {site.slug && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20">
                              <a
                                href={`/site/${site.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Visit Site
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Info bar */}
                        <div className="p-3 sm:p-4 flex items-center justify-between">
                          <div className="min-w-0">
                            <h4 className="text-foreground font-semibold text-sm truncate">{site.name || 'Untitled'}</h4>
                            <p className="text-muted-foreground text-[10px] sm:text-xs">
                              {theme.name} • {(site.data?.layout || 'classic').replace('-', ' ')}
                            </p>
                          </div>
                          <div
                            className="w-6 h-6 rounded-md shrink-0"
                            style={{ background: theme.bgGradient, border: `1px solid ${theme.accentHex}30` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                memes.map((meme, i) => (
                  <motion.div
                    key={meme.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
                  >
                    <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/25 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                      <div className="h-[220px] sm:h-[250px] relative bg-muted overflow-hidden">
                        {meme.image_url ? (
                          <img
                            src={meme.image_url}
                            alt={meme.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="text-[8px] font-display tracking-[0.15em] text-primary bg-card/80 backdrop-blur-sm border border-primary/20 px-2 py-1 rounded-full uppercase">
                            {meme.type}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h4 className="text-foreground font-semibold text-sm truncate">{meme.title || 'Untitled'}</h4>
                        <p className="text-muted-foreground text-[10px] mt-1">
                          {new Date(meme.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats bar */}
        {!loading && (sites.length > 0 || memes.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 sm:mt-10 flex justify-center gap-6 sm:gap-10"
          >
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-foreground">{sites.length}+</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Sites Created</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-foreground">{memes.length}+</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Memes Generated</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CommunityShowcase;
