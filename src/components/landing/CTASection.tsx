import { Button } from '@/components/ui/button';
import { Rocket, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onGetStarted: () => void;
}

const CTASection = ({ onGetStarted }: Props) => {
  return (
    <section className="section-padding py-12 sm:py-20 relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="rounded-xl p-8 sm:p-12 bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] relative">
          <Rocket className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-[36px] text-foreground mb-3 tracking-tight leading-tight">
            Ready to <span className="text-primary">Send It</span>?
          </h2>
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
            Build your first site for $0. Upgrade for custom domains and pro features when you're ready to trend.
          </p>
          <Button
            size="lg"
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm px-10 py-6 box-glow rounded-xl group"
          >
            <Rocket className="w-4 h-4 mr-2" /> Launch Your Site Now
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
