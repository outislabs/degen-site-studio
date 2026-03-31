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
    <section className="section-padding py-16 sm:py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/4 blur-[180px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-6">
            <span className="bg-primary/8 border border-primary/15 text-primary text-xs font-medium px-4 py-1.5 rounded-full">
              Powered by Bags.fm
            </span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-center text-foreground mb-3 sm:mb-4 tracking-tight">
            Built on the Backbone of<br />
            <span className="text-primary text-glow">Solana's Fastest Launchpad</span>
          </h2>
          <p className="text-center text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-10 sm:mb-14 px-2">
            DegenTools is natively integrated with Bags.fm. Launch, share fees, and manage your community from one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover rounded-2xl p-5 sm:p-6 space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <c.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-heading font-semibold text-foreground">{c.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8 sm:mt-10">
          <a
            href="/launch"
            className="bg-primary text-primary-foreground font-heading font-bold text-sm px-7 py-3.5 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 box-glow"
          >
            <Rocket className="w-4 h-4" /> Launch a Token Free
          </a>
        </div>
      </div>
    </section>
  );
};

export default BagsFmSection;
