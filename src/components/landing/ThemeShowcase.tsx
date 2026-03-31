import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themeList, ThemeConfig } from '@/lib/themes';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const VISIBLE_COUNT = 7;
const CENTER = Math.floor(VISIBLE_COUNT / 2);
const AUTO_INTERVAL = 3500;

const ThemeShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = themeList.length;

  const goNext = useCallback(() => setActiveIndex(i => (i + 1) % total), [total]);
  const goPrev = useCallback(() => setActiveIndex(i => (i - 1 + total) % total), [total]);

  useEffect(() => {
    const timer = setInterval(goNext, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [goNext]);

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
    <section id="themes" className="section-padding py-10 sm:py-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-10"
        >
          <span className="inline-block text-[11px] text-muted-foreground tracking-[0.2em] font-medium uppercase mb-4 border border-[hsla(0,0%,100%,0.08)] rounded-full px-4 py-1.5">
            19 THEMES
          </span>
          <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-[36px] text-foreground mt-3 mb-3 tracking-tight leading-tight">
            Pick your <span className="text-primary">vibe</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto">
            Every theme is dark-mode native and battle-tested. From neon degen to clean corporate — find your coin's look.
          </p>
        </motion.div>

        {/* 3D Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mb-6"
        >
          <button
            onClick={goPrev}
            className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background border border-[hsla(0,0%,100%,0.08)] flex items-center justify-center hover:border-[hsla(0,0%,100%,0.15)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-background border border-[hsla(0,0%,100%,0.08)] flex items-center justify-center hover:border-[hsla(0,0%,100%,0.15)] transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>

          <div className="flex items-center justify-center h-[200px] sm:h-[280px]" style={{ perspective: '1200px' }}>
            {visibleIndices.map((themeIdx, slotIdx) => {
              const theme = themeList[themeIdx];
              const offset = slotIdx - CENTER;
              const isCenter = offset === 0;
              const absOffset = Math.abs(offset);

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
                    className="w-[170px] sm:w-[240px] aspect-[16/10] rounded-xl overflow-hidden relative border"
                    style={{
                      background: theme.bgGradient,
                      borderColor: isCenter ? `${theme.accentHex}40` : `hsla(0,0%,100%,0.06)`,
                    }}
                  >
                    <div className="flex items-center gap-1 px-2 py-1 border-b" style={{ borderColor: `hsla(0,0%,100%,0.06)` }}>
                      <div className="flex gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-red-500/50" />
                        <div className="w-1 h-1 rounded-full bg-yellow-500/50" />
                        <div className="w-1 h-1 rounded-full bg-green-500/50" />
                      </div>
                      <div className="flex-1 mx-1">
                        <div className="h-1.5 rounded-full mx-auto max-w-[60%] bg-[hsla(0,0%,100%,0.06)]" />
                      </div>
                    </div>

                    <div className="p-2 sm:p-3 flex flex-col items-center justify-center h-[calc(100%-20px)]">
                      <div className="text-lg sm:text-xl mb-1">{theme.emoji}</div>
                      <div className="h-1.5 sm:h-2 w-12 sm:w-16 rounded-full mb-1" style={{ background: `linear-gradient(90deg, ${theme.accentHex}, ${theme.accentHex2})` }} />
                      <div className="h-1 sm:h-1.5 w-16 sm:w-24 rounded-full mb-2 bg-[hsla(0,0%,100%,0.06)]" />
                      <div className="flex gap-1">
                        <div className="h-3 sm:h-4 w-8 sm:w-12 rounded-md" style={{ background: `linear-gradient(90deg, ${theme.accentHex}, ${theme.accentHex2})` }} />
                        <div className="h-3 sm:h-4 w-6 sm:w-10 rounded-md border border-[hsla(0,0%,100%,0.1)]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTheme?.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-center mt-4"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg">{activeTheme?.emoji}</span>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">{activeTheme?.name}</h3>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground/50">{activeTheme?.desc}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="flex items-center justify-center gap-1 flex-wrap max-w-md mx-auto">
          {themeList.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveIndex(i)}
              className="transition-all duration-300"
              style={{
                width: i === activeIndex ? 16 : 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: i === activeIndex ? t.accentHex : `hsla(0,0%,100%,0.1)`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThemeShowcase;
