import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import bagsfmLogo from '@/assets/integrations/bagsfm.png';
import pumpfunLogo from '@/assets/integrations/pumpfun.png';
import dexscreenerLogo from '@/assets/integrations/dexscreener.png';
import raydiumLogo from '@/assets/integrations/raydium.png';
import jupiterLogo from '@/assets/integrations/jupiter.svg';
import solanaLogo from '@/assets/integrations/solana.png';
import ethereumLogo from '@/assets/integrations/ethereum.png';
import baseLogo from '@/assets/integrations/base.png';
import bscLogo from '@/assets/integrations/bsc.png';

const integrations = [
  { name: 'Bags.fm', logo: bagsfmLogo },
  { name: 'Pump.fun', logo: pumpfunLogo },
  { name: 'DexScreener', logo: dexscreenerLogo },
  { name: 'Raydium', logo: raydiumLogo },
  { name: 'Jupiter', logo: jupiterLogo },
  { name: 'Solana', logo: solanaLogo },
  { name: 'Ethereum', logo: ethereumLogo },
  { name: 'Base', logo: baseLogo },
  { name: 'BSC', logo: bscLogo },
];

interface Props {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: Props) => {
  return (
    <section className="relative section-padding pt-20 sm:pt-32 md:pt-40 pb-8 sm:pb-16 overflow-hidden">
      {/* Gradient mesh background with spotlight */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] sm:w-[1200px] h-[600px] sm:h-[800px] rounded-full bg-[radial-gradient(ellipse,_hsla(160,50%,20%,0.15)_0%,_hsla(142,76%,46%,0.06)_40%,_transparent_70%)]" />
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(ellipse,_hsla(180,40%,15%,0.1)_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 left-[15%] w-[500px] h-[400px] rounded-full bg-[radial-gradient(ellipse,_hsla(270,40%,15%,0.06)_0%,_transparent_60%)]" />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(hsla(0,0%,100%,0.5) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.5) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge with pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6 sm:mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-[10px] sm:text-xs text-primary font-medium tracking-wide">Now with multi-chain import</span>
          </motion.div>

          {/* Heading — modern sans-serif */}
          <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] sm:leading-[1.05] mb-5 sm:mb-8 tracking-tight">
            The Ultimate<br />
            <span className="text-primary text-glow">Meme Coin Toolkit</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8 sm:mb-12 px-2">
            Everything your meme coin needs in less than 5 minutes — website, memes, shills, and more. Built for devs who move fast and ship faster.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold text-xs sm:text-sm px-8 sm:px-12 py-6 sm:py-7 box-glow group rounded-xl"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Building for Free
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onGetStarted}
              className="w-full sm:w-auto border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30 font-heading font-medium text-xs sm:text-sm px-8 sm:px-12 py-6 sm:py-7 rounded-xl backdrop-blur-sm"
            >
              View Live Demo
            </Button>
          </div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 sm:mt-8 text-[10px] sm:text-xs text-muted-foreground/50"
          >
            Join 500+ devs launching on Solana, Base, and Ethereum.
          </motion.p>
        </motion.div>

        {/* Product screenshot mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 sm:mt-16 relative mx-auto max-w-4xl"
        >
          {/* Glow behind the screenshot */}
          <div className="absolute -inset-8 sm:-inset-12 bg-[radial-gradient(ellipse,_hsla(142,76%,46%,0.08)_0%,_transparent_60%)] rounded-3xl pointer-events-none" />

          {/* Browser chrome frame */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-border/40 shadow-2xl shadow-black/50 bg-card/80 backdrop-blur-sm" style={{ transform: 'perspective(1200px) rotateX(2deg)' }}>
            {/* Title bar */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-secondary/80 border-b border-border/40">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-destructive/70" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary/70" />
              </div>
              <div className="flex-1 mx-3 sm:mx-6">
                <div className="h-5 sm:h-6 rounded-md bg-background/60 border border-border/30 flex items-center justify-center">
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground/50">degentools.co/builder</span>
                </div>
              </div>
            </div>

            {/* Mock builder content */}
            <div className="p-3 sm:p-6 bg-background/90">
              <div className="grid grid-cols-12 gap-3 sm:gap-4">
                {/* Sidebar */}
                <div className="col-span-3 space-y-2 sm:space-y-3">
                  <div className="h-6 sm:h-8 rounded-md bg-primary/10 border border-primary/20" />
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-5 sm:h-7 rounded-md ${i === 1 ? 'bg-primary/15 border border-primary/25' : 'bg-secondary/60'}`} />
                  ))}
                </div>
                {/* Main preview area */}
                <div className="col-span-9 rounded-lg sm:rounded-xl border border-border/30 bg-card/50 overflow-hidden">
                  {/* Mock hero */}
                  <div className="p-4 sm:p-8 space-y-2 sm:space-y-3 text-center bg-gradient-to-b from-primary/5 to-transparent">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-primary/20 mx-auto" />
                    <div className="h-3 sm:h-4 w-24 sm:w-32 rounded bg-foreground/20 mx-auto" />
                    <div className="h-2 sm:h-3 w-32 sm:w-48 rounded bg-muted-foreground/10 mx-auto" />
                    <div className="flex gap-2 justify-center pt-1 sm:pt-2">
                      <div className="h-5 sm:h-7 w-14 sm:w-20 rounded-md bg-primary/30" />
                      <div className="h-5 sm:h-7 w-14 sm:w-20 rounded-md border border-border/40" />
                    </div>
                  </div>
                  {/* Mock stats bar */}
                  <div className="flex gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 border-t border-border/20">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-1 h-6 sm:h-8 rounded bg-secondary/40" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logo bar — infinite marquee with borders */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 sm:mt-20 py-6 sm:py-8 border-y border-border/20"
        >
          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] font-heading font-medium mb-5 sm:mb-6">
            Works with
          </p>
          <div className="overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="flex animate-marquee gap-10 sm:gap-14 w-max">
              {[...integrations, ...integrations, ...integrations].map((item, i) => (
                <div
                  key={`${item.name}-${i}`}
                  className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-80 transition-opacity duration-300 shrink-0"
                >
                  <img src={item.logo} alt={item.name} className="h-7 w-7 sm:h-9 sm:w-9 object-contain" />
                  <span className="text-[8px] sm:text-[9px] text-muted-foreground font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
