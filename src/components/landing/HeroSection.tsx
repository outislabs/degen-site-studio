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
    <section className="relative px-6 pt-20 pb-28 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-neon-purple/8 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-neon-pink/5 blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs text-primary font-medium">Now with multi-chain import</span>
          </motion.div>

          {/* Main heading */}
          <h1 className="font-display text-lg sm:text-xl md:text-2xl text-primary text-glow mb-6 leading-[1.8]">
            YOUR TOOLKIT FOR<br />
            <span className="text-foreground">MEME COIN</span> DOMINATION
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            Build landing pages, import token data from any chain, and ship your degen project before the next candle closes.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-[10px] px-8 py-6 box-glow group"
            >
              <Zap className="w-4 h-4 mr-2" />
              START BUILDING
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onGetStarted}
              className="border-border text-muted-foreground hover:text-foreground hover:border-primary/30 font-display text-[10px] px-8 py-6"
            >
              VIEW DEMO
            </Button>
          </div>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-8 mt-16"
        >
          {[
            { value: '6', label: 'Themes' },
            { value: '10+', label: 'Chains' },
            { value: '< 5min', label: 'To Launch' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Integrations logo bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-14"
        >
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-display mb-5">
            Works with
          </p>
          {/* Desktop: grid layout */}
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {integrations.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <img src={item.logo} alt={item.name} className="h-9 w-9 object-contain" />
                <span className="text-[9px] text-muted-foreground font-medium">{item.name}</span>
              </div>
            ))}
          </div>

          {/* Mobile: infinite scrolling carousel */}
          <div className="sm:hidden overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="flex animate-scroll-x gap-8 w-max">
              {[...integrations, ...integrations].map((item, i) => (
                <div
                  key={`${item.name}-${i}`}
                  className="flex flex-col items-center gap-1.5 opacity-70 shrink-0"
                >
                  <img src={item.logo} alt={item.name} className="h-8 w-8 object-contain" />
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
