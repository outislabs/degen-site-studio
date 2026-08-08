import { motion } from 'framer-motion';
import { Terminal, LayoutTemplate, Sparkles, Code2, Bot, ArrowRight } from 'lucide-react';

const products = [
  {
    icon: Terminal,
    name: 'Terminal',
    desc: 'Trade any token, any chain. Solana, BNB, TON, and beyond — from one screen.',
    cta: 'Open Terminal',
    href: 'https://terminal.degentools.co',
    external: true,
  },
  {
    icon: LayoutTemplate,
    name: 'Builder',
    desc: 'Launch memecoin sites and tokens in minutes. 25+ templates, AI Copilot, Bags.fm + four.meme.',
    cta: 'Start Building',
    href: 'https://console.degentools.co/builder',
    external: true,
  },
  {
    icon: Sparkles,
    name: 'Copilot',
    desc: 'Prompt DegenTools to build for you. AI that composes real onchain surfaces from natural language.',
    cta: 'Try Copilot',
    href: 'https://console.degentools.co/builder',
    external: true,
  },
  {
    icon: Code2,
    name: 'API + CLI + MCP',
    desc: 'Every DegenTools feature, programmable. npm i -g degentools. MCP server for Claude Desktop and Cursor.',
    cta: 'Read the Docs',
    href: '/docs',
    external: false,
  },
  {
    icon: Bot,
    name: 'Piade',
    desc: 'A full web3 dev team in 30 seconds. Solidity Dev, Contract Auditor, Tokenomics Analyst, Degen Marketer — each an AI agent with its own repo and model.',
    tag: 'Launching soon',
    muted: true,
  },
];

const ProductStrip = () => (
  <section id="products" className="section-padding py-12 sm:py-20">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`group rounded-xl p-5 sm:p-6 flex flex-col transition-all duration-300 ${
            p.muted
              ? 'border border-[hsla(0,0%,100%,0.04)] bg-[hsla(0,0%,100%,0.012)]'
              : 'border border-[hsla(0,0%,100%,0.07)] bg-[hsla(0,0%,100%,0.025)] hover:border-primary/25 hover:-translate-y-1 hover:bg-[hsla(0,0%,100%,0.04)]'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
              p.muted ? 'bg-[hsla(0,0%,100%,0.03)]' : 'bg-primary/10'
            }`}
          >
            <p.icon className={`w-5 h-5 ${p.muted ? 'text-muted-foreground/40' : 'text-primary'}`} />
          </div>

          <h3
            className={`font-heading font-semibold text-base mb-2 ${
              p.muted ? 'text-muted-foreground' : 'text-foreground'
            }`}
          >
            {p.name}
          </h3>

          <p className={`text-sm leading-relaxed flex-1 ${p.muted ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
            {p.desc}
          </p>

          {p.tag && (
            <span className="mt-5 inline-flex self-start items-center px-2.5 py-1 rounded-full border border-[hsla(0,0%,100%,0.06)] text-[10px] font-mono text-muted-foreground/40 tracking-wide">
              {p.tag}
            </span>
          )}

          {p.cta && (
            <a
              href={p.href}
              {...(p.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 transition-all"
            >
              {p.cta}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </motion.div>
      ))}
    </div>
  </section>
);

export default ProductStrip;
