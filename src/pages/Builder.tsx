import { useState, useEffect, useMemo } from 'react';
import { CoinData, defaultCoinData } from '@/types/coin';
import StepCoinBasics from '@/components/builder/StepCoinBasics';
import StepTokenomics from '@/components/builder/StepTokenomics';
import StepNftGallery from '@/components/builder/StepNftGallery';
import StepSocials from '@/components/builder/StepSocials';
import StepRoadmap from '@/components/builder/StepRoadmap';
import StepTheme from '@/components/builder/StepTheme';
import LivePreview from '@/components/builder/LivePreview';
import PublishModal from '@/components/builder/PublishModal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Rocket, Eye, Coins, PieChart, Share2, Map, Palette, Check, PanelLeft, Sparkles, ImageIcon } from 'lucide-react';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const memecoinSteps = [
  { label: 'Basics', icon: Coins },
  { label: 'Tokenomics', icon: PieChart },
  { label: 'Socials', icon: Share2 },
  { label: 'Roadmap', icon: Map },
  { label: 'Theme', icon: Palette },
];

const nftSteps = [
  { label: 'Basics', icon: Coins },
  { label: 'Gallery', icon: ImageIcon },
  { label: 'Socials', icon: Share2 },
  { label: 'Roadmap', icon: Map },
  { label: 'Theme', icon: Palette },
];

const validateSlug = (s: string): string | null => {
  if (!s.trim()) return 'Site slug is required.';
  if (s.length < 3) return 'Slug must be at least 3 characters.';
  if (!/^[a-z0-9-]+$/.test(s)) return 'Only lowercase letters, numbers, and hyphens allowed.';
  if (s.startsWith('-') || s.endsWith('-')) return 'Slug cannot start or end with a hyphen.';
  return null;
};

