import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'What is Degen Tools?',
    a: 'Degen Tools is an all-in-one platform for meme coin creators. Build professional token websites, generate memes, create shill content, and launch your project — all without writing a single line of code.',
  },
  {
    q: 'Do I need coding experience?',
    a: 'Not at all. Just paste your token link (Bags.fm, Pump.fun, DexScreener, Jupiter, or Raydium), pick a theme, customize your content, and publish. It takes under 5 minutes.',
  },
  {
    q: 'Which blockchains are supported?',
    a: 'We support Solana, Ethereum, Base, and BSC. You can import token data directly from Bags.fm, Pump.fun, DexScreener, Jupiter, and Raydium.',
  },
  {
    q: 'Can I use my own custom domain?',
    a: 'Yes! Degen plan and above lets you connect your own custom domain for a fully branded experience. Starter plan users get a branded subdomain.',
  },
  {
    q: 'What is the Content Studio?',
    a: 'The Content Studio is our AI-powered creative suite. Generate memes, sticker packs, social media posts, and marketing copy — all tailored to your token and brand.',
  },
  {
    q: 'How does pricing work?',
    a: 'We offer a Starter plan at $2.50/mo with a 7-day free trial, plus paid plans starting at $19/mo. All plans are billed monthly and you can pay with crypto via NOWPayments. Upgrade or cancel anytime.',
  },
  {
    q: 'Is my data safe?',
    a: 'Absolutely. Your sites and content are stored securely on our cloud infrastructure. We never share your data with third parties.',
  },
  {
    q: 'Can I create multiple websites?',
    a: 'Yes — depending on your plan. Starter allows 1 site, Creator allows 3, Pro allows 10, and Whale gives you unlimited sites.',
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding py-10 sm:py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/3 blur-[180px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 mb-5 sm:mb-6">
            <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            <span className="text-[9px] sm:text-[10px] font-display text-primary tracking-[0.3em]">FAQ</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            Frequently asked <span className="text-primary text-glow">questions</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-md mx-auto px-2">
            Everything you need to know about Degen Tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="gradient-card border border-border rounded-xl px-5 sm:px-6 hover:border-primary/20 transition-colors data-[state=open]:border-primary/25"
              >
                <AccordionTrigger className="text-sm sm:text-base text-foreground font-semibold py-4 sm:py-5 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4 sm:pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
