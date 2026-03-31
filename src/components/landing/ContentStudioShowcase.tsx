import { motion } from 'framer-motion';
import { Sparkles, Image, Sticker, Share2, Type, Wand2 } from 'lucide-react';

const tools = [
  {
    icon: Image,
    title: 'Meme Generator',
    desc: 'AI-powered memes tailored to your token. Diamond hands, rug pull survivors, moon missions.',
    tag: 'Starter',
    prompt: '"Diamond hands Pepe with laser eyes"',
  },
  {
    icon: Sticker,
    title: 'Sticker Pack Builder',
    desc: 'Create custom Telegram sticker packs with your token mascot and branding.',
    tag: 'Creator+',
    prompt: '"Happy moon emoji with rocket, kawaii style"',
  },
  {
    icon: Share2,
    title: 'Social Post Creator',
    desc: 'Generate scroll-stopping graphics for Twitter, Telegram, and Discord announcements.',
    tag: 'Creator+',
    prompt: '"Announcement graphic for our Raydium listing"',
  },
  {
    icon: Type,
    title: 'Marketing Copy',
    desc: 'AI shill tweets, TG welcome messages, and FOMO announcements on demand.',
    tag: 'Creator+',
    prompt: '"Write 5 shill tweets for our presale launch"',
  },
];

const ContentStudioShowcase = () => {
  return (
    <section id="content-studio" className="section-padding py-12 sm:py-20 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 border border-[hsla(0,0%,100%,0.08)] rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground tracking-[0.2em] font-medium uppercase">AI-POWERED</span>
          </div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-[36px] text-foreground mb-3 tracking-tight leading-tight">
            Content Studio
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Generate memes, stickers, social posts, and marketing copy — all AI-powered and tailored to your token.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-xl p-5 bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] hover:border-[hsla(0,0%,100%,0.1)] transition-colors relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <span className="text-[9px] font-medium tracking-wider text-muted-foreground/50 border border-[hsla(0,0%,100%,0.08)] px-2.5 py-1 rounded-full uppercase">
                  {tool.tag}
                </span>
              </div>

              <div className="w-9 h-9 rounded-lg bg-[hsla(0,0%,100%,0.05)] flex items-center justify-center mb-4">
                <tool.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-foreground text-sm mb-1.5">{tool.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{tool.desc}</p>

              <div className="flex items-center gap-2 bg-[hsla(0,0%,100%,0.02)] border border-[hsla(0,0%,100%,0.06)] rounded-lg px-3 py-2.5">
                <Wand2 className="w-3 h-3 text-muted-foreground/30 shrink-0" />
                <span className="text-[10px] sm:text-xs text-muted-foreground/30 italic truncate">{tool.prompt}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentStudioShowcase;
