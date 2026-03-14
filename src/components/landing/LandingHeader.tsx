import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo.png';

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
    <header className="border-b border-border/50 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <img
            src={logo}
            alt="Degen Tools"
            className="h-9 sm:h-12 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
          

          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-[11px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors font-medium px-2.5 sm:px-3 py-2 rounded-lg hover:bg-primary/5"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[120px]">{email}</span>
              <Button size="sm" variant="ghost" onClick={onSignOut} className="text-muted-foreground hover:text-foreground h-8 w-8 p-0">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onSignIn} className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-[10px] sm:text-xs rounded-lg h-8 sm:h-9 px-3 sm:px-4">
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> Sign In
            </Button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-muted-foreground hover:text-foreground p-1"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden mt-3 pt-3 border-t border-border/50 flex flex-col gap-0.5 pb-2">
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
