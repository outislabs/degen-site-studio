import logo from '@/assets/logo.png';
import { Send, Mail } from 'lucide-react';

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
      { label: 'FAQ', href: '#faq' },
      { label: 'Help Center', href: '/help' },
    ],
  },
];

const LandingFooter = () => {
  const scrollTo = (href: string) => {
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[hsla(0,0%,100%,0.06)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 sm:gap-6 mb-8 sm:mb-10">
          {/* Brand */}
          <div className="sm:col-span-5">
            <img src={logo} alt="Degen Tools" className="h-9 sm:h-10 w-auto mb-3" />
            <p className="text-xs text-muted-foreground/50 max-w-xs leading-relaxed mb-4">
              The all-in-one platform for meme coin creators. Build sites, generate memes, and launch your token in minutes.
            </p>
            <div className="flex items-center gap-2">
              <a href="https://t.me/degentoolshq" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[hsla(0,0%,100%,0.03)] border border-[hsla(0,0%,100%,0.06)] flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-[hsla(0,0%,100%,0.1)] transition-all">
                <Send className="w-3 h-3" />
              </a>
              <a href="https://x.com/degentoolshq" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[hsla(0,0%,100%,0.03)] border border-[hsla(0,0%,100%,0.06)] flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-[hsla(0,0%,100%,0.1)] transition-all text-xs font-bold">
                𝕏
              </a>
              <a href="mailto:partners@degentools.co"
                className="w-8 h-8 rounded-lg bg-[hsla(0,0%,100%,0.03)] border border-[hsla(0,0%,100%,0.06)] flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-[hsla(0,0%,100%,0.1)] transition-all">
                <Mail className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title} className="sm:col-span-2">
              <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.15em] mb-3">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-xs text-muted-foreground/40 hover:text-foreground transition-colors"
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
            <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.15em] mb-3">
              Get Started
            </h4>
            <p className="text-xs text-muted-foreground/40 leading-relaxed mb-3">
              Create your meme coin website in minutes. No coding required.
            </p>
            <a href="/auth"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all">
              Start Free Trial →
            </a>
          </div>
        </div>

        <div className="h-px bg-[hsla(0,0%,100%,0.05)] mb-5" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] sm:text-xs text-muted-foreground/30 text-center sm:text-left">
            © {new Date().getFullYear()} Degen Tools • Not financial advice • DYOR 🐸
          </p>
          <div className="flex items-center gap-4 text-[10px] sm:text-xs text-muted-foreground/30">
            <a href="/terms" className="hover:text-muted-foreground/50 transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-muted-foreground/50 transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
