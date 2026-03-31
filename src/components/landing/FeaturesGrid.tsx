import { motion } from 'framer-motion';
import { Globe, BarChart3, Shield, Bot, Zap, Link2 } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI Content Studio',
    desc: 'Need memes? Stickers? Shilling copy? Our AI generates marketing assets tailored to your token\'s personality.',
    span: 'sm:col-span-2',
  },
  {
    icon: Link2,
    title: 'Multi-Chain DNA',
    desc: 'Supports Solana, Base, Ethereum, and BSC. Wherever the liquidity goes, we follow.',
    span: '',
  },
  {
    icon: BarChart3,
    title: 'Auto-Generated Tokenomics',
    desc: 'Beautiful donut charts and tax breakdowns that update in real-time from on-chain data.',
    span: '',
  },
  {
    icon: Shield,
    title: 'Trust Signals Built-In',
    desc: 'One-click integration for LP locks, audit badges, and "Mint Revoked" tags to prove you\'re legit.',
    span: 'sm:col-span-2',
  },
  {
    icon: Zap,
    title: 'Lightning-Fast Hosting',
    desc: 'Built on serverless infrastructure. No matter how hard you\'re being botted, your site stays up.',
    span: '',
  },
  {
    icon: Globe,
    title: 'Custom Domains',
    desc: 'Connect your own domain for a professional, branded online presence that builds trust.',
    span: '',
  },
];

const FeaturesGrid = () => {
  return (
    <section id="features" className="section-padding py-12 sm:py-20 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-block text-[11px] text-muted-foreground tracking-[0.2em] font-medium uppercase mb-4 border border-[hsla(0,0%,100%,0.08)] rounded-full px-4 py-1.5">THE TOOLKIT</span>
          <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-[36px] text-foreground mt-3 mb-3 tracking-tight leading-tight">
            Everything you need to <span className="text-primary">dominate</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Punchy features, built for degens who move fast and ship faster.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`group rounded-xl p-5 bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-[hsla(0,0%,100%,0.1)] transition-colors ${f.span}`}
            >
              <div className="w-9 h-9 rounded-lg bg-[hsla(0,0%,100%,0.05)] flex items-center justify-center mb-3">
                <f.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-foreground text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
