import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themeList, ThemeConfig } from '@/lib/themes';
import { Palette, ChevronLeft, ChevronRight } from 'lucide-react';

const VISIBLE_COUNT = 7; // odd number for symmetry
const CENTER = Math.floor(VISIBLE_COUNT / 2);
const AUTO_INTERVAL = 3500;

const ThemeShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = themeList.length;

  const goNext = useCallback(() => setActiveIndex(i => (i + 1) % total), [total]);
  const goPrev = useCallback(() => setActiveIndex(i => (i - 1 + total) % total), [total]);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(goNext, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [goNext]);

  // Get visible indices centered around activeIndex
  const getVisibleIndices = () => {
    const indices: number[] = [];
    for (let offset = -CENTER; offset <= CENTER; offset++) {
      indices.push((activeIndex + offset + total) % total);
    }
    return indices;
  };

  const visibleIndices = getVisibleIndices();
  const activeTheme = themeList[activeIndex];

  return (
    <section id="themes" className="section-padding py-10 sm:py-24 relative overflow-hidden">
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none transition-colors duration-700">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[200px] rounded-full opacity-20 transition-all duration-700"
          style={{ backgroundColor: activeTheme?.accentHex }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-14"
        >
          <span className="inline-flex items-center gap-2 font-display text-[9px] sm:text-[10px] text-primary tracking-[0.3em] mb-4 bg-primary/5 border border-primary/10 rounded-full px-4 sm:px-5 py-2">
            <Palette className="w-3 h-3" />
            19 THEMES
          </span>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mt-4 mb-3 sm:mb-4">
            Pick your <span className="text-primary text-glow">vibe</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-lg mx-auto px-2">
            Every theme is dark-mode native and battle-tested. From neon degen to clean corporate — find your coin's look.
          </p>
        </motion.div>

        {/* 3D Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mb-8"
        >
          {/* Navigation arrows */}
          <button
            onClick={goPrev}
            className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>

          {/* Cards container */}
          <div className="flex items-center justify-center h-[220px] sm:h-[300px] perspective-[1200px]" style={{ perspective: '1200px' }}>
            {visibleIndices.map((themeIdx, slotIdx) => {
              const theme = themeList[themeIdx];
              const offset = slotIdx - CENTER;
              const isCenter = offset === 0;
              const absOffset = Math.abs(offset);

              // 3D transforms
              const translateX = offset * (typeof window !== 'undefined' && window.innerWidth < 640 ? 55 : 85);
              const translateZ = isCenter ? 0 : -(absOffset * 60);
              const rotateY = offset * -8;
              const scale = isCenter ? 1 : Math.max(0.65, 1 - absOffset * 0.12);
              const opacity = isCenter ? 1 : Math.max(0.3, 1 - absOffset * 0.25);

              return (
                <motion.div
                  key={`${themeIdx}-${slotIdx}`}
                  className="absolute cursor-pointer"
                  style={{
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity,
                    zIndex: VISIBLE_COUNT - absOffset,
                    transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  }}
                  onClick={() => setActiveIndex(themeIdx)}
                >
                  <div
                    className="w-[180px] sm:w-[260px] aspect-[16/10] rounded-xl overflow-hidden relative border"
                    style={{
                      background: theme.bgGradient,
                      borderColor: isCenter ? `${theme.accentHex}60` : `${theme.accentHex}15`,
                      boxShadow: isCenter
                        ? `0 0 40px ${theme.accentHex}25, 0 20px 60px rgba(0,0,0,0.5)`
                        : '0 10px 30px rgba(0,0,0,0.3)',
                    }}
                  >
                    {/* Mini site preview */}
                    <div className="flex items-center gap-1 px-2 py-1 border-b" style={{ borderColor: `${theme.accentHex}15` }}>
                      <div className="flex gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-red-500/60" />
                        <div className="w-1 h-1 rounded-full bg-yellow-500/60" />
                        <div className="w-1 h-1 rounded-full bg-green-500/60" />
                      </div>
                      <div className="flex-1 mx-1">
                        <div className="h-1.5 rounded-full mx-auto max-w-[60%]" style={{ backgroundColor: `${theme.accentHex}15` }} />
                      </div>
                    </div>

                    <div className="p-2 sm:p-3 flex flex-col items-center justify-center h-[calc(100%-20px)]">
                      <div className="text-lg sm:text-xl mb-1">{theme.emoji}</div>
                      <div className="h-1.5 sm:h-2 w-12 sm:w-16 rounded-full mb-1" style={{ background: `linear-gradient(90deg, ${theme.accentHex}, ${theme.accentHex2})` }} />
                      <div className="h-1 sm:h-1.5 w-16 sm:w-24 rounded-full mb-2" style={{ backgroundColor: `${theme.accentHex}20` }} />
                      <div className="flex gap-1">
                        <div className="h-3 sm:h-4 w-8 sm:w-12 rounded-md" style={{ background: `linear-gradient(90deg, ${theme.accentHex}, ${theme.accentHex2})` }} />
                        <div className="h-3 sm:h-4 w-6 sm:w-10 rounded-md border" style={{ borderColor: `${theme.accentHex}30` }} />
                      </div>
                    </div>

                    {/* Center glow */}
                    {isCenter && (
                      <div
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                          background: `radial-gradient(circle at 50% 30%, ${theme.accentHex}50, transparent 70%)`,
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Active theme label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTheme?.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-center mt-4 sm:mt-6"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xl">{activeTheme?.emoji}</span>
                <h3 className="text-base sm:text-lg font-bold text-foreground">{activeTheme?.name}</h3>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{activeTheme?.desc}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1 flex-wrap max-w-md mx-auto">
          {themeList.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveIndex(i)}
              className="transition-all duration-300"
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === activeIndex ? t.accentHex : `${t.accentHex}30`,
                boxShadow: i === activeIndex ? `0 0 8px ${t.accentHex}50` : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThemeShowcase;
