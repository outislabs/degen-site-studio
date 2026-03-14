import { motion } from 'framer-motion';
import { Link2, Palette, Rocket, ChevronRight } from 'lucide-react';

const steps = [
  { icon: Link2, num: '01', title: 'Import Your Token', desc: 'Paste any Pump.fun, DexScreener, or Jupiter link to auto-fill your token data.' },
  { icon: Palette, num: '02', title: 'Customize & Style', desc: 'Pick a theme, add socials, tokenomics, and roadmap — all drag-and-drop simple.' },
  { icon: Rocket, num: '03', title: 'Publish & Share', desc: 'One click to go live. Get a shareable link or connect your own domain.' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="px-6 py-20 relative">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="font-display text-xs text-primary tracking-wider mb-3">HOW IT WORKS</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">Three steps. Zero code. Live in minutes.</p>
      </div>

      <div className="relative flex flex-col gap-10 sm:gap-0 sm:flex-row sm:justify-between items-center sm:items-start">
        {steps.map((s, i) => (
          <div key={i} className="contents">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex-1 flex flex-col items-center text-center relative z-10"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-5 transition-colors">
                <s.icon className="w-8 h-8 text-primary" />
              </div>
              <span className="font-display text-[10px] text-primary/40 mb-2">{s.num}</span>
              <h3 className="font-semibold text-foreground text-sm mb-2">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">{s.desc}</p>
            </motion.div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <>
                {/* Desktop: horizontal arrow */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.1 }}
                  className="hidden sm:flex items-center justify-center self-center mt-[-40px] mx-2"
                >
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((d) => (
                      <motion.div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-primary/30"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: d * 0.2 }}
                      />
                    ))}
                    <ChevronRight className="w-4 h-4 text-primary/40 ml-0.5" />
                  </div>
                </motion.div>

                {/* Mobile: vertical dots */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.1 }}
                  className="flex sm:hidden flex-col items-center gap-1.5 py-1"
                >
                  {[0, 1, 2].map((d) => (
                    <motion.div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-primary/30"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: d * 0.2 }}
                    />
                  ))}
                </motion.div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
