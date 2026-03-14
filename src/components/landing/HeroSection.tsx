import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import pumpfunLogo from '@/assets/integrations/pumpfun.png';
import dexscreenerLogo from '@/assets/integrations/dexscreener.png';
import raydiumLogo from '@/assets/integrations/raydium.png';
import jupiterLogo from '@/assets/integrations/jupiter.svg';
import solanaLogo from '@/assets/integrations/solana.png';
import ethereumLogo from '@/assets/integrations/ethereum.png';
import baseLogo from '@/assets/integrations/base.png';
import bscLogo from '@/assets/integrations/bsc.png';

const integrations = [
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
    <section className="relative px-6 pt-28 pb-32 overflow-hidden">
      {/* Layered background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/8 blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-neon-purple/5 blur-[150px]" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-neon-pink/3 blur-[120px]" />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs text-primary font-medium tracking-wide">Now with multi-chain import</span>
          </motion.div>

          {/* Main heading */}
          <h1 className="font-display text-base sm:text-lg md:text-2xl lg:text-3xl text-foreground leading-[2] sm:leading-[2] mb-8">
            YOUR TOOLKIT FOR<br />
            <span className="text-primary text-glow">MEME COIN</span> DOMINATION
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
            Build stunning landing pages, import token data from any chain, and ship your degen project before the next candle closes.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-[10px] sm:text-[11px] px-10 py-7 box-glow group rounded-xl"
            >
              <Zap className="w-4 h-4 mr-2" />
              START BUILDING
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onGetStarted}
              className="border-border text-muted-foreground hover:text-foreground hover:border-primary/30 font-display text-[10px] sm:text-[11px] px-10 py-7 rounded-xl"
            >
              VIEW DEMO
            </Button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-12 sm:gap-16 mt-20"
        >
          {[
            { value: '6', label: 'Themes' },
            { value: '10+', label: 'Chains' },
            { value: '< 5min', label: 'To Launch' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-2">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 pt-12 border-t border-border/50"
        >
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.25em] font-display mb-8">
            Works with
          </p>
          {/* Desktop */}
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {integrations.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300"
              >
                <img src={item.logo} alt={item.name} className="h-10 w-10 object-contain" />
                <span className="text-[9px] text-muted-foreground font-medium">{item.name}</span>
              </div>
            ))}
          </div>
          {/* Mobile carousel */}
          <div className="sm:hidden overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="flex animate-scroll-x gap-10 w-max">
              {[...integrations, ...integrations].map((item, i) => (
                <div key={`${item.name}-${i}`} className="flex flex-col items-center gap-2 opacity-60 shrink-0">
                  <img src={item.logo} alt={item.name} className="h-9 w-9 object-contain" />
                  <span className="text-[9px] text-muted-foreground font-medium">{item.name}</span>
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
