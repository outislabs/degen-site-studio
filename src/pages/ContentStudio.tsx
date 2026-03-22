import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Image, Sticker, Share2, Type, Lock, BarChart3, Twitter, Sparkles, ChevronDown, ArrowRight } from 'lucide-react';
import ContentGenerator from '@/components/studio/ContentGenerator';
import ContentGallery from '@/components/studio/ContentGallery';
import StickerPacks from '@/components/studio/StickerPacks';
import DashboardLayout from '@/components/DashboardLayout';
import PlanGate from '@/components/PlanGate';
import { usePlan } from '@/hooks/usePlan';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SiteOption {
  id: string;
  name: string;
  ticker: string;
  data: Record<string, any>;
}

const NO_TOKEN_ID = '__no_token__';

const toolMeta: Record<string, { icon: any; label: string; description: string; color: string }> = {
  meme: { icon: Image, label: 'Memes', description: 'AI-generated memes', color: 'from-primary/20 to-primary/5' },
  sticker: { icon: Sticker, label: 'Stickers', description: 'Custom sticker packs', color: 'from-accent/20 to-accent/5' },
  social_post: { icon: Share2, label: 'Social', description: 'Scroll-stopping posts', color: 'from-[hsl(var(--neon-blue))]/20 to-[hsl(var(--neon-blue))]/5' },
  dex_header: { icon: BarChart3, label: 'DEX Header', description: 'Trading banners', color: 'from-[hsl(var(--neon-pink))]/20 to-[hsl(var(--neon-pink))]/5' },
  x_header: { icon: Twitter, label: 'X Header', description: 'Profile banners', color: 'from-[hsl(var(--neon-blue))]/20 to-[hsl(var(--neon-blue))]/5' },
  marketing_copy: { icon: Type, label: 'Copy', description: 'Marketing text', color: 'from-[hsl(var(--neon-purple))]/20 to-[hsl(var(--neon-purple))]/5' },
};

