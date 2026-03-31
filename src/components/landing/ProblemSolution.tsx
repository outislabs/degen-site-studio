import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, X, Check } from 'lucide-react';

const ProblemSolution = () => (
  <section className="section-padding py-16 sm:py-28 relative">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-0 w-[400px] h-[300px] bg-destructive/3 blur-[180px] rounded-full" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[300px] bg-primary/3 blur-[180px] rounded-full" />
    </div>

    <div className="max-w-3xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <span className="inline-block text-[10px] sm:text-xs text-primary tracking-[0.2em] font-semibold uppercase mb-4 bg-primary/5 border border-primary/10 rounded-full px-5 py-2">
          THE PROBLEM
        </span>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-foreground mt-4 mb-4 sm:mb-6 tracking-tight">
          Stop Losing Investors to{' '}
          <span className="text-primary text-glow">Ugly Websites</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed px-2">
          In the meme coin world, trust is everything. If your site looks like a 2005 blog, you're getting rugged by the competition.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-10 sm:mt-14">
        {/* Without */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden"
          style={{ borderColor: 'hsla(0, 84%, 60%, 0.15)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-7 h-7 text-destructive" />
          </div>
          <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-3">Without DegenTools</h3>
          <ul className="space-y-2 text-left">
            {['Generic templates', 'Broken layouts on mobile', 'No trust signals', 'Investors bounce in 3s'].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <X className="w-3.5 h-3.5 mt-0.5 text-destructive shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* With — highlighted with green gradient border */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card gradient-border-green rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <TrendingUp className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-3">With DegenTools</h3>
          <ul className="space-y-2 text-left">
            {['Professional trust-building sites', 'Mobile-optimized by default', 'Built-in tokenomics & charts', 'Ship in under 5 minutes'].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <Check className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ProblemSolution;
