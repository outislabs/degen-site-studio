import { motion } from 'framer-motion';
import { Sparkles, Image, Sticker, Share2, Type, Wand2, ArrowRight } from 'lucide-react';

const featured = {
  icon: Image,
  title: 'AI Meme Generator',
  desc: 'Generate viral memes tailored to your token — diamond hands, rug pull survivors, moon missions. Just describe what you want.',
  tag: 'Popular',
  prompt: '"Diamond hands Pepe with laser eyes holding $DEGEN"',
};

const tools = [
  {
    icon: Sticker,
    title: 'Sticker Packs',
    desc: 'Custom Telegram sticker packs with your mascot and branding.',
    tag: 'Creator+',
  },
  {
    icon: Share2,
    title: 'Social Graphics',
    desc: 'Scroll-stopping visuals for Twitter, TG, and Discord drops.',
    tag: 'Creator+',
  },
  {
    icon: Type,
    title: 'Marketing Copy',
    desc: 'AI shill tweets, welcome messages, and FOMO announcements.',
    tag: 'Creator+',
  },
];

const ContentStudioShowcase = () => {
  return (
    <section id="content-studio" className="section-padding py-16 sm:py-24 relative">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 border border-[hsla(0,0%,100%,0.08)] rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[11px] text-muted-foreground tracking-[0.2em] font-medium uppercase">AI-POWERED</span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-[40px] text-foreground mb-3 tracking-tight leading-tight">
            Content Studio
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Generate memes, stickers, social posts, and marketing copy — all tailored to your token.
          </p>
        </motion.div>

        {/* Bento layout: featured card + 3 smaller cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
          {/* Featured card — spans 3 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-3 group rounded-2xl p-6 sm:p-8 bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
          >
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.04] rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <featured.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[9px] font-semibold tracking-wider text-primary border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-full uppercase">
                  {featured.tag}
                </span>
              </div>

              <h3 className="font-heading font-bold text-foreground text-lg sm:text-xl mb-2">{featured.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md">{featured.desc}</p>

              {/* Prompt mockup */}
              <div className="flex items-center gap-3 bg-[hsla(0,0%,100%,0.03)] border border-[hsla(0,0%,100%,0.08)] rounded-xl px-4 py-3">
                <Wand2 className="w-4 h-4 text-primary/40 shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground/50 italic truncate flex-1">{featured.prompt}</span>
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right column — 3 stacked cards spanning 2 columns */}
          <div className="md:col-span-2 grid grid-cols-1 gap-3 sm:gap-4">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="group rounded-xl p-4 sm:p-5 bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-[hsla(0,0%,100%,0.12)] transition-all duration-300 flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-lg bg-[hsla(0,0%,100%,0.05)] flex items-center justify-center shrink-0 group-hover:bg-[hsla(0,0%,100%,0.08)] transition-colors">
                  <tool.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold text-foreground text-sm">{tool.title}</h3>
                    <span className="text-[8px] font-medium tracking-wider text-muted-foreground/40 border border-[hsla(0,0%,100%,0.06)] px-2 py-0.5 rounded-full uppercase hidden sm:inline">
                      {tool.tag}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">{tool.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentStudioShowcase;
