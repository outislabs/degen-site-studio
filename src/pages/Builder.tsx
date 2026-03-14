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
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const steps = [
  { label: 'Basics', icon: Coins },
  { label: 'Tokenomics', icon: PieChart },
  { label: 'Socials', icon: Share2 },
  { label: 'Roadmap', icon: Map },
  { label: 'Theme', icon: Palette },
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
        <div className={cn('w-full lg:w-1/2 xl:w-[45%] border-r border-border overflow-y-auto flex flex-col pb-16 lg:pb-0', showPreview && 'hidden lg:flex')} style={{ height: 'calc(100vh - 49px)' }}>
          {/* Step Progress Bar */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center">
              {steps.map((s, i) => {
                const isActive = step === i;
                const isCompleted = i < step;
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center flex-1 last:flex-initial">
                    <button
                      onClick={() => setStep(i)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border-2',
                          isActive
                            ? 'border-primary bg-primary/15 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                            : isCompleted
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted/50 text-muted-foreground group-hover:border-muted-foreground/50'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" strokeWidth={3} />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-medium transition-colors hidden sm:block',
                          isActive ? 'text-primary' : isCompleted ? 'text-primary/70' : 'text-muted-foreground'
                        )}
                      >
                        {s.label}
                      </span>
                    </button>
                    {i < steps.length - 1 && (
                      <div className="flex-1 mx-1.5 sm:mx-2 mt-[-18px] sm:mt-0">
                        <div className={cn(
                          'h-0.5 rounded-full transition-colors duration-300',
                          isCompleted ? 'bg-primary' : 'bg-border'
                        )} />
                      </div>
                    )}
                  </div>
                );
              })}
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

      <MobileBottomNav />
      <PublishModal open={showPublish} onClose={() => setShowPublish(false)} data={data} siteId={publishedId} slug={slug} />
    </div>
  );
};

export default Builder;
