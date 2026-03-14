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
    <section id="pricing" className="section-padding py-16 sm:py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[800px] h-[300px] bg-primary/3 blur-[150px] sm:blur-[200px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="inline-block font-display text-[9px] sm:text-[10px] text-primary tracking-[0.3em] mb-4 bg-primary/5 border border-primary/10 rounded-full px-4 sm:px-5 py-2">PRICING</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-4 mb-3 sm:mb-4">
            Choose your <span className="text-primary text-glow">degen energy</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-md mx-auto px-2">
            Start free. Upgrade when you're ready to go full send.
          </p>
        </motion.div>

        {/* Mobile: scroll horizontally. Desktop: grid */}
        <div className="flex lg:grid lg:grid-cols-5 gap-4 sm:gap-5 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={cn(
                  'relative gradient-card border rounded-2xl p-5 sm:p-6 flex flex-col transition-all duration-300 hover:scale-[1.02] snap-center shrink-0 w-[260px] sm:w-[280px] lg:w-auto',
                  plan.popular
                    ? 'border-primary/40 shadow-[0_0_50px_hsl(var(--primary)/0.1)] ring-1 ring-primary/30'
                    : 'border-border hover:border-primary/20'
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] sm:text-[9px] font-display tracking-wider px-3 sm:px-4 py-1">
                    MOST POPULAR
                  </Badge>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    'w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center',
                    plan.popular ? 'bg-primary/15' : 'bg-secondary'
                  )}>
                    <Icon className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', plan.popular ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <span className="font-bold text-sm sm:text-base text-foreground">{plan.name}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">{plan.description}</p>

                <div className="mb-4 sm:mb-5">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">/mo</span>
                </div>

                <ul className="space-y-2 flex-1 mb-5 sm:mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[10px] sm:text-xs text-muted-foreground">
                      <Check className={cn(
                        'w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 shrink-0',
                        plan.popular ? 'text-primary' : 'text-muted-foreground/50'
                      )} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  variant={plan.popular ? 'default' : 'outline'}
                  className={cn(
                    'w-full text-[10px] sm:text-xs rounded-xl py-4 sm:py-5',
                    plan.popular && 'box-glow'
                  )}
                  onClick={onGetStarted}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-[10px] sm:text-xs text-muted-foreground/60 mt-6 sm:mt-8">
          All plans billed monthly. Pay with crypto via NOWPayments.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
