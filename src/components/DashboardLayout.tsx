import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import MobileBottomNav from '@/components/MobileBottomNav';

interface Props {
  children: ReactNode;
  onNewSite?: () => void;
}

const DashboardLayout = ({ children, onNewSite }: Props) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen gradient-degen flex w-full">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <AppSidebar onNewSite={onNewSite} />
        </div>

        {/* Mobile bottom nav */}
        <MobileBottomNav onNewSite={onNewSite} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with sidebar trigger */}
          <header className="hidden lg:flex items-center h-12 border-b border-border px-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          </header>

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
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
