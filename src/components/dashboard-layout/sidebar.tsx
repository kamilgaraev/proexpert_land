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
  <div className="flex h-full flex-col gap-4">
    <div className="flex h-16 items-center border-b px-6 bg-gradient-to-r from-primary to-primary/90">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          <span className="text-xl font-bold text-white">P</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white leading-none">ProHelper</span>
          <span className="text-[10px] text-white/80 font-medium mt-1">Личный кабинет</span>
        </div>
      </div>
    </div>
    
    <ScrollArea className="flex-1 px-3">
      <div className="flex flex-col gap-1 py-2">
        {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
            <Link
                key={item.name}
                to={item.href}
                className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:scale-[1.02]",
                isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
            >
                <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                <div className="flex flex-1 flex-col">
                    <span className="leading-none">{item.name}</span>
                    {item.description && !isActive && (
                         <span className="mt-0.5 text-[10px] font-normal opacity-70 line-clamp-1">{item.description}</span>
                    )}
                </div>
                {item.badge ? (
                <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full px-0 flex items-center justify-center text-[10px]">
                    {item.badge}
                </Badge>
                ) : null}
            </Link>
            )
        })}
      </div>
      
      <div className="my-4 mx-3 h-[1px] bg-border" />

        <div className="flex flex-col gap-1">
            {supportNavigation.map((item) => {
                 const isActive = pathname === item.href;
                 return (
                <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:scale-[1.02]",
                        isActive
                        ? "bg-safety-500 text-white shadow-md shadow-safety-500/20"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                    <span>{item.name}</span>
                </Link>
                 )
            })}
        </div>
    </ScrollArea>

    <div className="mt-auto border-t p-4">
      <Button 
        variant="ghost" 
        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onLogout}
      >
        <LogOut className="h-4 w-4" />
        <span>Выйти</span>
      </Button>
    </div>
  </div>
);

export function Sidebar({ navigation, supportNavigation, onLogout }: SidebarProps) {
  const location = useLocation();
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-card/50 backdrop-blur-xl md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col z-50">
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

