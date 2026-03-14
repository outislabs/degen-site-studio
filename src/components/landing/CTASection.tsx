import { Button } from '@/components/ui/button';
import { Rocket, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onGetStarted: () => void;
}

const CTASection = ({ onGetStarted }: Props) => {
  return (
    <section className="section-padding py-16 sm:py-24 relative">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="gradient-card border border-primary/15 rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[400px] h-[200px] sm:h-[250px] bg-primary/8 blur-[80px] sm:blur-[100px]" />
          </div>

          <div className="relative z-10">
            <div className="text-4xl sm:text-5xl mb-5 sm:mb-6">🚀</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Ready to <span className="text-primary text-glow">launch</span>?
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed px-2">
              Join thousands of degens who shipped their token site in under 5 minutes. No code required.
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-display text-[9px] sm:text-[10px] md:text-[11px] px-8 sm:px-12 py-6 sm:py-7 box-glow rounded-xl group"
            >
              <Rocket className="w-4 h-4 mr-2" /> CREATE YOUR SITE
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
