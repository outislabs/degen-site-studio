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
    <section id="content-studio" className="section-padding py-16 sm:py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[400px] h-[300px] bg-neon-pink/3 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-5 py-2 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs text-primary tracking-[0.2em] font-semibold uppercase">AI-POWERED</span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-foreground mb-3 sm:mb-4 tracking-tight">
            Content Studio
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto px-2">
            Generate memes, stickers, social posts, and marketing copy — all AI-powered and tailored to your token.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group glass-card-hover rounded-2xl p-6 sm:p-8 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                <span className="text-[9px] font-medium tracking-wider text-primary/70 bg-primary/8 border border-primary/15 px-3 py-1 rounded-full uppercase">
                  {tool.tag}
                </span>
              </div>

              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <tool.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-2">{tool.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">{tool.desc}</p>

              <div className="flex items-center gap-2 bg-background/40 border border-border/30 rounded-xl px-4 py-3">
                <Wand2 className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                <span className="text-[10px] sm:text-xs text-muted-foreground/40 italic truncate">{tool.prompt}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentStudioShowcase;
