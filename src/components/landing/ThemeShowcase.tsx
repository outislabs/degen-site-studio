import { motion } from 'framer-motion';
import { themeList } from '@/lib/themes';

const ThemeShowcase = () => {
  return (
    <section id="themes" className="section-padding py-16 sm:py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[250px] bg-accent/3 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-block font-display text-[9px] sm:text-[10px] text-primary tracking-[0.3em] mb-4 bg-primary/5 border border-primary/10 rounded-full px-4 sm:px-5 py-2">THEMES</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-4 mb-3 sm:mb-4">
            Pick your <span className="text-primary text-glow">vibe</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base px-2">Every theme is dark-mode native and battle-tested.</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {themeList.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative rounded-2xl border border-border overflow-hidden hover:scale-[1.03] transition-all duration-300"
              style={{ borderColor: `${t.accentHex}20` }}
            >
              <div className="h-1" style={{ background: `linear-gradient(90deg, ${t.accentHex}, ${t.accentHex}30)` }} />
              <div className="p-6 sm:p-8 relative" style={{ background: t.bgGradient }}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full blur-[40px] opacity-20" style={{ backgroundColor: t.accentHex }} />
                </div>
                <div className="relative z-10 text-center">
                  <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block">{t.emoji}</span>
                  <p className="font-semibold text-sm sm:text-base text-foreground">{t.name}</p>
                  <p className="text-[10px] sm:text-xs mt-1" style={{ color: `${t.accentHex}90` }}>{t.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThemeShowcase;
