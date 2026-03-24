import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp } from 'lucide-react';

const ProblemSolution = () => (
  <section className="section-padding py-10 sm:py-24 relative">
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
        <span className="inline-block font-display text-[9px] sm:text-[10px] text-primary tracking-[0.3em] mb-4 bg-primary/5 border border-primary/10 rounded-full px-4 sm:px-5 py-2">
          THE PROBLEM
        </span>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mt-4 mb-4 sm:mb-6">
          Stop Losing Investors to{' '}
          <span className="text-primary text-glow">Ugly Websites</span>
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed px-2">
          In the meme coin world, trust is everything. If your site looks like a 2005 blog, you're getting rugged by the competition. DegenTools helps you bridge the gap between "just another coin" and a "community-backed moonshot" with professional UI/UX that builds instant trust.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="gradient-card border border-destructive/15 rounded-2xl p-5 sm:p-7 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="font-semibold text-foreground text-sm sm:text-base mb-2">Without DegenTools</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Generic templates, broken layouts, no trust signals. Investors bounce in 3 seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="gradient-card border border-primary/20 rounded-2xl p-5 sm:p-7 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm sm:text-base mb-2">With DegenTools</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Professional, trust-building sites that convert visitors into holders. Ship in minutes.
          </p>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ProblemSolution;
