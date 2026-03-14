import { motion } from 'framer-motion';
import { Link2, Palette, Rocket } from 'lucide-react';

const steps = [
  { icon: Link2, num: '01', title: 'Import Your Token', desc: 'Paste any Pump.fun, DexScreener, or Jupiter link to auto-fill your token data instantly.' },
  { icon: Palette, num: '02', title: 'Customize & Style', desc: 'Pick a theme, add socials, tokenomics, and roadmap — all drag-and-drop simple.' },
  { icon: Rocket, num: '03', title: 'Publish & Share', desc: 'One click to go live. Get a shareable link or connect your own custom domain.' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="px-6 py-24 relative">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-neon-purple/3 blur-[150px] rounded-full" />
    </div>

    <div className="max-w-5xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="inline-block font-display text-[10px] text-primary tracking-[0.3em] mb-4 bg-primary/5 border border-primary/10 rounded-full px-5 py-2">HOW IT WORKS</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-4 mb-4">
          Three steps. <span className="text-primary text-glow">Zero code.</span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
          From token link to live website in under 5 minutes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
        {/* Connector line (desktop) */}
        <div className="hidden sm:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="flex flex-col items-center text-center relative"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 flex items-center justify-center transition-all hover:scale-105 hover:border-primary/30">
                <s.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="font-display text-[8px] text-primary">{s.num}</span>
              </div>
            </div>
            <h3 className="font-semibold text-foreground text-base mb-3">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
