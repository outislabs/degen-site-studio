import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Crown, Diamond } from 'lucide-react';
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
    features: ['1 coin website', 'DegenTools watermark', '5 meme downloads/mo', 'Basic templates'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Degen',
    price: '$19',
    icon: Rocket,
    description: 'For serious degens',
    features: ['3 coin websites', 'Custom domain', 'No watermark', 'All templates', '50 meme downloads/mo'],
    cta: 'Go Degen',
    popular: true,
  },
  {
    name: 'Creator',
    price: '$49',
    icon: Crown,
    description: 'Full creative suite',
    features: ['10 coin websites', 'Full content studio', 'Unlimited downloads', 'Sticker pack builder', 'Priority support'],
    cta: 'Start Creating',
    popular: false,
  },
  {
    name: 'Whale',
    price: '$99',
    icon: Diamond,
    description: 'Unlimited everything',
    features: ['Unlimited websites', 'Analytics dashboard', 'API access', 'White label', 'Everything in Creator'],
    cta: 'Go Whale',
    popular: false,
  },
];

const PricingSection = ({ onGetStarted }: Props) => {
  return (
    <section id="pricing" className="section-padding py-16 sm:py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[300px] bg-primary/3 blur-[200px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block text-[10px] sm:text-xs text-primary tracking-[0.2em] font-semibold uppercase mb-4 bg-primary/5 border border-primary/10 rounded-full px-5 py-2">PRICING</span>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-foreground mt-4 mb-3 sm:mb-4 tracking-tight">
            Choose your <span className="text-primary text-glow">degen energy</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto px-2">
            Start free. Upgrade when you're ready to go full send.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
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
                  'relative rounded-2xl p-5 sm:p-6 flex flex-col transition-all duration-300 hover:translate-y-[-2px]',
                  plan.popular
                    ? 'glass-card gradient-border-green shadow-[0_0_60px_hsla(142,76%,46%,0.08)]'
                    : 'glass-card hover:bg-[hsla(0,0%,100%,0.06)]'
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold tracking-wider px-4 py-1">
                    MOST POPULAR
                  </Badge>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center',
                    plan.popular ? 'bg-primary/15' : 'bg-secondary/60'
                  )}>
                    <Icon className={cn('w-4 h-4', plan.popular ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <span className="font-heading font-bold text-sm sm:text-base text-foreground">{plan.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>

                <div className="mb-5">
                  <span className="text-3xl font-heading font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Check className={cn(
                        'w-3.5 h-3.5 mt-0.5 shrink-0',
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
                    'w-full text-xs rounded-xl py-5',
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

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground/50 mt-8"
        >
          Or hold 15M+ $DEGENTOOLS for free Degen access • All plans billed monthly • Pay with crypto via NOWPayments
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
