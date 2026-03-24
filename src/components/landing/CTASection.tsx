import { Button } from '@/components/ui/button';
import { Rocket, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onGetStarted: () => void;
}

const CTASection = ({ onGetStarted }: Props) => {
  return (
    <section className="section-padding py-10 sm:py-24 relative">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="gradient-card border border-primary/15 rounded-3xl p-6 sm:p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[400px] h-[200px] sm:h-[250px] bg-primary/8 blur-[80px] sm:blur-[100px]" />
          </div>

          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Ready to <span className="text-primary text-glow">Send It</span>?
            </h2>
            <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-5 sm:mb-6" />
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed px-2">
              Build your first site for $0. Upgrade for custom domains and pro features when you're ready to trend.
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-display text-[9px] sm:text-[10px] md:text-[11px] px-8 sm:px-12 py-6 sm:py-7 box-glow rounded-xl group"
            >
              <Rocket className="w-4 h-4 mr-2" /> LAUNCH YOUR SITE NOW
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
