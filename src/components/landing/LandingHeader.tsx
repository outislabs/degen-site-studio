import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

interface Props {
  isLoggedIn: boolean;
  email?: string;
  onSignIn: () => void;
  onSignOut: () => void;
}

const LandingHeader = ({ isLoggedIn, email, onSignIn, onSignOut }: Props) => {
  const navigate = useNavigate();
  return (
    <header className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛠️</span>
          <h1 className="font-display text-[10px] sm:text-xs text-primary text-glow tracking-wider cursor-pointer" onClick={() => navigate('/')}>DEGEN TOOLS</h1>
        </div>
        <button onClick={() => navigate('/pricing')} className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
          Pricing
        </button>
      </div>
      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">{email}</span>
          <Button size="sm" variant="ghost" onClick={onSignOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={onSignIn} variant="outline" className="text-xs">
          <LogIn className="w-4 h-4 mr-1" /> Sign In
        </Button>
      )}
    </header>
  );
};

export default LandingHeader;
