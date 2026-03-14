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
    <section className="relative section-padding pt-20 sm:pt-28 md:pt-36 pb-20 sm:pb-28 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[600px] rounded-full bg-primary/8 blur-[150px] sm:blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-neon-purple/5 blur-[120px]" />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-8 sm:mb-10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-[10px] sm:text-xs text-primary font-medium tracking-wide">Now with multi-chain import</span>
          </motion.div>

          {/* Heading */}
          <h1 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground leading-[1.6] sm:leading-[1.8] mb-6 sm:mb-8">
            YOUR TOOLKIT FOR<br />
            <span className="text-primary text-glow">MEME COIN</span> DOMINATION
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8 sm:mb-12 px-2">
            Build stunning landing pages, import token data from any chain, and ship your degen project before the next candle closes.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-display text-[10px] sm:text-[11px] px-8 sm:px-10 py-6 sm:py-7 box-glow group rounded-xl"
            >
              <Zap className="w-4 h-4 mr-2" />
              START BUILDING
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onGetStarted}
              className="w-full sm:w-auto border-border text-muted-foreground hover:text-foreground hover:border-primary/30 font-display text-[10px] sm:text-[11px] px-8 sm:px-10 py-6 sm:py-7 rounded-xl"
            >
              VIEW DEMO
            </Button>
          </div>
        </motion.div>


        {/* Integrations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-14 sm:mt-20 pt-10 sm:pt-12 border-t border-border/40"
        >
          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] font-display mb-6 sm:mb-8">
            Works with
          </p>
          {/* Desktop */}
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-x-8 md:gap-x-10 gap-y-4">
            {integrations.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity duration-300"
              >
                <img src={item.logo} alt={item.name} className="h-8 w-8 md:h-10 md:w-10 object-contain" />
                <span className="text-[8px] md:text-[9px] text-muted-foreground font-medium">{item.name}</span>
              </div>
            ))}
          </div>
          {/* Mobile scroll */}
          <div className="sm:hidden overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="flex animate-scroll-x gap-8 w-max">
              {[...integrations, ...integrations].map((item, i) => (
                <div key={`${item.name}-${i}`} className="flex flex-col items-center gap-1.5 opacity-50 shrink-0">
                  <img src={item.logo} alt={item.name} className="h-8 w-8 object-contain" />
                  <span className="text-[8px] text-muted-foreground font-medium">{item.name}</span>
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
