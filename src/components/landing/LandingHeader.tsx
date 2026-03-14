import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  isLoggedIn: boolean;
  email?: string;
  onSignIn: () => void;
  onSignOut: () => void;
}

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Content Studio', href: '#content-studio' },
  { label: 'Themes', href: '#themes' },
  { label: 'Pricing', href: '#pricing' },
];

const LandingHeader = ({ isLoggedIn, email, onSignIn, onSignOut }: Props) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="border-b border-border/50 px-6 py-4 sticky top-0 z-50 bg-background/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1
            className="font-display text-xs sm:text-sm text-primary text-glow tracking-wider cursor-pointer"
            onClick={() => navigate('/')}
          >
            DEGEN TOOLS
          </h1>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium px-3 py-2 rounded-lg hover:bg-primary/5"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-xs text-muted-foreground hidden sm:block">{email}</span>
              <Button size="sm" variant="ghost" onClick={onSignOut} className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onSignIn} className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-xs rounded-lg">
              <LogIn className="w-4 h-4 mr-1.5" /> Sign In
            </Button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-muted-foreground hover:text-foreground ml-1"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden mt-4 pt-4 border-t border-border/50 flex flex-col gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium px-3 py-2.5 rounded-lg hover:bg-primary/5 text-left"
            >
              {link.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};

export default LandingHeader;
