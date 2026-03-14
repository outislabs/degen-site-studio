import { useState, useEffect } from 'react';
import { CoinData, defaultCoinData } from '@/types/coin';
import StepCoinBasics from '@/components/builder/StepCoinBasics';
import StepTokenomics from '@/components/builder/StepTokenomics';
import StepSocials from '@/components/builder/StepSocials';
import StepRoadmap from '@/components/builder/StepRoadmap';
import StepTheme from '@/components/builder/StepTheme';
import LivePreview from '@/components/builder/LivePreview';
import PublishModal from '@/components/builder/PublishModal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Rocket, Eye, Coins, PieChart, Share2, Map, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const steps = [
  { label: 'Basics', icon: '🪙' },
  { label: 'Tokenomics', icon: '📊' },
  { label: 'Socials', icon: '🔗' },
  { label: 'Roadmap', icon: '🗺️' },
  { label: 'Theme', icon: '🎨' },
];

const Builder = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CoinData>({ ...defaultCoinData });
  const [showPublish, setShowPublish] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [domainPaymentStatus, setDomainPaymentStatus] = useState('unpaid');
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
          const coinData = site.data as unknown as CoinData;
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

  // Refresh payment status when returning from payment
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
      case 0: return <StepCoinBasics data={data} onChange={update} slug={slug} onSlugChange={setSlug} siteId={editingId} domainPaymentStatus={domainPaymentStatus} onPaymentStatusChange={setDomainPaymentStatus} />;
      case 1: return <StepTokenomics data={data} onChange={update} />;
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

  return (
    <div className="min-h-screen gradient-degen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-lg">🛠️</span>
            <span className="font-display text-[10px] sm:text-xs text-primary text-glow tracking-wider">
              DEGEN TOOLS
            </span>
          </button>
          <div className="hidden sm:block h-5 w-px bg-border" />
          <span className="hidden sm:block text-xs text-muted-foreground font-medium truncate max-w-[180px]">
            {data.name || 'Untitled Site'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="lg:hidden text-xs" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-3.5 h-3.5 mr-1" /> {showPreview ? 'Editor' : 'Preview'}
          </Button>
          <Button size="sm" onClick={handlePublish} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
            <Rocket className="w-3.5 h-3.5 mr-1" /> {editingId ? 'Update' : 'Publish'}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={cn('w-full lg:w-1/2 xl:w-[45%] border-r border-border overflow-y-auto flex flex-col', showPreview && 'hidden lg:flex')} style={{ height: 'calc(100vh - 49px)' }}>
          {/* Step Progress Bar */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-1">
              {steps.map((s, i) => {
                const isActive = step === i;
                const isCompleted = i < step;
                return (
                  <div key={i} className="flex items-center flex-1">
                    <button
                      onClick={() => setStep(i)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all w-full justify-center',
                        isActive
                          ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                          : isCompleted
                          ? 'bg-primary/5 text-primary/70 hover:bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <span className="text-sm">{s.icon}</span>
                      <span className="hidden md:inline">{s.label}</span>
                    </button>
                    {i < steps.length - 1 && (
                      <div className={cn(
                        'h-px w-3 mx-0.5 shrink-0 transition-colors',
                        isCompleted ? 'bg-primary/40' : 'bg-border'
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Progress indicator */}
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-6 flex-1">{renderStep()}</div>

          <div className="p-6 pt-0 flex justify-between">
            <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              onClick={() => step < 4 ? setStep(s => s + 1) : handlePublish()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {step < 4 ? (
                <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
              ) : (
                <>{editingId ? 'Update' : 'Publish'} <Rocket className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>

        <div className={cn('flex-1 overflow-y-auto', !showPreview && 'hidden lg:block')} style={{ height: 'calc(100vh - 53px)' }}>
          <div className="p-4">
            <div className="text-xs text-muted-foreground mb-2 font-display">LIVE PREVIEW</div>
            <LivePreview data={data} />
          </div>
        </div>
      </div>

      <PublishModal open={showPublish} onClose={() => setShowPublish(false)} data={data} siteId={publishedId} slug={slug} />
    </div>
  );
};

export default Builder;
