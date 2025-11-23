import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  Wallet, 
  ShieldCheck, 
  User,
  LogOut,
  Settings,
  Building
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/dashboard/notifications';
import { MobileSidebar } from './sidebar';

interface HeaderProps {
  user: any;
  balance: any;
  balanceError: any;
  refreshBalance: () => void;
  onLogout: () => void;
  navigation: any[];
  sidebarProps: any;
}

export function Header({ 
  user, 
  balance, 
  balanceError, 
  refreshBalance, 
  onLogout,
  sidebarProps 
}: HeaderProps) {
  // const location = useLocation();

  // Extract initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6 md:px-8">
        <MobileSidebar {...sidebarProps} />
        
        <div className="ml-4 hidden md:flex md:items-center md:gap-4 lg:gap-6">
          {/* Breadcrumbs Placeholder - can be made dynamic */}
           <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4 text-primary" />
                <span>ProHelper</span>
                <span>/</span>
                <span className="text-foreground font-medium">
                    Личный кабинет
                </span>
           </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {/* Global Search - Placeholder */}
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск по проектам..."
              className="pl-9 h-9 rounded-lg bg-muted/50 border-none focus-visible:bg-background"
            />
          </div>

          {/* Balance Widget */}
           <Link 
                to="/dashboard/billing" 
                className="hidden sm:flex items-center px-3 py-1.5 bg-gradient-to-r from-safety-500/10 to-safety-600/10 hover:from-safety-500/20 hover:to-safety-600/20 border border-safety-200 rounded-lg transition-all group"
                onClick={(e: any) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    refreshBalance();
                  }
                }}
                title="Ctrl+Click для обновления баланса"
            >
                <Wallet className="h-4 w-4 mr-2 text-safety-600 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col items-start">
                     <span className="text-[10px] text-muted-foreground leading-none">Баланс</span>
                     <span className="text-sm font-bold text-safety-700 leading-none mt-1">
                        {balance !== null ? (
                            <>
                            {balance.balance_formatted}
                            {balance.currency && <span className="ml-1 text-[10px]">{balance.currency}</span>}
                            </>
                        ) : balanceError ? (
                            'Ошибка'
                        ) : (
                            '...'
                        )}
                     </span>
                </div>
            </Link>

            {/* Notifications */}
            <div className="flex items-center">
               <NotificationBell />
            </div>

             {/* Admin Panel Link */}
             <Button variant="ghost" size="sm" className="hidden lg:flex text-muted-foreground" asChild>
                <a href="https://admin.prohelper.pro/" target="_blank" rel="noopener noreferrer">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Админ
                </a>
             </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9 border">
                            <AvatarImage src={user?.avatar_url} alt={user?.name} />
                            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.name || 'Пользователь'}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link to="/dashboard/profile">
                                <User className="mr-2 h-4 w-4" />
                                <span>Профиль</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/dashboard/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Настройки</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Выйти</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

