import { motion } from 'framer-motion';
import { themeList } from '@/lib/themes';

const ThemeShowcase = () => {
  return (
    <section id="themes" className="px-6 py-20 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-xs text-primary tracking-wider mb-3">THEMES</h2>
          <p className="text-muted-foreground text-sm">Pick your vibe. Every theme is dark-mode native.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themeList.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative rounded-xl border border-border overflow-hidden hover:border-opacity-50 transition-all"
              style={{ borderColor: `${t.accentHex}25` }}
            >
              {/* Color bar */}
              <div className="h-1" style={{ background: `linear-gradient(90deg, ${t.accentHex}, ${t.accentHex}40)` }} />
              
              {/* Preview area */}
              <div className="p-5 relative" style={{ background: t.bgGradient }}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full blur-[40px] opacity-20" style={{ backgroundColor: t.accentHex }} />
                </div>
                <div className="relative z-10 text-center">
                  <span className="text-2xl mb-2 block">{t.emoji}</span>
                  <p className="font-semibold text-sm text-white">{t.name}</p>
                  <p className="text-[10px] mt-1" style={{ color: `${t.accentHex}90` }}>{t.desc}</p>
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
