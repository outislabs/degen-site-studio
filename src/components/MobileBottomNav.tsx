import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, Image, UserCog, Plus, Rocket, X, Wallet, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';

const baseNavItems = [
  { label: 'Sites', icon: Globe, path: '/' },
  { label: 'Bags', icon: Wallet, path: '/bags' },
  { label: 'Trade', icon: ArrowLeftRight, path: '/trade' },
  { label: 'Studio', icon: Image, path: '/studio' },
  { label: 'Account', icon: UserCog, path: '/account' },
];

interface Props {
  onNewSite?: () => void;
}

const MobileBottomNav = ({ onNewSite }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useAppSettings();
  const navItems = baseNavItems.filter((item) => {
    if (item.path === '/trade' && !settings.trade_terminal_enabled) return false;
    return true;
  });
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay menu */}
      {showMenu && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setShowMenu(false)}>
          <div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-card border border-border rounded-2xl p-3 space-y-1.5 shadow-xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowMenu(false);
                onNewSite?.();
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              New Site
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                navigate('/launch');
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-primary" />
              </div>
              Launch Token on Bags.fm
            </button>
          </div>
        </div>
      )}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md px-2 py-1.5">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[50px]',
                isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          {onNewSite && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-primary min-w-[50px]"
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                {showMenu ? (
                  <X className="w-3.5 h-3.5 text-primary-foreground" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-primary-foreground" />
                )}
              </div>
              <span className="text-[10px] font-medium">New</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileBottomNav;
