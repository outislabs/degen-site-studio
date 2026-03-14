import logo from '@/assets/logo.png';
import { Send, MessageCircle } from 'lucide-react';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Themes', href: '#themes' },
      { label: 'Content Studio', href: '#content-studio' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Showcase', href: '#showcase' },
      { label: 'FAQ', href: '#pricing' },
    ],
  },
];

const LandingFooter = () => {
  const scrollTo = (href: string) => {
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-border/30 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/3 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 sm:gap-6 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="sm:col-span-5">
            <img src={logo} alt="Degen Tools" className="h-10 sm:h-12 w-auto mb-4" />
            <p className="text-xs sm:text-sm text-muted-foreground/70 max-w-xs leading-relaxed mb-5">
              The all-in-one platform for meme coin creators. Build sites, generate memes, and launch your token in minutes.
            </p>
            <div className="flex items-center gap-2">
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                <Send className="w-3.5 h-3.5" />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all text-xs font-bold">
                𝕏
              </a>
              <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title} className="sm:col-span-2">
              <h4 className="text-[10px] sm:text-xs font-bold text-foreground/80 uppercase tracking-[0.2em] mb-3 sm:mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2 sm:space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-xs sm:text-sm text-muted-foreground/60 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA */}
          <div className="sm:col-span-3">
            <h4 className="text-[10px] sm:text-xs font-bold text-foreground/80 uppercase tracking-[0.2em] mb-3 sm:mb-4">
              Get Started
            </h4>
            <p className="text-xs text-muted-foreground/50 leading-relaxed mb-4">
              Create your meme coin website for free. No coding required.
            </p>
            <a href="/auth"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-all">
              Launch Free Site →
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50 mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] sm:text-xs text-muted-foreground/40 text-center sm:text-left">
            © {new Date().getFullYear()} Degen Tools • Not financial advice • DYOR 🐸
          </p>
          <div className="flex items-center gap-4 text-[10px] sm:text-xs text-muted-foreground/40">
            <a href="/terms" className="hover:text-muted-foreground/60 transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-muted-foreground/60 transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
