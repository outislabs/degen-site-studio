import { motion } from 'framer-motion';
import { Link2, Palette, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    num: '01',
    title: 'Import Your Alpha',
    desc: 'Paste any link from Bags.fm, Pump.fun, or DexScreener. We auto-fill your tokenomics, charts, and contract data instantly.',
    mockContent: (
      <div className="mt-4 rounded-lg bg-background/60 border border-border/30 p-3 space-y-2">
        <div className="text-[8px] sm:text-[9px] text-muted-foreground/60 font-medium">Paste token address</div>
        <div className="h-6 sm:h-7 rounded-md bg-primary/8 border border-primary/20 flex items-center px-2">
          <span className="text-[7px] sm:text-[8px] text-primary/60 font-mono truncate">DyTPvbT4AAP7s8LBGmAcmU98...</span>
        </div>
        <div className="flex gap-1.5">
          <div className="h-4 flex-1 rounded bg-primary/15" />
          <div className="h-4 flex-1 rounded bg-primary/10" />
        </div>
      </div>
    ),
  },
  {
    icon: Palette,
    num: '02',
    title: 'Choose Your Vibe',
    desc: 'Select from 24+ themes. Fully customizable, mobile-optimized, and built for speed.',
    mockContent: (
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {[
          'bg-gradient-to-br from-primary/20 to-primary/5',
          'bg-gradient-to-br from-neon-purple/20 to-neon-purple/5',
          'bg-gradient-to-br from-neon-pink/20 to-neon-pink/5',
          'bg-gradient-to-br from-neon-blue/20 to-neon-blue/5',
          'bg-gradient-to-br from-primary/15 to-neon-blue/10',
          'bg-gradient-to-br from-neon-pink/15 to-neon-purple/10',
        ].map((bg, i) => (
          <div key={i} className={`aspect-[16/10] rounded-md ${bg} border ${i === 0 ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border/20'}`} />
        ))}
      </div>
    ),
  },
  {
    icon: Rocket,
    num: '03',
    title: 'Ship & Shill',
    desc: 'One-click deploy to a custom domain. Your site is live, secured, and ready to handle the candle.',
    mockContent: (
      <div className="mt-4 rounded-lg bg-background/60 border border-primary/20 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-[8px] sm:text-[9px] text-primary font-medium">Site is live!</span>
        </div>
        <div className="h-5 rounded bg-primary/8 border border-primary/15 flex items-center px-2">
          <span className="text-[7px] sm:text-[8px] text-muted-foreground/60">yourtoken.degentools.co</span>
        </div>
        <div className="flex gap-1.5">
          <div className="h-3 w-10 rounded bg-primary/20 text-[6px] text-primary flex items-center justify-center">Share</div>
          <div className="h-3 w-10 rounded bg-secondary/40 text-[6px] text-muted-foreground/60 flex items-center justify-center">Edit</div>
        </div>
      </div>
    ),
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="section-padding py-16 sm:py-28 relative">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[250px] bg-neon-purple/3 blur-[150px] rounded-full" />
    </div>

    <div className="max-w-6xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12 sm:mb-16"
      >
        <span className="inline-block text-[10px] sm:text-xs text-primary tracking-[0.2em] font-semibold uppercase mb-4 bg-primary/5 border border-primary/10 rounded-full px-5 py-2">HOW IT WORKS</span>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-foreground mt-4 mb-3 sm:mb-4 tracking-tight">
          Zero Code. Zero Hosting. <span className="text-primary text-glow">Total Domination.</span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto px-2">
          From token link to live website in under 5 minutes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 relative">
        {/* Connector line (desktop) */}
        <div className="hidden sm:block absolute top-20 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="glass-card-hover rounded-2xl p-5 sm:p-6 relative"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/15 flex items-center justify-center">
                <span className="text-[8px] text-primary font-bold">{s.num}</span>
              </div>
            </div>
            <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base mb-2">{s.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            {s.mockContent}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
