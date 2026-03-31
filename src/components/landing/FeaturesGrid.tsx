import { motion } from 'framer-motion';
import { Globe, BarChart3, Shield, Bot, Zap, Link2 } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI Content Studio',
    desc: 'Need memes? Stickers? Shilling copy? Our AI generates marketing assets tailored to your token\'s personality.',
    iconBg: 'bg-neon-purple/15',
    iconColor: 'text-neon-purple',
    span: 'sm:col-span-2',
  },
  {
    icon: Link2,
    title: 'Multi-Chain DNA',
    desc: 'Supports Solana, Base, Ethereum, and BSC. Wherever the liquidity goes, we follow.',
    iconBg: 'bg-neon-blue/15',
    iconColor: 'text-neon-blue',
    span: '',
  },
  {
    icon: BarChart3,
    title: 'Auto-Generated Tokenomics',
    desc: 'Beautiful donut charts and tax breakdowns that update in real-time from on-chain data.',
    iconBg: 'bg-neon-pink/15',
    iconColor: 'text-neon-pink',
    span: '',
  },
  {
    icon: Shield,
    title: 'Trust Signals Built-In',
    desc: 'One-click integration for LP locks, audit badges, and "Mint Revoked" tags to prove you\'re legit.',
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
    span: 'sm:col-span-2',
  },
  {
    icon: Zap,
    title: 'Lightning-Fast Hosting',
    desc: 'Built on serverless infrastructure. No matter how hard you\'re being botted, your site stays up.',
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
    span: '',
  },
  {
    icon: Globe,
    title: 'Custom Domains',
    desc: 'Connect your own domain for a professional, branded online presence that builds trust.',
    iconBg: 'bg-neon-blue/15',
    iconColor: 'text-neon-blue',
    span: '',
  },
];

const FeaturesGrid = () => {
  return (
    <section id="features" className="section-padding py-16 sm:py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[300px] bg-primary/3 blur-[200px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block text-[10px] sm:text-xs text-primary tracking-[0.2em] font-semibold uppercase mb-4 bg-primary/5 border border-primary/10 rounded-full px-5 py-2">THE TOOLKIT</span>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-foreground mt-4 mb-3 sm:mb-4 tracking-tight">
            Everything you need to <span className="text-primary text-glow">dominate</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto px-2">
            Punchy features, built for degens who move fast and ship faster.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`group glass-card-hover rounded-2xl p-5 sm:p-7 ${f.span}`}
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-110`}>
                <f.icon className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${f.iconColor}`} />
              </div>
              <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base mb-1.5 sm:mb-2">{f.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
