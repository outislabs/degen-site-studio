import { Button } from '@/components/ui/button';
import { Rocket, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onGetStarted: () => void;
}

const CTASection = ({ onGetStarted }: Props) => {
  return (
    <section className="section-padding py-16 sm:py-28 relative">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="glass-card gradient-border-green rounded-3xl p-8 sm:p-14 md:p-18 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px] bg-primary/6 blur-[100px]" />
          </div>

          <div className="relative z-10">
            <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-5 sm:mb-6" />
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-foreground mb-3 sm:mb-4 tracking-tight">
              Ready to <span className="text-primary text-glow">Send It</span>?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed px-2">
              Build your first site for $0. Upgrade for custom domains and pro features when you're ready to trend.
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold text-xs sm:text-sm px-10 sm:px-14 py-6 sm:py-7 box-glow rounded-xl group"
            >
              <Rocket className="w-4 h-4 mr-2" /> Launch Your Site Now
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
