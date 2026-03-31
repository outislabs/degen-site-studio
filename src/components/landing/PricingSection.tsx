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
    <section id="pricing" className="section-padding py-12 sm:py-20 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-block text-[11px] text-muted-foreground tracking-[0.2em] font-medium uppercase mb-4 border border-[hsla(0,0%,100%,0.08)] rounded-full px-4 py-1.5">PRICING</span>
          <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-[36px] text-foreground mt-3 mb-3 tracking-tight leading-tight">
            Choose your <span className="text-primary">degen energy</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Start free. Upgrade when you're ready to go full send.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'relative rounded-xl p-5 flex flex-col transition-colors',
                  'bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-[hsla(0,0%,100%,0.1)]',
                  plan.popular && 'border-primary/30 hover:border-primary/40'
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold tracking-wider px-3 py-0.5">
                    MOST POPULAR
                  </Badge>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[hsla(0,0%,100%,0.05)] flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="font-heading font-bold text-sm text-foreground">{plan.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-2xl font-heading font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>

                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className={cn(
                        'w-3 h-3 mt-0.5 shrink-0',
                        plan.popular ? 'text-primary' : 'text-muted-foreground/40'
                      )} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  variant={plan.popular ? 'default' : 'outline'}
                  className={cn(
                    'w-full text-xs rounded-lg py-4',
                    plan.popular && 'box-glow',
                    !plan.popular && 'border-[hsla(0,0%,100%,0.1)] text-muted-foreground hover:text-foreground'
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
          className="text-center text-xs text-muted-foreground/40 mt-6"
        >
          Or hold 15M+ $DEGENTOOLS for free Degen access • All plans billed monthly • Pay with crypto via NOWPayments
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
