import { motion } from 'framer-motion';
import { Rocket, Users, BarChart3 } from 'lucide-react';

const cards = [
  {
    icon: Rocket,
    title: 'Launch in Minutes',
    desc: 'Deploy your Solana token directly from DegenTools. Name, ticker, logo, socials — all set up in one flow.',
  },
  {
    icon: Users,
    title: 'Share Fees with KOLs',
    desc: 'Reward promoters on-chain. Set fee splits with Twitter or GitHub users at launch — fully automated.',
  },
  {
    icon: BarChart3,
    title: 'Manage Your Portfolio',
    desc: 'Connect your wallet to view, buy, sell, and claim fees from all your Bags tokens in one dashboard.',
  },
];

const BagsFmSection = () => {
  return (
    <section className="section-padding py-12 sm:py-20 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-5">
            <span className="border border-[hsla(0,0%,100%,0.08)] text-muted-foreground text-[11px] font-medium px-4 py-1.5 rounded-full">
              Powered by Bags.fm
            </span>
          </div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-[36px] text-center text-foreground mb-3 tracking-tight leading-tight">
            Built on the Backbone of<br />
            <span className="text-primary">Solana's Fastest Launchpad</span>
          </h2>
          <p className="text-center text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8 sm:mb-10">
            DegenTools is natively integrated with Bags.fm. Launch, share fees, and manage your community from one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl p-5 bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-[hsla(0,0%,100%,0.1)] transition-colors space-y-3"
            >
              <div className="w-9 h-9 rounded-lg bg-[hsla(0,0%,100%,0.05)] flex items-center justify-center">
                <c.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-heading font-semibold text-foreground">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-6 sm:mt-8">
          <a
            href="/launch"
            className="bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 box-glow"
          >
            <Rocket className="w-4 h-4" /> Launch a Token Free
          </a>
        </div>
      </div>
    </section>
  );
};

export default BagsFmSection;
