import { ReactNode, useState } from 'react';
import logo from '@/assets/logo.png';

import { useNavigate, useLocation } from 'react-router-dom';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Globe,
  Image,
  CreditCard,
  LogOut,
  Crown,
  Plus,
  ChevronRight,
  Menu,
  X,
  UserCog,
  Rocket,
  Wallet,
  Code2,
  Book,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/useAdmin';


interface Props {
  children: ReactNode;
  onNewSite?: () => void;
}

const navItems = [
  { label: 'Sites', icon: Globe, path: '/' },
  { label: 'Bags', icon: Wallet, path: '/bags' },
  { label: 'Studio', icon: Image, path: '/studio' },
  { label: 'API', icon: Code2, path: '/api' },
  { label: 'Pricing', icon: CreditCard, path: '/pricing' },
  { label: 'Account', icon: UserCog, path: '/account' },
];

const DashboardLayout = ({ children, onNewSite }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { plan, planId } = usePlan();
  const { isAdmin } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allNavItems = isAdmin
    ? [...navItems, { label: 'Admin', icon: Crown, path: '/admin' }]
    : navItems;

  const email = user?.email || '';
  const initials = email
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen gradient-degen flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <img
            src={logo}
            alt="Degen Tools"
            className="h-10 sm:h-11 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {allNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Plan badge */}
          <Badge
            variant="outline"
            className={cn(
              'hidden sm:inline-flex text-[10px] cursor-pointer hover:bg-primary/10 transition-colors',
              planId !== 'free' && 'border-primary/30 text-primary'
            )}
            onClick={() => navigate('/pricing')}
          >
            <Crown className="w-3 h-3 mr-1" />
            {plan.name}
          </Badge>

          {/* New Site button */}
          {onNewSite && (
            <Button
              size="sm"
              onClick={onNewSite}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hidden sm:inline-flex"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Site
            </Button>
          )}

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-primary/20 transition-all p-0.5">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-foreground leading-none">Account</p>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => navigate('/pricing')}
                className="cursor-pointer bg-primary text-black focus:bg-primary focus:text-black"
              >
                <Crown className="w-4 h-4 mr-2 text-black" />
                <div className="flex-1 flex items-center justify-between">
                  <span>{plan.name} Plan</span>
                  {planId !== 'whale' && (
                    <span className="text-[10px] text-black/70">Upgrade</span>
                  )}
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Mobile-only nav items */}
              <div className="lg:hidden">
                {allNavItems.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn('cursor-pointer', isActive(item.path) && 'text-primary')}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </div>

              <DropdownMenuItem
                onClick={signOut}
                className="cursor-pointer text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile slide-down nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background/95 backdrop-blur-md px-4 py-3 space-y-1 animate-fade-in">
          {allNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {isActive(item.path) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}

          <button
            onClick={() => {
              navigate('/docs');
              setMobileMenuOpen(false);
            }}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              location.pathname === '/docs'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Book className="w-4 h-4" />
            Docs
          </button>

          {onNewSite && (
            <button
              onClick={() => {
                onNewSite();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground mt-2"
            >
              <Plus className="w-4 h-4" />
              New Site
            </button>
          )}
        </div>
      )}

      <MobileBottomNav onNewSite={onNewSite} />

      {/* Main content */}
      <main className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Desktop footer */}
      <footer className="hidden lg:block border-t border-border py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 DegenTools · Professional tools for unprofessional coins
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="https://x.com/degentoolshq" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter</a>
            <a href="/docs" className="hover:text-primary transition-colors">Docs</a>
            <a href="/pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="mailto:support@degentools.co" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
