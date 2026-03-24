import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

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

const OFFICIAL_CA = '64fo2EVTZ8LJhA3Parx95Zu69WUfm32bEEj39pMSBAGS';

const HeroSection = ({ onGetStarted }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(OFFICIAL_CA);
    setCopied(true);
    toast.success('Contract address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative section-padding pt-16 sm:pt-28 md:pt-36 pb-12 sm:pb-28 overflow-hidden">
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-5 sm:mb-10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-[10px] sm:text-xs text-primary font-medium tracking-wide">Now with multi-chain import</span>
          </motion.div>

          {/* Heading */}
          <h1 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground leading-[1.6] sm:leading-[1.8] mb-4 sm:mb-8">
            THE ULTIMATE<br />
            <span className="text-primary text-glow">MEME COIN TOOLKIT</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-6 sm:mb-12 px-2">
            Everything your meme coin needs in less than 5 minutes, website, memes, shills, and more. Built for devs who move fast and ship faster.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-display text-[10px] sm:text-[11px] px-8 sm:px-10 py-6 sm:py-7 box-glow group rounded-xl"
            >
              <Zap className="w-4 h-4 mr-2" />
              START BUILDING FOR FREE
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onGetStarted}
              className="w-full sm:w-auto border-border text-muted-foreground hover:text-foreground hover:border-primary/30 font-display text-[10px] sm:text-[11px] px-8 sm:px-10 py-6 sm:py-7 rounded-xl"
            >
              VIEW LIVE DEMO
            </Button>
          </div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 sm:mt-6 text-[10px] sm:text-xs text-muted-foreground/50"
          >
            Join 500+ devs launching on Solana, Base, and Ethereum.
          </motion.p>

          {/* Official Token CA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 sm:mt-8"
          >
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] font-display mb-2">
              Official $DGTOOLS Token
            </p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/15 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
            >
              <code className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-none">
                {OFFICIAL_CA}
              </code>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary shrink-0 transition-colors" />
              )}
            </button>
          </motion.div>
        </motion.div>

        {/* Integrations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 sm:mt-20 pt-8 sm:pt-12 border-t border-border/40"
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