const ContentStudio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(NO_TOKEN_ID);
  const [activeTab, setActiveTab] = useState('meme');
  const [refreshKey, setRefreshKey] = useState(0);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>('');
  const [customProjectName, setCustomProjectName] = useState('');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { plan, canDownloadMeme, remainingDownloads, incrementDownloads, canAccessStickerPacks } = usePlan();

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchSites();
  }, [user]);

  useEffect(() => {
    if (!selectedSiteId || selectedSiteId === NO_TOKEN_ID) { setReferenceImageUrl(''); return; }
    const site = sites.find(s => s.id === selectedSiteId);
    setReferenceImageUrl((site?.data?.logoUrl as string) || '');
  }, [selectedSiteId, sites]);

  const fetchSites = async () => {
    const { data } = await supabase.from('sites').select('id, name, ticker, data').eq('user_id', user!.id).order('created_at', { ascending: false });
    if (data) setSites(data as SiteOption[]);
  };

  const isNoTokenMode = selectedSiteId === NO_TOKEN_ID;
  const selectedSite = sites.find(s => s.id === selectedSiteId);
  const tokenName = isNoTokenMode ? (customProjectName.trim() || 'My Token') : (selectedSite?.name || 'My Token');
  const tokenTicker = isNoTokenMode ? '' : (selectedSite?.ticker || 'TOKEN');
  const remaining = remainingDownloads();
  const isFullStudio = plan.hasFullContentStudio;

  const tabs = [
    { id: 'meme', locked: false },
    { id: 'sticker', locked: !isFullStudio },
    { id: 'social_post', locked: !isFullStudio },
    { id: 'dex_header', locked: !isFullStudio },
    { id: 'x_header', locked: !isFullStudio },
    { id: 'marketing_copy', locked: !isFullStudio },
  ];

  const activeToolMeta = toolMeta[activeTab];

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Hero header */}
        <div className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-primary/3 blur-[150px] rounded-full" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Content Studio</h1>
                    <p className="text-xs text-muted-foreground">AI-powered creative tools for your token</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {remaining !== null && (
                  <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">
                      <span className="text-foreground font-semibold">{remaining}</span> generations left
                    </span>
                  </div>
                )}
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2">
                  <span className="text-xs font-medium text-primary">{plan.name}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Project selector — clean pill style */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Project</span>
              <div className="relative">
                <button
                  onClick={() => setSelectorOpen(!selectorOpen)}
                  className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border hover:border-primary/30 rounded-2xl px-4 py-2.5 transition-all duration-200 group"
                >
                  {!isNoTokenMode && selectedSite?.data?.logoUrl && (
                    <img src={selectedSite.data.logoUrl as string} className="w-5 h-5 rounded-full object-cover" alt="" />
                  )}
                  <span className="text-sm text-foreground">
                    {isNoTokenMode ? 'No token — just generate' : `${selectedSite?.name || 'Untitled'} (${selectedSite?.ticker || '—'})`}
                  </span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", selectorOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {selectorOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      className="absolute z-50 top-full mt-2 left-0 min-w-[260px] bg-card border border-border rounded-2xl shadow-2xl shadow-background/80 overflow-hidden"
                    >
                      <button
                        onClick={() => { setSelectedSiteId(NO_TOKEN_ID); setSelectorOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2",
                          isNoTokenMode && "bg-primary/5 text-primary"
                        )}
                      >
                        <span className="text-base">🎨</span> No token — just generate
                      </button>
                      {sites.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedSiteId(s.id); setSelectorOpen(false); }}
                          className={cn(
                            "w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2",
                            selectedSiteId === s.id && "bg-primary/5 text-primary"
                          )}
                        >
                          {s.data?.logoUrl && <img src={s.data.logoUrl as string} className="w-5 h-5 rounded-full object-cover" alt="" />}
                          <span>{s.name || 'Untitled'}</span>
                          <span className="text-muted-foreground text-xs">({s.ticker || '—'})</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isNoTokenMode && (
                <div className="flex items-center gap-2">
                  <input
                    value={customProjectName}
                    onChange={e => setCustomProjectName(e.target.value)}
                    placeholder="Project name"
                    className="bg-card/80 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 w-48 transition-colors"
                  />
                  <button
                    onClick={() => navigate('/builder')}
                    className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Create site <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tool selector — horizontal pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map(t => {
                const meta = toolMeta[t.id];
                const Icon = meta.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (t.locked) { toast.error('Upgrade to Creator plan to unlock'); return; }
                      setActiveTab(t.id);
                    }}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-medium whitespace-nowrap transition-all duration-300",
                      isActive
                        ? "bg-card border-primary/30 text-foreground shadow-lg shadow-primary/5"
                        : "bg-card/40 border-border text-muted-foreground hover:text-foreground hover:border-border hover:bg-card/60",
                      t.locked && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabGlow"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {t.locked ? <Lock className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                      {meta.label}
                      {t.locked && <span className="text-[8px] bg-muted px-1.5 py-0.5 rounded-full">PRO</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Active tool header */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center", activeToolMeta.color)}>
                <activeToolMeta.icon className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">{activeToolMeta.label}</h2>
                <p className="text-xs text-muted-foreground">{activeToolMeta.description}</p>
              </div>
            </div>
          </motion.div>

          {/* Main content area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Generator panel */}
                <div className="lg:col-span-2 space-y-4">
                  <ContentGenerator
                    type={activeTab}
                    tokenName={tokenName}
                    tokenTicker={tokenTicker}
                    siteId={isNoTokenMode ? '' : selectedSiteId}
                    onGenerated={() => { incrementDownloads(); setRefreshKey(k => k + 1); }}
                    canGenerate={canDownloadMeme()}
                    remaining={remaining}
                    referenceImageUrl={referenceImageUrl}
                    onReferenceImageChange={setReferenceImageUrl}
                  />
                  {activeTab === 'sticker' && canAccessStickerPacks() && <StickerPacks refreshKey={refreshKey} />}
                  {activeTab === 'sticker' && !canAccessStickerPacks() && (
                    <PlanGate allowed={false} requiredPlan="Creator" message="Upgrade to Creator to build and download sticker packs." />
                  )}
                </div>

                {/* Gallery panel */}
                <div className="lg:col-span-3">
                  <ContentGallery type={activeTab} refreshKey={refreshKey} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContentStudio;
