import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themeList, ThemeConfig } from '@/lib/themes';
import { Palette, ChevronLeft, ChevronRight } from 'lucide-react';

const MiniSitePreview = ({ theme, isActive }: { theme: ThemeConfig; isActive: boolean }) => (
  <div
    className="w-full aspect-[16/10] rounded-lg overflow-hidden relative"
    style={{ background: theme.bgGradient }}
  >
    {/* Top bar */}
    <div className="flex items-center gap-1 px-2.5 py-1.5 border-b" style={{ borderColor: `${theme.accentHex}15` }}>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
      </div>
      <div className="flex-1 mx-2">
        <div className="h-2 rounded-full mx-auto max-w-[60%]" style={{ backgroundColor: `${theme.accentHex}15` }} />
      </div>
    </div>

    {/* Content */}
    <div className="p-3 flex flex-col items-center justify-center h-[calc(100%-28px)]">
      <div className="text-xl mb-1.5">{theme.emoji}</div>
      <div className="h-2 w-16 rounded-full mb-1.5" style={{ background: `linear-gradient(90deg, ${theme.accentHex}, ${theme.accentHex2})` }} />
      <div className="h-1.5 w-24 rounded-full mb-2.5" style={{ backgroundColor: `${theme.accentHex}20` }} />

      {/* Mock buttons */}
      <div className="flex gap-1.5">
        <div className="h-4 w-12 rounded-md" style={{ background: `linear-gradient(90deg, ${theme.accentHex}, ${theme.accentHex2})` }} />
        <div className="h-4 w-10 rounded-md border" style={{ borderColor: `${theme.accentHex}30` }} />
      </div>

      {/* Mock cards row */}
      <div className="flex gap-1 mt-2.5 w-full px-1">
        {[1, 2, 3].map(n => (
          <div
            key={n}
            className="flex-1 h-6 rounded-md"
            style={{ backgroundColor: `${theme.accentHex}${n === 1 ? '12' : '08'}` }}
          />
        ))}
      </div>
    </div>

    {/* Ambient glow */}
    {isActive && (
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${theme.accentHex}40, transparent 70%)`,
        }}
      />
    )}
  </div>
);

const ThemeShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTheme = themeList[activeIndex];

  const goNext = () => setActiveIndex(i => (i + 1) % themeList.length);
  const goPrev = () => setActiveIndex(i => (i - 1 + themeList.length) % themeList.length);

  return (
    <section id="themes" className="section-padding py-10 sm:py-24 relative overflow-hidden">
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] blur-[200px] rounded-full opacity-30" style={{ backgroundColor: activeTheme?.accentHex }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
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

        {/* Featured Hero Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="relative max-w-3xl mx-auto">
            {/* Main preview */}
            <div className="rounded-2xl border border-border overflow-hidden p-1" style={{ borderColor: `${activeTheme?.accentHex}25` }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTheme?.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                >
                  <MiniSitePreview theme={activeTheme} isActive />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Theme name & desc */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTheme?.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-center mt-5"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-xl">{activeTheme?.emoji}</span>
                  <h3 className="text-lg font-bold text-foreground">{activeTheme?.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{activeTheme?.desc}</p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Thumbnail selector */}
          <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap max-w-xl mx-auto px-4">
            {themeList.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActiveIndex(i)}
                className="group relative rounded-md overflow-hidden transition-all duration-300"
                style={{
                  width: i === activeIndex ? 40 : 28,
                  height: i === activeIndex ? 26 : 20,
                  border: i === activeIndex ? `2px solid ${t.accentHex}` : '1px solid transparent',
                  boxShadow: i === activeIndex ? `0 0 12px ${t.accentHex}30` : 'none',
                }}
              >
                <div className="w-full h-full" style={{ background: t.bgGradient }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: t.accentHex, opacity: i === activeIndex ? 1 : 0.4 }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ThemeShowcase;
