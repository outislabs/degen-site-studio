import { motion } from 'framer-motion';
import { Zap, Palette, BarChart3, Link2, Shield, Globe } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant Deploy',
    desc: 'Zero to live in under 5 minutes. No code, no hosting hassle.',
    gradient: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
  },
  {
    icon: Link2,
    title: 'Multi-Chain Import',
    desc: 'Paste any Pump.fun, DexScreener, Jupiter, or Raydium link to auto-fill your token data.',
    gradient: 'from-neon-blue/20 to-neon-blue/5',
    iconColor: 'text-neon-blue',
  },
  {
    icon: Palette,
    title: '19 Degen Themes',
    desc: 'From Degen Dark to Midnight Chrome. Each theme is crafted for maximum visual impact.',
    gradient: 'from-neon-purple/20 to-neon-purple/5',
    iconColor: 'text-neon-purple',
  },
  {
    icon: BarChart3,
    title: 'Tokenomics Charts',
    desc: 'Auto-generated donut charts, tax breakdowns, and supply distribution visuals.',
    gradient: 'from-neon-pink/20 to-neon-pink/5',
    iconColor: 'text-neon-pink',
  },
  {
    icon: Shield,
    title: 'Trust Signals',
    desc: 'LP lock status, contract address copy, and audit badges built right in.',
    gradient: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
  },
  {
    icon: Globe,
    title: 'Custom Domains',
    desc: 'Connect your own domain for a professional, branded online presence.',
    gradient: 'from-neon-blue/20 to-neon-blue/5',
    iconColor: 'text-neon-blue',
  },
];

const FeaturesGrid = () => {
  return (
    <section id="features" className="section-padding py-10 sm:py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] bg-primary/3 blur-[150px] sm:blur-[200px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="inline-block font-display text-[9px] sm:text-[10px] text-primary tracking-[0.3em] mb-4 bg-primary/5 border border-primary/10 rounded-full px-4 sm:px-5 py-2">FEATURES</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-4 mb-3 sm:mb-4">
            Everything you need to <span className="text-primary text-glow">launch</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-lg mx-auto px-2">
            A complete toolkit for building meme coin sites that actually look legit.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group relative gradient-card border border-border rounded-2xl p-5 sm:p-7 hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.05)]"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-110`}>
                <f.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${f.iconColor}`} />
              </div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1.5 sm:mb-2">{f.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
