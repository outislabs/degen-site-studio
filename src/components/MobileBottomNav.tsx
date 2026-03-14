import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, Image, CreditCard, UserCog, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Sites', icon: Globe, path: '/' },
  { label: 'Studio', icon: Image, path: '/studio' },
  { label: 'Pricing', icon: CreditCard, path: '/pricing' },
  { label: 'Account', icon: UserCog, path: '/account' },
];

interface Props {
  onNewSite?: () => void;
}

const MobileBottomNav = ({ onNewSite }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
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
            onClick={onNewSite}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-primary min-w-[50px]"
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-[10px] font-medium">New</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileBottomNav;
