import { motion } from 'framer-motion';

const cards = [
  {
    emoji: '🚀',
    title: 'Launch in Minutes',
    desc: 'Deploy your Solana token directly from DegenTools. Name, ticker, logo, socials — all set up in one flow.',
  },
  {
    emoji: '💰',
    title: 'Share Fees with KOLs',
    desc: 'Reward promoters on-chain. Set fee splits with Twitter or GitHub users at launch — fully automated.',
  },
  {
    emoji: '📊',
    title: 'Manage Your Portfolio',
    desc: 'Connect your wallet to view, buy, sell, and claim fees from all your Bags tokens in one dashboard.',
  },
];

const BagsFmSection = () => {
  return (
    <section className="section-padding py-10 sm:py-16 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-6">
            <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1 rounded-full">
              Powered by Bags.fm
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-foreground mb-3 sm:mb-4">
            Built on the Backbone of<br />
            <span className="text-primary text-glow">Solana's Fastest Launchpad</span>
          </h2>
          <p className="text-center text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto mb-8 sm:mb-10 px-2">
            DegenTools is natively integrated with Bags.fm. Launch your token, set up fee sharing with KOLs, and manage your community all from one dashboard. It's not just a website — it's an ecosystem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="gradient-card border border-border rounded-xl p-5 space-y-2 hover:border-primary/20 transition-all duration-300"
            >
              <div className="text-2xl">{c.emoji}</div>
              <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <a
            href="/launch"
            className="bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 box-glow"
          >
            🚀 Launch a Token Free
          </a>
        </div>
      </div>
    </section>
  );
};

export default BagsFmSection;
