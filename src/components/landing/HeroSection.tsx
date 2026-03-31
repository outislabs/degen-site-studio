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
    <section className="relative section-padding pt-20 sm:pt-28 md:pt-36 pb-8 sm:pb-12 overflow-hidden">
      {/* Single subtle radial for depth — no mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[radial-gradient(ellipse,_hsla(0,0%,100%,0.03)_0%,_transparent_70%)]" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsla(0,0%,100%,0.08)] bg-[hsla(0,0%,100%,0.03)] mb-6 sm:mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium tracking-wide">Now with multi-chain import</span>
          </motion.div>

          {/* Heading — 56px max desktop, 32px mobile */}
          <h1 className="font-heading font-extrabold text-[32px] sm:text-[44px] md:text-[56px] text-foreground leading-[1.1] mb-4 sm:mb-6 tracking-tight">
            The Ultimate<br />
            <span className="text-primary">Meme Coin Toolkit</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed mb-6 sm:mb-10 px-2">
            Everything your meme coin needs in less than 5 minutes — website, memes, shills, and more. Built for devs who move fast.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm px-8 py-6 box-glow group rounded-xl"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Building for Free
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onGetStarted}
              className="w-full sm:w-auto border-[hsla(0,0%,100%,0.1)] text-muted-foreground hover:text-foreground hover:border-[hsla(0,0%,100%,0.2)] font-medium text-sm px-8 py-6 rounded-xl"
            >
              View Live Demo
            </Button>
          </div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 sm:mt-6 text-[10px] sm:text-xs text-muted-foreground/40"
          >
            Join 500+ devs launching on Solana, Base, and Ethereum.
          </motion.p>
        </motion.div>

        {/* Product screenshot mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 sm:mt-14 relative mx-auto max-w-3xl"
        >
          {/* Browser chrome frame */}
          <div className="relative rounded-xl overflow-hidden border border-[hsla(0,0%,100%,0.06)] shadow-2xl shadow-black/60 bg-[hsl(0,0%,5%)]" style={{ transform: 'perspective(1200px) rotateX(2deg)' }}>
            {/* Title bar */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[hsl(0,0%,7%)] border-b border-[hsla(0,0%,100%,0.05)]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[hsl(0,60%,45%)]" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[hsl(45,60%,45%)]" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[hsl(142,60%,40%)]" />
              </div>
              <div className="flex-1 mx-3 sm:mx-6">
                <div className="h-5 rounded-md bg-[hsla(0,0%,100%,0.04)] border border-[hsla(0,0%,100%,0.05)] flex items-center justify-center">
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground/40">degentools.co/builder</span>
                </div>
              </div>
            </div>

            {/* Mock builder content */}
            <div className="p-3 sm:p-5 bg-background">
              <div className="grid grid-cols-12 gap-3">
                {/* Sidebar */}
                <div className="col-span-3 space-y-2">
                  <div className="h-6 sm:h-7 rounded-md bg-[hsla(0,0%,100%,0.04)] border border-[hsla(0,0%,100%,0.06)]" />
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-5 sm:h-6 rounded-md ${i === 1 ? 'bg-[hsla(0,0%,100%,0.06)] border border-[hsla(0,0%,100%,0.08)]' : 'bg-[hsla(0,0%,100%,0.02)]'}`} />
                  ))}
                </div>
                {/* Main preview */}
                <div className="col-span-9 rounded-lg border border-[hsla(0,0%,100%,0.05)] bg-[hsla(0,0%,100%,0.02)] overflow-hidden">
                  <div className="p-4 sm:p-6 space-y-2 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[hsla(0,0%,100%,0.04)] mx-auto" />
                    <div className="h-3 w-24 sm:w-32 rounded bg-[hsla(0,0%,100%,0.08)] mx-auto" />
                    <div className="h-2 w-32 sm:w-40 rounded bg-[hsla(0,0%,100%,0.04)] mx-auto" />
                    <div className="flex gap-2 justify-center pt-1">
                      <div className="h-5 sm:h-6 w-14 sm:w-20 rounded-md bg-primary/20" />
                      <div className="h-5 sm:h-6 w-14 sm:w-20 rounded-md border border-[hsla(0,0%,100%,0.08)]" />
                    </div>
                  </div>
                  <div className="flex gap-2 px-3 sm:px-5 py-2 border-t border-[hsla(0,0%,100%,0.04)]">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-1 h-5 sm:h-6 rounded bg-[hsla(0,0%,100%,0.03)]" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logo bar — infinite marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 sm:mt-16 py-5 sm:py-6 border-y border-[hsla(0,0%,100%,0.05)]"
        >
          <p className="text-[10px] text-muted-foreground/30 uppercase tracking-[0.25em] font-medium mb-4 sm:mb-5">
            Works with
          </p>
          <div className="overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="flex animate-marquee gap-10 sm:gap-14 w-max">
              {[...integrations, ...integrations, ...integrations].map((item, i) => (
                <div
                  key={`${item.name}-${i}`}
                  className="flex flex-col items-center gap-1.5 opacity-30 hover:opacity-60 transition-opacity duration-300 shrink-0"
                >
                  <img src={item.logo} alt={item.name} className="h-6 w-6 sm:h-7 sm:w-7 object-contain grayscale" />
                  <span className="text-[8px] sm:text-[9px] text-muted-foreground/50 font-medium">{item.name}</span>
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
