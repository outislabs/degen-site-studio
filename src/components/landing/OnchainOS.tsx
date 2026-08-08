import { motion } from 'framer-motion';

const OnchainOS = () => (
  <section className="section-padding py-16 sm:py-28">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8"
    >
      <p className="text-lg sm:text-2xl md:text-[28px] text-foreground leading-snug tracking-[-0.02em]">
        Onchain used to mean spending weeks gluing tools together.
      </p>

      <p className="font-heading font-bold text-2xl sm:text-4xl md:text-[44px] text-primary leading-none tracking-[-0.03em]">
        Not anymore.
      </p>

      <p className="text-lg sm:text-2xl md:text-[28px] text-foreground leading-snug tracking-[-0.02em]">
        DegenTools is the OS. Trade, build, ship, and hire agents — all from one home.
      </p>

      <p className="font-mono text-primary text-sm sm:text-base tracking-wide pt-2">
        Powered by $DEGENTOOLS.
      </p>
    </motion.div>
  </section>
);

export default OnchainOS;
