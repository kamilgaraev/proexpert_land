import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu as MenuIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import type { WorkspaceSummary } from '@/utils/workspaceOrchestration';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  visible?: boolean;
  badge?: number | string;
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

const SidebarContent = ({
  navigation,
  supportNavigation,
  onLogout,
  pathname,
  workspaceSummary,
}: {
  navigation: NavigationItem[];
  supportNavigation: NavigationItem[];
  onLogout: () => void;
  pathname: string;
  workspaceSummary?: WorkspaceSummary | null;
}) => (
  <div className="flex h-full flex-col gap-4 py-4">
    <div className="mb-4 flex h-12 items-center px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg shadow-primary/20">
          <span className="text-xl font-bold">P</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-none tracking-tight">ProHelper</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Личный кабинет
          </span>
        </div>
      </div>
    </div>

    {workspaceSummary ? (
      <div className="px-4">
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-background to-orange-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Основной режим
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {workspaceSummary.label}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {workspaceSummary.description}
          </p>
          {workspaceSummary.modeLabels.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {workspaceSummary.modeLabels.map((modeLabel) => (
                <Badge key={modeLabel} variant="secondary" className="rounded-full">
                  {modeLabel}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    ) : null}

    <ScrollArea className="flex-1 px-4">
      <div className="flex flex-col gap-1.5 py-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {isActive ? (
                <div className="absolute bottom-0 left-0 top-0 w-1 rounded-r-full bg-primary" />
              ) : null}
              <item.icon
                className={cn(
                  'h-5 w-5 transition-transform group-hover:scale-110',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <div className="flex flex-1 flex-col">
                <span className={cn('leading-none', isActive ? 'font-bold' : 'font-medium')}>
                  {item.name}
                </span>
                {item.description && !isActive ? (
                  <span className="mt-1 line-clamp-1 text-[10px] font-normal opacity-0 transition-opacity group-hover:opacity-70">
                    {item.description}
                  </span>
                ) : null}
              </div>
              {item.badge ? (
                <Badge
                  variant="destructive"
                  className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] shadow-sm"
                >
                  {item.badge}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="mx-2 my-6 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="flex flex-col gap-1.5">
        <div className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-70">
          Поддержка
        </div>
        {supportNavigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-secondary font-bold text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </ScrollArea>

    <div className="mt-auto px-4 pb-4">
      <Button
        variant="ghost"
        className="h-12 w-full justify-start gap-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={onLogout}
      >
        <LogOut className="h-5 w-5" />
        <span>Выйти из системы</span>
      </Button>
    </div>
  </div>
);

export function Sidebar({
  navigation,
  supportNavigation,
  onLogout,
  workspaceSummary,
}: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="z-50 hidden border-r bg-background/95 shadow-sm backdrop-blur-xl md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col">
      <SidebarContent
        navigation={navigation}
        supportNavigation={supportNavigation}
        onLogout={onLogout}
        pathname={location.pathname}
        workspaceSummary={workspaceSummary}
      />
    </aside>
  );
}

export function MobileSidebar({
  navigation,
  supportNavigation,
  onLogout,
  workspaceSummary,
}: SidebarProps) {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 sm:w-80">
        <SidebarContent
          navigation={navigation}
          supportNavigation={supportNavigation}
          onLogout={onLogout}
          pathname={location.pathname}
          workspaceSummary={workspaceSummary}
        />
      </SheetContent>
    </Sheet>
  );
}
