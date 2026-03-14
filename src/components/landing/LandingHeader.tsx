import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
    <header className="border-b border-border px-6 py-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1
            className="font-display text-xs sm:text-sm text-primary text-glow tracking-wider cursor-pointer"
            onClick={() => navigate('/')}
          >
            DEGEN TOOLS
          </h1>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-1.5 rounded-md hover:bg-primary/5"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <span className="text-xs text-muted-foreground hidden sm:block">{email}</span>
              <Button size="sm" variant="ghost" onClick={onSignOut} className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onSignIn} variant="outline" className="text-xs">
              <LogIn className="w-4 h-4 mr-1" /> Sign In
            </Button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-muted-foreground hover:text-foreground ml-1"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav className="md:hidden mt-3 pt-3 border-t border-border flex flex-col gap-1">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-md hover:bg-primary/5 text-left"
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
