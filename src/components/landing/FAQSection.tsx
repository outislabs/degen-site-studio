import { motion } from 'framer-motion';
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
    <section id="faq" className="section-padding py-12 sm:py-20 relative">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10"
        >
          <span className="inline-block text-[11px] text-muted-foreground tracking-[0.2em] font-medium uppercase mb-4 border border-[hsla(0,0%,100%,0.08)] rounded-full px-4 py-1.5">FAQ</span>
          <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-[36px] text-foreground mb-3 tracking-tight leading-tight">
            Frequently asked <span className="text-primary">questions</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Everything you need to know about Degen Tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl px-4 sm:px-5 bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-[hsla(0,0%,100%,0.1)] transition-colors data-[state=open]:border-[hsla(0,0%,100%,0.1)]"
              >
                <AccordionTrigger className="text-sm text-foreground font-medium py-3.5 sm:py-4 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-3.5 sm:pb-4">
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
