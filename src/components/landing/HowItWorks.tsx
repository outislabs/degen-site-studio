import { motion } from 'framer-motion';
import { Link2, Palette, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    num: '01',
    title: 'Import Your Alpha',
    desc: 'Paste any link from Bags.fm, Pump.fun, or DexScreener. We auto-fill your tokenomics, charts, and contract data instantly.',
    mockContent: (
      <div className="mt-3 rounded-lg bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] p-3 space-y-2">
        <div className="text-[8px] sm:text-[9px] text-muted-foreground/50 font-medium">Paste token address</div>
        <div className="h-6 rounded-md bg-[hsla(0,0%,100%,0.04)] border border-[hsla(0,0%,100%,0.08)] flex items-center px-2">
          <span className="text-[7px] sm:text-[8px] text-muted-foreground/40 font-mono truncate">DyTPvbT4AAP7s8LBGmAcmU98...</span>
        </div>
        <div className="flex gap-1.5">
          <div className="h-4 flex-1 rounded bg-[hsla(0,0%,100%,0.05)]" />
          <div className="h-4 flex-1 rounded bg-[hsla(0,0%,100%,0.03)]" />
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
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {[0.06, 0.04, 0.04, 0.03, 0.05, 0.03].map((op, i) => (
          <div key={i} className={`aspect-[16/10] rounded-md border ${i === 0 ? 'border-primary/30 bg-primary/5' : 'border-[hsla(0,0%,100%,0.06)]'}`} style={i !== 0 ? { backgroundColor: `hsla(0,0%,100%,${op})` } : {}} />
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
      <div className="mt-3 rounded-lg bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[8px] sm:text-[9px] text-primary font-medium">Site is live!</span>
        </div>
        <div className="h-5 rounded bg-[hsla(0,0%,100%,0.04)] border border-[hsla(0,0%,100%,0.06)] flex items-center px-2">
          <span className="text-[7px] sm:text-[8px] text-muted-foreground/40">yourtoken.degentools.co</span>
        </div>
        <div className="flex gap-1.5">
          <div className="h-3 w-10 rounded bg-primary/15 text-[6px] text-primary flex items-center justify-center">Share</div>
          <div className="h-3 w-10 rounded bg-[hsla(0,0%,100%,0.04)] text-[6px] text-muted-foreground/40 flex items-center justify-center">Edit</div>
        </div>
      </div>
    ),
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="section-padding py-12 sm:py-20 relative">
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-12"
      >
        <span className="inline-block text-[11px] text-muted-foreground tracking-[0.2em] font-medium uppercase mb-4 border border-[hsla(0,0%,100%,0.08)] rounded-full px-4 py-1.5">HOW IT WORKS</span>
        <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-[36px] text-foreground mt-3 mb-3 tracking-tight leading-tight">
          Zero Code. Zero Hosting. <span className="text-primary">Total Domination.</span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
          From token link to live website in under 5 minutes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
        <div className="hidden sm:block absolute top-16 left-[20%] right-[20%] h-px bg-[hsla(0,0%,100%,0.06)]" />

        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl p-5 bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-[hsla(0,0%,100%,0.1)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[hsla(0,0%,100%,0.05)] flex items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground/50 font-mono font-bold">{s.num}</span>
            </div>
            <h3 className="font-heading font-semibold text-foreground text-sm mb-1.5">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            {s.mockContent}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
