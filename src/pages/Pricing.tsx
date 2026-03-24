import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, Zap, Crown, Rocket, Diamond, Minus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlanId, PLAN_ORDER } from '@/lib/plans';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    icon: Zap,
    description: 'Get started with the basics',
    features: [
      '1 coin website',
      'DegenTools watermark',
      '5 meme downloads per month',
      'Basic website templates',
    ],
    cta: 'Get Started',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Degen',
    price: '$19',
    period: '/mo',
    icon: Rocket,
    description: 'For serious degens',
    features: [
      '3 coin websites',
      'Custom domain support',
      'No watermark',
      'All website templates',
      '50 meme downloads per month',
      'Basic shill templates',
    ],
    cta: 'Go Degen',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Creator',
    price: '$49',
    period: '/mo',
    icon: Crown,
    description: 'Full creative suite',
    features: [
      '10 coin websites',
      'Full content studio access',
      'Unlimited meme downloads',
      'Sticker pack builder',
      'Brand kit & launch kit',
      'Priority support',
    ],
    cta: 'Start Creating',
    variant: 'default' as const,
    popular: true,
  },
  {
    name: 'Whale',
    price: '$99',
    period: '/mo',
    icon: Diamond,
    description: 'Unlimited everything',
    features: [
      'Unlimited coin websites',
      'Analytics dashboard',
      'API access',
      'White label option',
      'Everything in Creator',
    ],
    cta: 'Go Whale',
    variant: 'outline' as const,
    popular: false,
  },
];

const oneTimePurchases = [
  { name: 'Website Builder', price: '$39', description: 'One-time website builder access' },
  { name: 'Content Studio Pack', price: '$25', description: '100 downloads included' },
  { name: 'Audit Badge', price: '$29', description: 'Smart contract audit badge' },
  { name: 'Launch Kit Bundle', price: '$79', description: 'Website + Content Studio + Audit Badge' },
];

const addOns = [
  { name: 'Extra Coin Website', price: '$9/mo', description: 'Per additional coin' },
  { name: 'Telegram Bot', price: '$29/mo', description: 'Add to any plan' },
  { name: 'White Label', price: '$49/mo', description: 'Remove DegenTools branding' },
  { name: 'Priority Support', price: '$19/mo', description: 'Fast-track assistance' },
];

type FeatureValue = boolean | string;

const planNames = ['Free', 'Degen', 'Creator', 'Whale'];

const comparisonFeatures: { category: string; features: { name: string; values: Record<string, FeatureValue> }[] }[] = [
  {
    category: 'Websites',
    features: [
      { name: 'Coin websites', values: { Free: '1', Degen: '3', Creator: '10', Whale: 'Unlimited' } },
      { name: 'Custom domain', values: { Free: false, Degen: true, Creator: true, Whale: true } },
      { name: 'All templates', values: { Free: false, Degen: true, Creator: true, Whale: true } },
      { name: 'No watermark', values: { Free: false, Degen: true, Creator: true, Whale: true } },
    ],
  },
  {
    category: 'Content Studio',
    features: [
      { name: 'Meme downloads', values: { Free: '5/mo', Degen: '50/mo', Creator: 'Unlimited', Whale: 'Unlimited' } },
      { name: 'Full content studio', values: { Free: false, Degen: false, Creator: true, Whale: true } },
      { name: 'Sticker pack builder', values: { Free: false, Degen: false, Creator: true, Whale: true } },
      { name: 'Shill templates', values: { Free: false, Degen: 'Basic', Creator: 'All', Whale: 'All' } },
    ],
  },
  {
    category: 'Branding & Launch',
    features: [
      { name: 'Brand kit', values: { Free: false, Degen: false, Creator: true, Whale: true } },
      { name: 'Launch announcement kit', values: { Free: false, Degen: false, Creator: true, Whale: true } },
      { name: 'Contract audit badge', values: { Free: false, Degen: false, Creator: true, Whale: true } },
    ],
  },
  {
    category: 'Automation & Analytics',
    features: [
      { name: 'Telegram buy bot', values: { Free: false, Degen: false, Creator: true, Whale: true } },
      { name: 'Smart whale alerts', values: { Free: false, Degen: false, Creator: true, Whale: true } },
      { name: 'Multi-platform blast', values: { Free: false, Degen: false, Creator: true, Whale: true } },
      { name: 'Analytics dashboard', values: { Free: false, Degen: false, Creator: false, Whale: true } },
      { name: 'API access', values: { Free: false, Degen: false, Creator: false, Whale: true } },
    ],
  },
  {
    category: 'Support & Extras',
    features: [
      { name: 'White label option', values: { Free: false, Degen: false, Creator: false, Whale: true } },
      { name: 'Priority support', values: { Free: false, Degen: false, Creator: true, Whale: true } },
    ],
  },
];

