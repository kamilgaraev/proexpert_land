import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LogOut,
  Menu as MenuIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

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
}

const SidebarContent = ({ navigation, supportNavigation, onLogout, pathname }: { 
  navigation: NavigationItem[], 
  supportNavigation: NavigationItem[], 
  onLogout: () => void,
  pathname: string 
}) => (
  <div className="flex h-full flex-col gap-4 py-4">
    <div className="flex h-12 items-center px-6 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-600 shadow-lg shadow-primary/20 text-white">
          <span className="text-xl font-bold">P</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none tracking-tight">ProHelper</span>
          <span className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">Личный кабинет</span>
        </div>
      </div>
    </div>
    
    <ScrollArea className="flex-1 px-4">
      <div className="flex flex-col gap-1.5 py-2">
        {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            return (
            <Link
                key={item.name}
                to={item.href}
                className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
            >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <div className="flex flex-1 flex-col">
                    <span className={cn("leading-none", isActive ? "font-bold" : "font-medium")}>{item.name}</span>
                    {item.description && !isActive && (
                         <span className="mt-1 text-[10px] font-normal opacity-0 group-hover:opacity-70 transition-opacity line-clamp-1">{item.description}</span>
                    )}
                </div>
                {item.badge ? (
                <Badge variant="destructive" className="ml-auto h-5 min-w-5 rounded-full px-1.5 flex items-center justify-center text-[10px] shadow-sm">
                    {item.badge}
                </Badge>
                ) : null}
            </Link>
            )
        })}
      </div>
      
      <div className="my-6 mx-2 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="flex flex-col gap-1.5">
            <div className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 opacity-70">Поддержка</div>
            {supportNavigation.map((item) => {
                 const isActive = pathname === item.href;
                 return (
                <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                        ? "bg-secondary text-foreground font-bold"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                    <span>{item.name}</span>
                </Link>
                 )
            })}
        </div>
    </ScrollArea>

    <div className="mt-auto px-4 pb-4">
      <Button 
        variant="ghost" 
        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-12 rounded-xl"
        onClick={onLogout}
      >
        <LogOut className="h-5 w-5" />
        <span>Выйти из системы</span>
      </Button>
    </div>
  </div>
);

export function Sidebar({ navigation, supportNavigation, onLogout }: SidebarProps) {
  const location = useLocation();
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-background/95 backdrop-blur-xl md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col z-50 shadow-sm">
        <SidebarContent 
            navigation={navigation} 
            supportNavigation={supportNavigation} 
            onLogout={onLogout} 
            pathname={location.pathname}
        />
      </aside>
    </>
  );
}

export function MobileSidebar({ navigation, supportNavigation, onLogout }: SidebarProps) {
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
            <SheetContent side="left" className="p-0 w-72 sm:w-80">
                 <SidebarContent 
                    navigation={navigation} 
                    supportNavigation={supportNavigation} 
                    onLogout={onLogout} 
                    pathname={location.pathname}
                />
            </SheetContent>
        </Sheet>
    )
}

