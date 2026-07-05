import {
  useMemo,
  useState,
  type ComponentProps,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  Search, 
  X,
  Wallet, 
  ShieldCheck, 
  User,
  LogOut,
  Settings
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
import { cn } from '@/lib/utils';
import {
  buildDashboardSearchItems,
  findDashboardSearchItems,
  getDashboardProjectSearchHref,
  type DashboardNavigationItem,
} from './dashboard-search';

interface HeaderProps {
  user: any;
  showBalance?: boolean;
  balance: any;
  balanceError: any;
  refreshBalance: () => void;
  onLogout: () => void;
  navigation: DashboardNavigationItem[];
  sidebarProps: ComponentProps<typeof MobileSidebar>;
}

export function Header({ 
  user, 
  showBalance = true,
  balance, 
  balanceError, 
  refreshBalance, 
  onLogout,
  navigation,
  sidebarProps 
}: HeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  const dashboardSearchItems = useMemo(
    () =>
      buildDashboardSearchItems({
        navigation,
        supportNavigation: sidebarProps.supportNavigation,
        userNavigation: sidebarProps.userNavigation,
      }),
    [navigation, sidebarProps.supportNavigation, sidebarProps.userNavigation]
  );

  const searchResults = useMemo(
    () => findDashboardSearchItems(dashboardSearchItems, searchQuery),
    [dashboardSearchItems, searchQuery]
  );

  const trimmedSearchQuery = searchQuery.trim();

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setActiveResultIndex(0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    closeSearch();
  };

  const navigateFromSearch = (href: string) => {
    navigate(href);
    clearSearch();
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedSearchQuery) {
      return;
    }

    const selectedSearchResult = searchResults[activeResultIndex] ?? searchResults[0];
    navigateFromSearch(
      selectedSearchResult?.href ?? getDashboardProjectSearchHref(trimmedSearchQuery)
    );
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      clearSearch();
      return;
    }

    if (!isSearchOpen || searchResults.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveResultIndex((currentIndex) => (currentIndex + 1) % searchResults.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveResultIndex((currentIndex) =>
        currentIndex === 0 ? searchResults.length - 1 : currentIndex - 1
      );
    }
  };

  const handleSearchBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;

    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      closeSearch();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6 md:px-8">
        <MobileSidebar {...sidebarProps} />
        
        <div className="ml-4 hidden md:flex md:items-center md:gap-4 lg:gap-6">
          {/* Breadcrumbs Placeholder - can be made dynamic */}
           <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <img src="/logo.svg" alt="" className="h-5 w-5 object-contain" />
                <span>МОСТ</span>
                <span>/</span>
                <span className="text-foreground font-medium">
                    Личный кабинет
                </span>
           </div>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <div
            className="relative hidden w-80 md:block xl:w-96"
            onBlur={handleSearchBlur}
          >
            <form onSubmit={handleSearchSubmit}>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setActiveResultIndex(0);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Поиск по кабинету"
                aria-label="Поиск по личному кабинету"
                aria-expanded={isSearchOpen && Boolean(trimmedSearchQuery)}
                aria-controls="dashboard-search-results"
                autoComplete="off"
                className="h-10 rounded-xl border-primary/30 bg-background pl-10 pr-10 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-primary"
              />
              {trimmedSearchQuery ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Очистить поиск"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </form>

            {isSearchOpen && trimmedSearchQuery ? (
              <div
                id="dashboard-search-results"
                className="absolute right-0 top-12 z-50 w-full overflow-hidden rounded-xl border bg-background shadow-xl"
                role="listbox"
              >
                {searchResults.length > 0 ? (
                  <div className="max-h-[360px] overflow-y-auto p-1.5">
                    {searchResults.map((item, index) => (
                      <button
                        key={item.href}
                        type="button"
                        role="option"
                        aria-selected={activeResultIndex === index}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                          activeResultIndex === index
                            ? 'bg-primary/10 text-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                        onMouseEnter={() => setActiveResultIndex(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => navigateFromSearch(item.href)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{item.name}</div>
                          {item.description ? (
                            <div className="mt-0.5 truncate text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          ) : null}
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => navigateFromSearch(getDashboardProjectSearchHref(trimmedSearchQuery))}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">
                        Искать в проектах: {trimmedSearchQuery}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Откроем раздел проектов с этим запросом
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                )}
              </div>
            ) : null}
          </div>

          {showBalance && (
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
          )}

            {/* Notifications */}
            <div className="flex items-center">
               <NotificationBell />
            </div>

             {/* Admin Panel Link */}
             <Button variant="ghost" size="sm" className="hidden lg:flex text-muted-foreground" asChild>
                <a href="https://admin.1мост.рф/" target="_blank" rel="noopener noreferrer">
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
                                <span>Мой профиль</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/dashboard/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Настройки кабинета</span>
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

