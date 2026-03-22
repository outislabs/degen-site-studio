import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Crown, Star, Diamond, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  onGetStarted: () => void;
}

const heroPlans = [
  {
    name: 'Starter',
    price: '$2.50',
    icon: Zap,
    description: '7-day free trial included',
    features: [
      '1 coin website',
      'Basic templates',
      'Branded subdomain',
      '3 meme downloads/mo',
      'DegenTools watermark',
      'Community support',
    ],
    cta: 'Start Free Trial',
    popular: false,
    trial: true,
  },
  {
    name: 'Degen',
    price: '$19',
    icon: Rocket,
    description: 'For serious degens',
    features: [
      'Custom domain',
      'No watermark',
      'All templates',
      '50 meme downloads/mo',
      'Basic shill templates',
      'Priority support',
    ],
    cta: 'Go Degen',
    popular: true,
    trial: false,
  },
];

const compactPlans = [
  {
    name: 'Creator',
    price: '$49',
    icon: Crown,
    description: 'Full creative suite',
    highlight: '3 sites · Content studio · Sticker packs',
    trial: false,
  },
  {
    name: 'Pro',
    price: '$99',
    icon: Star,
    description: 'Advanced tools',
    highlight: '10 sites · Telegram bot · Whale alerts · Audit badge',
    trial: false,
  },
  {
    name: 'Whale',
    price: '$249',
    icon: Diamond,
    description: 'Unlimited everything',
    highlight: 'Unlimited sites · API · White label · Priority',
    trial: false,
  },
];

const PricingSection = ({ onGetStarted }: Props) => {
  return (
    <section id="pricing" className="section-padding py-10 sm:py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[800px] h-[300px] bg-primary/3 blur-[150px] sm:blur-[200px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-block font-display text-[9px] sm:text-[10px] text-primary tracking-[0.3em] mb-4 bg-primary/5 border border-primary/10 rounded-full px-4 sm:px-5 py-2">
            PRICING
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-4 mb-3 sm:mb-4">
            Choose your <span className="text-primary text-glow">degen energy</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-md mx-auto px-2">
            Most degens pick Creator or Pro. Start with a 7-day free trial on Starter.
          </p>
        </motion.div>

        {/* Hero Plans - Creator & Pro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {heroPlans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'relative rounded-2xl p-6 sm:p-8 flex flex-col transition-all duration-300',
                  plan.popular
                    ? 'bg-gradient-to-b from-primary/10 via-card to-card border-2 border-primary/40 shadow-[0_0_60px_hsl(var(--primary)/0.12)] ring-1 ring-primary/20'
                    : 'gradient-card border border-border hover:border-primary/20'
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] sm:text-[9px] font-display tracking-wider px-4 py-1">
                    MOST POPULAR
                  </Badge>
                )}
                {plan.trial && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary/20 text-primary text-[8px] sm:text-[9px] font-display tracking-wider px-4 py-1 border border-primary/30">
                    7-DAY FREE TRIAL
                  </Badge>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center',
                      plan.popular ? 'bg-primary/15' : 'bg-secondary'
                    )}>
                      <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', plan.popular ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <div>
                      <span className="font-bold text-base sm:text-lg text-foreground block">{plan.name}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{plan.description}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className={cn(
                        'w-3.5 h-3.5 mt-0.5 shrink-0',
                        plan.popular ? 'text-primary' : 'text-muted-foreground/50'
                      )} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  variant={plan.popular ? 'default' : 'outline'}
                  className={cn(
                    'w-full text-xs sm:text-sm rounded-xl',
                    plan.popular && 'box-glow'
                  )}
                  onClick={onGetStarted}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Compact Plans - Starter, Degen, Whale */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          {compactPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <button
                key={plan.name}
                onClick={onGetStarted}
                className="group relative gradient-card border border-border rounded-xl p-4 sm:p-5 text-left transition-all duration-300 hover:border-primary/25 hover:scale-[1.02]"
              >
                {plan.trial && (
                  <Badge className="absolute -top-2.5 right-4 bg-primary/20 text-primary text-[7px] sm:text-[8px] font-display tracking-wider px-3 py-0.5 border border-primary/30">
                    7-DAY FREE TRIAL
                  </Badge>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm text-foreground">{plan.name}</span>
                    <span className="text-lg font-bold text-foreground">{plan.price}</span>
                    <span className="text-[10px] text-muted-foreground">/mo</span>
                  </div>
                </div>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                  {plan.highlight}
                </p>
              </button>
            );
          })}
        </motion.div>

        <p className="text-center text-[10px] sm:text-xs text-muted-foreground/60 mt-6 sm:mt-8">
          All plans billed monthly. Pay with crypto via NOWPayments.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