const formatSlug = (v: string) =>
  v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const Builder = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CoinData>({ ...defaultCoinData });
  const [showPublish, setShowPublish] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);
  const [domainPaymentStatus, setDomainPaymentStatus] = useState('unpaid');

  const isNft = data.siteType === 'nft';
  const steps = useMemo(() => isNft ? nftSteps : memecoinSteps, [isNft]);
  const lastStep = steps.length - 1;
  const tryNavigateStep = (target: number | ((prev: number) => number)) => {
    const nextStep = typeof target === 'function' ? target(step) : target;
    if (step === 0 && nextStep > 0) {
      const err = validateSlug(slug);
      if (err) {
        setSlugError(err);
        toast.error(err);
        return;
      }
    }
    setSlugError(null);
    setStep(nextStep);
  };
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && user) {
      setEditingId(id);
      setPublishedId(id);
      supabase.from('sites').select('*').eq('id', id).single().then(({ data: site }) => {
        if (site) {
          const coinData = { ...defaultCoinData, ...(site.data as unknown as CoinData) };
          coinData.customDomain = (site as any).custom_domain || '';
          setData(coinData);
          setSlug((site as any).slug || '');
          setDomainPaymentStatus((site as any).domain_payment_status || 'unpaid');
        }
      });
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const id = searchParams.get('id');
    if (payment === 'success' && id) {
      const checkPayment = async () => {
        const { data: site } = await supabase.from('sites').select('domain_payment_status').eq('id', id).single();
        if (site) {
          setDomainPaymentStatus((site as any).domain_payment_status || 'unpaid');
          if ((site as any).domain_payment_status === 'paid') {
            toast.success('Custom domain unlocked! 🎉');
          }
        }
      };
      checkPayment();
    }
  }, [searchParams]);

  const update = (partial: Partial<CoinData>) => setData(prev => ({ ...prev, ...partial }));

  const renderStep = () => {
    switch (step) {
      case 0: return <StepCoinBasics data={data} onChange={update} slug={slug} onSlugChange={v => { setSlug(formatSlug(v)); setSlugError(null); }} siteId={editingId} domainPaymentStatus={domainPaymentStatus} onPaymentStatusChange={setDomainPaymentStatus} slugError={slugError} />;
      case 1: return isNft ? <StepNftGallery data={data} onChange={update} /> : <StepTokenomics data={data} onChange={update} />;
      case 2: return <StepSocials data={data} onChange={update} />;
      case 3: return <StepRoadmap data={data} onChange={update} />;
      case 4: return <StepTheme data={data} onChange={update} />;
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    try {
      const slugValue = slug.trim() || null;
      if (editingId) {
        const { error } = await supabase.from('sites').update({
          name: data.name,
          ticker: data.ticker,
          slug: slugValue,
          custom_domain: data.customDomain || null,
          data: JSON.parse(JSON.stringify(data)),
        } as any).eq('id', editingId);
        if (error) throw error;
        setPublishedId(editingId);
        toast.success('Site updated! 🚀');
      } else {
        const { data: inserted, error } = await supabase.from('sites').insert([{
          user_id: user.id,
          name: data.name,
          ticker: data.ticker,
          slug: slugValue,
          custom_domain: data.customDomain || null,
          data: JSON.parse(JSON.stringify(data)),
        } as any]).select('id').single();
        if (error) throw error;
        const newId = inserted.id;
        setEditingId(newId);
        setPublishedId(newId);
        toast.success('Site published! 🚀');
      }
      setShowPublish(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save site');
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Logo + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/')} className="flex-shrink-0 group">
              <img src={logo} alt="Degen Tools" className="h-7 w-auto transition-transform group-hover:scale-105" />
            </button>
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
              <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-1.5 min-w-0">
                {data.logoUrl ? (
                  <img src={data.logoUrl} alt="" className="w-4 h-4 rounded-full flex-shrink-0 ring-1 ring-border" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-primary" />
                  </div>
                )}
                <span className="text-xs font-medium text-foreground/80 truncate max-w-[140px]">
                  {data.name || 'Untitled Site'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Step pills (desktop only) */}
          <div className="hidden lg:flex items-center gap-1 bg-muted/30 rounded-xl p-1">
            {steps.map((s, i) => {
              const isActive = step === i;
              const isCompleted = i < step;
              const Icon = s.icon;
              return (
                <button
                  key={i}
                  onClick={() => tryNavigateStep(i)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/15 text-primary shadow-sm'
                      : isCompleted
                      ? 'text-primary/60 hover:bg-muted/60'
                      : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/60'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3" strokeWidth={3} />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-xs h-8 px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <PanelLeft className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
              <span className="hidden sm:inline">{showPreview ? 'Editor' : 'Preview'}</span>
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8 px-5 font-semibold rounded-lg shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_28px_hsl(var(--primary)/0.35)] transition-shadow"
            >
              <Rocket className="w-3.5 h-3.5 mr-1.5" />
              {editingId ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL: EDITOR ── */}
        <div
          className={cn(
            'w-full lg:w-[480px] xl:w-[520px] border-r border-border overflow-y-auto flex flex-col pb-20 lg:pb-0',
            showPreview && 'hidden lg:flex'
          )}
          style={{ height: 'calc(100vh - 56px)' }}
        >
          {/* ── STEP INDICATOR (mobile/tablet only) ── */}
          <div className="px-4 pt-4 pb-2 lg:hidden">
            {/* Progress bar */}
            <div className="h-1 rounded-full bg-muted/60 mb-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              {steps.map((s, i) => {
                const isActive = step === i;
                const isCompleted = i < step;
                const Icon = s.icon;
                return (
                  <button
                    key={i}
                    onClick={() => tryNavigateStep(i)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                        : isCompleted
                        ? 'bg-muted/50 text-primary/70 hover:bg-muted'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── STEP CONTENT ── */}
          <div className="flex-1 px-5 py-4 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── FOOTER NAV ── */}
          <div className="px-5 py-3 border-t border-border bg-background/80 backdrop-blur-sm flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => tryNavigateStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-xs h-9 px-4 text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>

            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => tryNavigateStep(i)}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all duration-200',
                    step === i ? 'bg-primary w-4' : i < step ? 'bg-primary/40' : 'bg-muted-foreground/20'
                  )}
                />
              ))}
            </div>

            <Button
              size="sm"
              onClick={() => {
                if (step < 4) {
                  tryNavigateStep(s => s + 1);
                } else {
                  const err = validateSlug(slug);
                  if (err) { setSlugError(err); toast.error(err); return; }
                  handlePublish();
                }
              }}
              className={cn(
                'text-xs h-9 px-4 font-semibold',
                step === 4
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {step < 4 ? (
                <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
              ) : (
                <>{editingId ? 'Update' : 'Publish'} <Rocket className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>

        {/* ── RIGHT PANEL: PREVIEW ── */}
        <div
          className={cn(
            'flex-1 overflow-y-auto bg-muted/20',
            !showPreview && 'hidden lg:block'
          )}
          style={{ height: 'calc(100vh - 56px)' }}
        >
          <div className="p-3 sm:p-5">
            {/* Preview chrome */}
            <div className="rounded-xl overflow-hidden border border-border shadow-2xl shadow-black/20">
              {/* Browser bar */}
              <div className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-2.5 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-muted/60 rounded-md px-4 py-1 text-[10px] text-muted-foreground font-mono max-w-[280px] truncate">
                    {slug ? `degentools.com/s/${slug}` : 'degentools.com/s/your-site'}
                  </div>
                </div>
                <div className="w-[54px]" /> {/* spacer to center URL */}
              </div>

              {/* Actual preview */}
              <LivePreview data={data} />
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
      <PublishModal open={showPublish} onClose={() => setShowPublish(false)} data={data} siteId={publishedId} slug={slug} />
    </div>
  );
};

export default Builder;
