import { useState } from 'react';
import { CoinData, defaultCoinData } from '@/types/coin';
import StepCoinBasics from '@/components/builder/StepCoinBasics';
import StepTokenomics from '@/components/builder/StepTokenomics';
import StepSocials from '@/components/builder/StepSocials';
import StepRoadmap from '@/components/builder/StepRoadmap';
import StepTheme from '@/components/builder/StepTheme';
import LivePreview from '@/components/builder/LivePreview';
import PublishModal from '@/components/builder/PublishModal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Rocket, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const update = (partial: Partial<CoinData>) => setData(prev => ({ ...prev, ...partial }));

  const renderStep = () => {
    switch (step) {
      case 0: return <StepCoinBasics data={data} onChange={update} />;
      case 1: return <StepTokenomics data={data} onChange={update} />;
      case 2: return <StepSocials data={data} onChange={update} />;
      case 3: return <StepRoadmap data={data} onChange={update} />;
      case 4: return <StepTheme data={data} onChange={update} />;
    }
  };

  const handlePublish = () => {
    // Save to localStorage for dashboard
    const saved = JSON.parse(localStorage.getItem('memelaunch_sites') || '[]');
    const site = {
      id: Date.now().toString(),
      data,
      createdAt: new Date().toISOString(),
    };
    saved.push(site);
    localStorage.setItem('memelaunch_sites', JSON.stringify(saved));
    setShowPublish(true);
  };

  return (
    <div className="min-h-screen gradient-degen">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="font-display text-sm text-primary text-glow hover:opacity-80 transition-opacity">
          MEMELAUNCH
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-1" /> Preview
          </Button>
          <Button size="sm" onClick={handlePublish} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Rocket className="w-4 h-4 mr-1" /> Publish
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left: Form */}
        <div className={cn('w-full lg:w-1/2 xl:w-[45%] border-r border-border overflow-y-auto', showPreview && 'hidden lg:block')} style={{ height: 'calc(100vh - 53px)' }}>
          {/* Step Indicator */}
          <div className="flex border-b border-border">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  'flex-1 py-3 text-xs font-medium transition-all border-b-2',
                  step === i
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="block text-base mb-0.5">{s.icon}</span>
                <span className="hidden sm:block">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Step Content */}
          <div className="p-6">{renderStep()}</div>

          {/* Navigation */}
          <div className="p-6 pt-0 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              onClick={() => step < 4 ? setStep(s => s + 1) : handlePublish()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {step < 4 ? (
                <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
              ) : (
                <>Publish <Rocket className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className={cn('flex-1 overflow-y-auto', !showPreview && 'hidden lg:block')} style={{ height: 'calc(100vh - 53px)' }}>
          <div className="p-4">
            <div className="text-xs text-muted-foreground mb-2 font-display">LIVE PREVIEW</div>
            <LivePreview data={data} />
          </div>
        </div>
      </div>

      <PublishModal open={showPublish} onClose={() => setShowPublish(false)} data={data} />
    </div>
  );
};

export default Builder;
