import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { themes } from '@/lib/themes';
import { ThemeId } from '@/types/coin';
import { Globe, ImageIcon, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

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
    <section className="section-padding py-10 sm:py-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-10"
        >
          <span className="inline-block text-[11px] text-muted-foreground tracking-[0.2em] font-medium uppercase mb-4 border border-[hsla(0,0%,100%,0.08)] rounded-full px-4 py-1.5">COMMUNITY</span>
          <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-[36px] text-foreground mt-3 mb-3 tracking-tight leading-tight">
            Built with Degen Tools Studio
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto">
            Real websites and memes created by our community. See what's possible.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveTab('sites')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'sites'
                  ? 'bg-[hsla(0,0%,100%,0.08)] text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Websites
            </button>
            <button
              onClick={() => setActiveTab('memes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'memes'
                  ? 'bg-[hsla(0,0%,100%,0.08)] text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Memes
            </button>
          </div>
        </div>

        {/* Carousel wrapper */}
        <div className="relative group">
          {items.length > 3 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background border border-[hsla(0,0%,100%,0.08)] flex items-center justify-center text-foreground hover:border-[hsla(0,0%,100%,0.15)] transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background border border-[hsla(0,0%,100%,0.08)] flex items-center justify-center text-foreground hover:border-[hsla(0,0%,100%,0.15)] transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 px-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start"
                  >
                    <div className="rounded-xl border border-[hsla(0,0%,100%,0.06)] bg-[hsla(0,0%,100%,0.02)] overflow-hidden">
                      <div className="h-[160px] sm:h-[180px] bg-[hsla(0,0%,100%,0.03)] animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 w-2/3 bg-[hsla(0,0%,100%,0.05)] animate-pulse rounded" />
                        <div className="h-2.5 w-1/3 bg-[hsla(0,0%,100%,0.03)] animate-pulse rounded" />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : isEmpty ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-[hsla(0,0%,100%,0.04)] flex items-center justify-center mb-3">
                    {activeTab === 'sites' ? <Globe className="w-5 h-5 text-muted-foreground" /> : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <p className="text-muted-foreground text-xs">
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
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start group/card"
                    >
                      <div className="rounded-xl border border-[hsla(0,0%,100%,0.06)] bg-[hsla(0,0%,100%,0.02)] overflow-hidden hover:border-[hsla(0,0%,100%,0.1)] transition-colors">
                        <div
                          className="h-[160px] sm:h-[180px] relative overflow-hidden"
                          style={{ background: theme.bgGradient }}
                        >
                          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
                            {logoUrl && (
                              <img
                                src={logoUrl}
                                alt={site.name}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover mb-2 shadow-lg"
                              />
                            )}
                            <h3
                              className="text-xs sm:text-sm tracking-tight font-bold"
                              style={{ color: theme.accentHex }}
                            >
                              {site.ticker ? (site.ticker.startsWith('$') ? site.ticker : `$${site.ticker}`) : site.name}
                            </h3>
                          </div>

                          {site.slug && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20">
                              <a
                                href={`/site/${site.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold"
                              >
                                <ExternalLink className="w-3 h-3" /> Visit Site
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="p-3 flex items-center justify-between">
                          <div className="min-w-0">
                            <h4 className="text-foreground font-medium text-xs truncate">{site.name || 'Untitled'}</h4>
                            <p className="text-muted-foreground/50 text-[10px]">
                              {theme.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                memes.map((meme, i) => (
                  <motion.div
                    key={meme.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start"
                  >
                    <div className="rounded-xl border border-[hsla(0,0%,100%,0.06)] bg-[hsla(0,0%,100%,0.02)] overflow-hidden hover:border-[hsla(0,0%,100%,0.1)] transition-colors">
                      <div className="h-[200px] sm:h-[220px] relative bg-[hsla(0,0%,100%,0.02)] overflow-hidden">
                        {meme.image_url ? (
                          <img
                            src={meme.image_url}
                            alt={meme.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="text-[8px] tracking-wider text-muted-foreground/60 bg-background/80 border border-[hsla(0,0%,100%,0.08)] px-2 py-0.5 rounded-full uppercase">
                            {meme.type}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-foreground font-medium text-xs truncate">{meme.title || 'Untitled'}</h4>
                        <p className="text-muted-foreground/40 text-[10px] mt-0.5">
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

        {!loading && (sites.length > 0 || memes.length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 sm:mt-8 flex justify-center gap-6 sm:gap-8"
          >
            <div className="text-center">
              <p className="text-base sm:text-lg font-bold text-foreground">{sites.length}+</p>
              <p className="text-[10px] text-muted-foreground/40">Sites Created</p>
            </div>
            <div className="w-px bg-[hsla(0,0%,100%,0.06)]" />
            <div className="text-center">
              <p className="text-base sm:text-lg font-bold text-foreground">{memes.length}+</p>
              <p className="text-[10px] text-muted-foreground/40">Memes Generated</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CommunityShowcase;
