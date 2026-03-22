import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { useAdmin } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import {
  Globe,
  Image,
  CreditCard,
  LogOut,
  Crown,
  Plus,
  UserCog,
  Wallet,
  Code2,
  Book,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const navItems = [
  { label: 'Sites', icon: Globe, path: '/' },
  { label: 'Bags', icon: Wallet, path: '/bags' },
  { label: 'Studio', icon: Image, path: '/studio' },
  { label: 'API', icon: Code2, path: '/api' },
  { label: 'Pricing', icon: CreditCard, path: '/pricing' },
  { label: 'Docs', icon: Book, path: '/docs' },
  { label: 'Account', icon: UserCog, path: '/account' },
];

interface Props {
  onNewSite?: () => void;
}

const AppSidebar = ({ onNewSite }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { plan, planId } = usePlan();
  const { isAdmin } = useAdmin();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const allNavItems = isAdmin
    ? [...navItems, { label: 'Admin', icon: Crown, path: '/admin' }]
    : navItems;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2 px-1">
          <img
            src={logo}
            alt="DegenTools"
            className={cn('cursor-pointer transition-all', collapsed ? 'h-7 w-7 object-contain' : 'h-9 w-auto')}
            onClick={() => navigate('/')}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* New site actions */}
        {onNewSite && !collapsed && (
          <div className="px-3 mb-2 space-y-1.5">
            <Button
              size="sm"
              onClick={onNewSite}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Site
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/launch')}
              className="w-full border-primary/20 text-primary hover:bg-primary/10"
            >
              <Rocket className="w-3.5 h-3.5 mr-1.5" /> Launch Token
            </Button>
          </div>
        )}

        {onNewSite && collapsed && (
          <div className="px-2 mb-2 space-y-1.5">
            <Button size="icon" onClick={onNewSite} className="w-8 h-8 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {/* Plan badge */}
        {!collapsed && (
          <button
            onClick={() => navigate('/pricing')}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
              'bg-primary/5 hover:bg-primary/10 border border-primary/10'
            )}
          >
            <Crown className={cn('w-3.5 h-3.5', planId !== 'starter' ? 'text-primary' : 'text-muted-foreground')} />
            <span className={planId !== 'starter' ? 'text-primary' : 'text-muted-foreground'}>{plan.name} Plan</span>
            {planId === 'starter' && (
              <Badge variant="outline" className="ml-auto text-[8px] px-1 py-0 border-primary/20 text-primary">
                Upgrade
              </Badge>
            )}
          </button>
        )}

        {/* User info + sign out */}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && (
            <span className="truncate">{user?.email?.split('@')[0] || 'Sign Out'}</span>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
