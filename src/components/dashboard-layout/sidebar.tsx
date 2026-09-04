import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu as MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import type { WorkspaceSummary } from '@/utils/workspaceOrchestration';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  visible?: boolean;
  badge?: number | string;
  activeHrefs?: string[];
}

interface SidebarProps {
  navigation: NavigationItem[];
  supportNavigation: NavigationItem[];
  userNavigation: any[];
  onLogout: () => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  workspaceSummary?: WorkspaceSummary | null;
}

const isNavigationMatch = (pathname: string, item: NavigationItem) =>
  [item.href, ...(item.activeHrefs ?? [])].some(
    (href) => pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))
  );

const getActiveNavigationHref = (pathname: string, navigation: NavigationItem[]) =>
  navigation
    .filter((item) => isNavigationMatch(pathname, item))
    .sort((first, second) => second.href.length - first.href.length)[0]?.href;

const SidebarContent = ({ navigation, supportNavigation, onLogout, pathname, workspaceSummary }: {
  navigation: NavigationItem[];
  supportNavigation: NavigationItem[];
  onLogout: () => void;
  pathname: string;
  workspaceSummary?: WorkspaceSummary | null;
}) => {
  const activeNavigationHref = getActiveNavigationHref(pathname, navigation);
  const activeSupportHref = getActiveNavigationHref(pathname, supportNavigation);

  return (
    <div className="most-workspace-sidebar-content">
      <Link to="/dashboard" className="most-workspace-brand" aria-label="МОСТ — личный кабинет">
        <img src="/logo.svg" alt="" />
        <span>МОСТ</span>
      </Link>
      {workspaceSummary ? (
        <div className="most-workspace-context">
          <p className="font-semibold">{workspaceSummary.label}</p>
          <p className="most-workspace-caption">{workspaceSummary.description}</p>
          {workspaceSummary.modeLabels.length > 0 && (
            <p className="most-workspace-caption mt-2">{workspaceSummary.modeLabels.join(' · ')}</p>
          )}
        </div>
      ) : null}
      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Разделы кабинета" className="most-workspace-nav">
          {navigation.map((item) => (
            <Link key={item.href} to={item.href}
              aria-current={activeNavigationHref === item.href ? 'page' : undefined}
              className={cn('most-workspace-nav-link', activeNavigationHref === item.href && 'is-active')}>
              <item.icon aria-hidden="true" />
              <span className="min-w-0 flex-1">{item.name}</span>
              {item.badge ? <span className="most-workspace-nav-badge">{item.badge}</span> : null}
            </Link>
          ))}
        </nav>
        <nav aria-label="Помощь и инструкции" className="most-workspace-nav most-workspace-nav-support">
          {supportNavigation.map((item) => (
            <Link key={item.href} to={item.href}
              aria-current={activeSupportHref === item.href ? 'page' : undefined}
              className={cn('most-workspace-nav-link', activeSupportHref === item.href && 'is-active')}>
              <item.icon aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="most-workspace-sidebar-footer">
        <Button variant="ghost" className="most-workspace-logout" onClick={onLogout}>
          <LogOut aria-hidden="true" />
          Выйти
        </Button>
      </div>
    </div>
  );
};

export function Sidebar({ navigation, supportNavigation, onLogout, workspaceSummary }: SidebarProps) {
  const location = useLocation();
  return (
    <aside className="most-workspace-sidebar">
      <SidebarContent navigation={navigation} supportNavigation={supportNavigation}
        onLogout={onLogout} pathname={location.pathname} workspaceSummary={workspaceSummary} />
    </aside>
  );
}

export function MobileSidebar({ navigation, supportNavigation, onLogout, workspaceSummary }: SidebarProps) {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Открыть меню кабинета">
          <MenuIcon className="h-6 w-6" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="most-workspace most-workspace-mobile-sidebar"
        aria-label="Меню кабинета" aria-describedby={undefined}
        onClickCapture={(event) => {
          if (event.target instanceof Element && event.target.closest('a[href]')) setOpen(false);
        }}>
        <SheetTitle className="sr-only">Меню кабинета</SheetTitle>
        <SidebarContent navigation={navigation} supportNavigation={supportNavigation}
          onLogout={onLogout} pathname={location.pathname} workspaceSummary={workspaceSummary} />
      </SheetContent>
    </Sheet>
  );
}
