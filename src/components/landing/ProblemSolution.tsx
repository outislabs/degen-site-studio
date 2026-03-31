import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, X, Check } from 'lucide-react';

const ProblemSolution = () => (
  <section className="section-padding py-12 sm:py-20 relative">
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <span className="inline-block text-[11px] text-muted-foreground tracking-[0.2em] font-medium uppercase mb-4 border border-[hsla(0,0%,100%,0.08)] rounded-full px-4 py-1.5">
          THE PROBLEM
        </span>
        <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-[36px] text-foreground mt-3 mb-3 sm:mb-4 tracking-tight leading-tight">
          Stop Losing Investors to{' '}
          <span className="text-primary">Ugly Websites</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed px-2">
          In the meme coin world, trust is everything. If your site looks like a 2005 blog, you're getting rugged by the competition.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 sm:mt-10">
        {/* Without */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-xl p-5 bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-[hsla(0,0%,100%,0.1)] transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-5 h-5 text-destructive" />
          </div>
          <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Without DegenTools</h3>
          <ul className="space-y-2">
            {['Generic templates', 'Broken layouts on mobile', 'No trust signals', 'Investors bounce in 3s'].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <X className="w-3.5 h-3.5 mt-0.5 text-destructive/70 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* With */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-xl p-5 bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-[hsla(0,0%,100%,0.1)] transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-heading font-semibold text-foreground text-sm mb-3">With DegenTools</h3>
          <ul className="space-y-2">
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
