import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onGetStarted: () => void;
}

const CTASection = ({ onGetStarted }: Props) => {
  return (
    <section className="px-6 py-20 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="gradient-card border border-primary/10 rounded-2xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-primary/5 blur-[80px]" />
          </div>
          <div className="relative z-10">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="font-display text-xs text-primary text-glow mb-4">READY TO LAUNCH?</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of degens who shipped their token site in under 5 minutes.
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-[10px] px-10 py-6 box-glow"
            >
              <Rocket className="w-4 h-4 mr-2" /> CREATE YOUR SITE
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
