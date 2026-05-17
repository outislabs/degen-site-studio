import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, LineChart, Zap, Radar } from 'lucide-react';
import terminalHot from '@/assets/terminal-hot.png';
import terminalDiscover from '@/assets/terminal-discover.png';
import terminalChart from '@/assets/terminal-chart.png';

const TerminalSection = () => {
  return (
    <section className="section-padding py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary">Live Now</span>
            </div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 tracking-tight leading-[1.05]">
              Meet the <span className="text-primary">Degen Terminal</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed max-w-lg">
              A mobile-first trading terminal for Solana, BSC and beyond. Discover trending tokens, snipe new launches, and trade from one screen — built for degens, by degens.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { icon: Radar, label: 'Real-time discovery across pump.fun, Bags, Bonk & Raydium' },
                { icon: LineChart, label: 'Pro charts with multi-timeframe candles & volume' },
                { icon: Zap, label: 'One-tap sniper, portfolio tracking & wallet sync' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => window.open('https://terminal.degentools.co', '_blank')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm px-8 py-6 box-glow rounded-xl group"
              >
                Open Terminal
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <div className="flex items-center px-4 text-xs font-mono text-muted-foreground">
                terminal.degentools.co
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative h-[480px] sm:h-[560px]"
          >
            <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent blur-2xl" />
            <img
              src={terminalDiscover}
              alt="Degen Terminal discover feed"
              className="absolute left-0 top-4 w-[48%] rounded-2xl border border-[hsla(0,0%,100%,0.08)] shadow-2xl -rotate-6"
            />
            <img
              src={terminalChart}
              alt="Degen Terminal chart view"
              className="absolute right-0 top-0 w-[52%] rounded-2xl border border-[hsla(0,0%,100%,0.08)] shadow-2xl rotate-3 z-10"
            />
            <img
              src={terminalHot}
              alt="Degen Terminal hot tokens"
              className="absolute left-1/4 bottom-0 w-[48%] rounded-2xl border border-[hsla(0,0%,100%,0.08)] shadow-2xl rotate-2 z-20"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TerminalSection;