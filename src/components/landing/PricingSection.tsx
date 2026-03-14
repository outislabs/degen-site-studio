import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Crown, Star, Diamond } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  onGetStarted: () => void;
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    icon: Zap,
    description: 'Get started with the basics',
    features: ['1 coin website', '3 meme downloads/mo', 'Basic templates', 'Branded subdomain'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Degen',
    price: '$19',
    icon: Rocket,
    description: 'For serious degens',
    features: ['Custom domain', 'No watermark', 'All templates', '50 meme downloads/mo', 'Basic shill templates'],
    cta: 'Go Degen',
    popular: false,
  },
  {
    name: 'Creator',
    price: '$49',
    icon: Crown,
    description: 'Full creative suite',
    features: ['3 coin websites', 'Full content studio', 'Unlimited downloads', 'Sticker pack builder', 'Brand kit & launch kit'],
    cta: 'Start Creating',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$99',
    icon: Star,
    description: 'Advanced tools & automation',
    features: ['10 coin websites', 'Telegram buy bot', 'Whale alerts', 'Audit badge', 'Multi-platform blast'],
    cta: 'Go Pro',
    popular: false,
  },
  {
    name: 'Whale',
    price: '$249',
    icon: Diamond,
    description: 'Unlimited everything',
    features: ['Unlimited websites', 'Analytics dashboard', 'API access', 'White label', 'Priority support'],
    cta: 'Go Whale',
    popular: false,
  },
];

const PricingSection = ({ onGetStarted }: Props) => {
  return (
    <section id="pricing" className="px-6 py-20 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-xs sm:text-sm text-primary tracking-wider mb-3">PRICING</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Choose the plan that matches your degen energy. Upgrade anytime.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'relative gradient-card border rounded-xl p-6 flex flex-col transition-all hover:scale-[1.02]',
                  plan.popular
                    ? 'border-primary shadow-[0_0_30px_hsl(var(--primary)/0.15)] ring-1 ring-primary'
                    : 'border-border hover:border-primary/30'
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-display">
                    MOST POPULAR
                  </Badge>
                )}

                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn('w-4 h-4', plan.popular ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="font-bold text-sm text-foreground">{plan.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-3">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>

                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                      <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  variant={plan.popular ? 'default' : 'outline'}
                  className="w-full text-xs"
                  onClick={onGetStarted}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          All plans billed monthly. Pay with crypto via NOWPayments.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
