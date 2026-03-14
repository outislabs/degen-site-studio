import { motion } from 'framer-motion';
import { Zap, Palette, BarChart3, Link2, Shield, Globe } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant Deploy',
    desc: 'Zero to live in under 5 minutes. No code, no hosting hassle.',
    color: 'hsl(var(--primary))',
  },
  {
    icon: Link2,
    title: 'Multi-Chain Import',
    desc: 'Paste any Pump.fun, DexScreener, Jupiter, or Raydium link to auto-fill.',
    color: 'hsl(var(--neon-blue))',
  },
  {
    icon: Palette,
    title: '6 Degen Themes',
    desc: 'From Degen Dark to Arctic Whale. Each theme crafted for maximum impact.',
    color: 'hsl(var(--neon-purple))',
  },
  {
    icon: BarChart3,
    title: 'Tokenomics Charts',
    desc: 'Auto-generated donut charts, tax breakdowns, and supply visuals.',
    color: 'hsl(var(--neon-pink))',
  },
  {
    icon: Shield,
    title: 'Trust Signals',
    desc: 'LP lock status, contract address copy, and audit badges built-in.',
    color: 'hsl(var(--primary))',
  },
  {
    icon: Globe,
    title: 'Custom Domains',
    desc: 'Connect your own domain for a professional, branded presence.',
    color: 'hsl(var(--neon-blue))',
  },
];

const FeaturesGrid = () => {
  return (
    <section className="px-6 py-20 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-xs text-primary tracking-wider mb-3">FEATURES</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Everything you need to launch a meme coin site that actually looks legit.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group gradient-card border border-border rounded-xl p-6 hover:border-primary/20 transition-all"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${f.color}15` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
