import { motion } from 'framer-motion';
import { Sparkles, Image, Sticker, Share2, Type, Wand2 } from 'lucide-react';

const tools = [
  {
    icon: Image,
    title: 'Meme Generator',
    desc: 'AI-powered memes tailored to your token. Diamond hands, rug pull survivors, moon missions.',
    tag: 'Free',
  },
  {
    icon: Sticker,
    title: 'Sticker Pack Builder',
    desc: 'Create custom Telegram sticker packs with your token mascot and branding.',
    tag: 'Creator+',
  },
  {
    icon: Share2,
    title: 'Social Post Creator',
    desc: 'Generate scroll-stopping graphics for Twitter, Telegram, and Discord announcements.',
    tag: 'Creator+',
  },
  {
    icon: Type,
    title: 'Marketing Copy',
    desc: 'AI shill tweets, TG welcome messages, and FOMO announcements on demand.',
    tag: 'Creator+',
  },
];

const ContentStudioShowcase = () => {
  return (
    <section id="content-studio" className="px-6 py-20 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-display text-primary tracking-wider">AI-POWERED</span>
            </div>
            <h2 className="font-display text-xs sm:text-sm text-primary tracking-wider mb-3">CONTENT STUDIO</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Generate memes, stickers, social posts, and marketing copy — all AI-powered and tailored to your token.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group gradient-card border border-border rounded-xl p-6 hover:border-primary/20 transition-all relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <span className="text-[9px] font-display tracking-wider text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                  {tool.tag}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <tool.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2">{tool.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>

              {/* Decorative prompt preview */}
              <div className="mt-4 flex items-center gap-2 bg-background/50 border border-border rounded-lg px-3 py-2">
                <Wand2 className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-[10px] text-muted-foreground/60 italic truncate">
                  {tool.title === 'Meme Generator' && '"Diamond hands Pepe with laser eyes"'}
                  {tool.title === 'Sticker Pack Builder' && '"Happy moon emoji with rocket, kawaii style"'}
                  {tool.title === 'Social Post Creator' && '"Announcement graphic for our Raydium listing"'}
                  {tool.title === 'Marketing Copy' && '"Write 5 shill tweets for our presale launch"'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentStudioShowcase;