const ComparisonTable = () => (
  <Card className="border-border overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="border-border">
          <TableHead className="min-w-[160px] text-xs font-bold text-foreground">Feature</TableHead>
          {planNames.map((name) => (
            <TableHead key={name} className={cn('text-center text-xs font-bold min-w-[90px]', name === 'Creator' ? 'text-primary' : 'text-foreground')}>
              {name}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {comparisonFeatures.map((category) => (
          <React.Fragment key={category.category}>
            <TableRow className="border-border bg-secondary/30">
              <TableCell colSpan={5} className="text-[10px] font-display text-primary tracking-wider py-2">
                {category.category.toUpperCase()}
              </TableCell>
            </TableRow>
            {category.features.map((feature) => (
              <TableRow key={feature.name} className="border-border">
                <TableCell className="text-xs text-muted-foreground">{feature.name}</TableCell>
                {planNames.map((plan) => {
                  const val = feature.values[plan];
                  return (
                    <TableCell key={plan} className="text-center">
                      {val === true ? (
                        <Check className="w-4 h-4 text-primary mx-auto" />
                      ) : val === false ? (
                        <Minus className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                      ) : (
                        <span className="text-xs text-foreground font-medium">{val}</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  </Card>
);

const planIdMap: Record<string, PlanId> = {
  Free: 'free',
  Degen: 'degen',
  Creator: 'creator',
  Whale: 'whale',
};

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { planId: currentPlan, refetch } = usePlan();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [subscribing, setSubscribing] = useState<string | null>(null);

  React.useEffect(() => {
    const payment = searchParams.get('payment');
    const plan = searchParams.get('plan');
    if (payment === 'success' && plan) {
      toast.success(`Welcome to the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan! 🎉`);
      refetch();
    } else if (payment === 'cancelled') {
      toast.error('Payment was cancelled');
    }
  }, [searchParams, refetch]);

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const targetPlan = planIdMap[planName];
    if (!targetPlan || targetPlan === 'free') {
      navigate('/');
      return;
    }

    if (targetPlan === currentPlan) {
      toast.info('You\'re already on this plan');
      return;
    }

    setSubscribing(planName);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { plan: targetPlan, billing_period: billing },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.invoice_url) {
        window.location.href = data.invoice_url;
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to create subscription');
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="min-h-screen gradient-degen">
      <LandingHeader
        isLoggedIn={!!user}
        email={user?.email}
        onSignIn={() => navigate('/auth')}
        onSignOut={signOut}
      />

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-xl sm:text-2xl text-primary text-glow mb-4">PRICING</h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
            Choose the plan that matches your degen energy. Upgrade or downgrade anytime.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'text-sm font-medium transition-colors px-3 py-1.5 rounded-md',
                billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                'text-sm font-medium transition-colors px-3 py-1.5 rounded-md',
                billing === 'annual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Annual <span className="text-xs opacity-75">(-20%)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-20">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = billing === 'annual' && plan.price !== '$0'
              ? `$${Math.round(parseInt(plan.price.replace('$', '')) * 0.8)}`
              : plan.price;

            const isCurrent = planIdMap[plan.name] === currentPlan;
            const isDowngrade = PLAN_ORDER.indexOf(planIdMap[plan.name]) < PLAN_ORDER.indexOf(currentPlan);

            return (
              <Card
                key={plan.name}
                className={cn(
                  'relative flex flex-col transition-all duration-300 hover:scale-[1.02]',
                  isCurrent
                    ? 'border-primary shadow-[0_0_30px_hsl(var(--primary)/0.2)] ring-2 ring-primary'
                    : plan.popular
                    ? 'border-primary shadow-[0_0_30px_hsl(var(--primary)/0.2)] ring-1 ring-primary'
                    : 'border-border hover:border-primary/40'
                )}
              >
                {isCurrent && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-display">
                    CURRENT PLAN
                  </Badge>
                )}
                {!isCurrent && plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-display">
                    MOST POPULAR
                  </Badge>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn('w-5 h-5', plan.popular || isCurrent ? 'text-primary' : 'text-muted-foreground')} />
                    <CardTitle className="text-base font-bold">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-foreground">{price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full text-xs"
                    variant={isCurrent ? 'secondary' : plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={isCurrent || subscribing === plan.name}
                  >
                    {subscribing === plan.name ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing...</>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : isDowngrade ? (
                      'Downgrade'
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mb-20">
          <h2 className="font-display text-sm text-primary text-glow text-center mb-6">COMPARE PLANS</h2>
          <div className="overflow-x-auto">
            <ComparisonTable />
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-display text-sm text-primary text-glow text-center mb-6">ONE-TIME PURCHASES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {oneTimePurchases.map((item) => (
              <Card key={item.name} className="border-border hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{item.name}</CardTitle>
                  <CardDescription className="text-xs">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-xl font-bold text-foreground">{item.price}</span>
                  <Button size="sm" variant="outline" className="text-xs">
                    Buy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm text-primary text-glow text-center mb-6">ADD-ONS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {addOns.map((item) => (
              <Card key={item.name} className="border-border hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{item.name}</CardTitle>
                  <CardDescription className="text-xs">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-lg font-bold text-foreground">{item.price}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <LandingFooter />
      <MobileBottomNav />
    </div>
  );
};

export default Pricing;
