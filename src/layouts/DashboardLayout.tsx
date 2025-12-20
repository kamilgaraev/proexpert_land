import { useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  Settings,
  Users,
  ShieldCheck,
  CreditCard,
  Puzzle,
  Mail,
  Building,
  UserCog,
  HelpCircle
} from 'lucide-react';

import { useAuth } from '@hooks/useAuth';
import { useModules } from '@hooks/useModules';
import { useCanAccess } from '@/hooks/usePermissions';
import { useBalance } from '@hooks/useBalance';
import { useProfileOnboarding } from '@/hooks/useProfileOnboarding';

import { Sidebar } from '@/components/dashboard-layout/sidebar';
import { Header } from '@/components/dashboard-layout/header';
import { PageWrapper } from '@/components/dashboard-layout/page-wrapper';
import { OrganizationProfileModal } from '@/components/dashboard/organization/OrganizationProfileModal';
import { EmailVerificationBanner } from '@/components/dashboard/EmailVerificationBanner';

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const { balance: actualBalance, error: balanceError, refresh: refreshBalance } = useBalance();
  
  const {
    shouldShowOnboarding,
    hideOnboarding
  } = useProfileOnboarding();
  
  // Modules
  const { 
    expiringModules, 
    hasExpiring
  } = useModules({ autoRefresh: true, refreshInterval: 900000 });

  // Permissions
  const canViewOrganization = useCanAccess({ permission: 'organization.view' }) || 
                              useCanAccess({ role: 'organization_owner' }) ||
                              useCanAccess({ role: 'organization_admin' });
  
  const canManageUsers = useCanAccess({ permission: 'users.manage' }) ||
                         useCanAccess({ permission: 'users.manage_admin' }) ||
                         useCanAccess({ role: 'organization_owner' }) ||
                         useCanAccess({ role: 'organization_admin' });
  
  const canViewBilling = useCanAccess({ permission: 'billing.manage' }) ||
                         useCanAccess({ permission: 'billing.view' }) ||
                         useCanAccess({ role: 'organization_owner' }) ||
                         useCanAccess({ role: 'accountant' });
  
  const canViewLimits = useCanAccess({ role: 'organization_owner' }) ||
                        useCanAccess({ role: 'organization_admin' });
  
  const canManageBilling = useCanAccess({ permission: 'billing.manage' }) ||
                           useCanAccess({ role: 'organization_owner' });
  
  const canManageModules = useCanAccess({ permission: 'modules.manage' }) ||
                           useCanAccess({ role: 'organization_owner' }) ||
                           useCanAccess({ role: 'organization_admin' });
  
  const canInviteUsers = useCanAccess({ permission: 'users.invite' }) ||
                         useCanAccess({ role: 'organization_owner' }) ||
                         useCanAccess({ role: 'organization_admin' });

  const canManageMultiOrg = useCanAccess({ permission: 'multi-organization.manage' }) || 
                            useCanAccess({ permission: 'multi_organization.manage' }) ||
                            useCanAccess({ permission: 'multi-organization.*' });
  const hasMultiOrgModule = useCanAccess({ module: 'multi-organization' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const mainNavigation = useMemo(() => {
    const hasMultiOrgAccess = hasMultiOrgModule;

    const allNavigationItems = [
      { 
        name: 'Обзор', 
        href: '/dashboard', 
        icon: LayoutDashboard,
        description: 'Общая статистика проектов',
        visible: true
      },
      { 
        name: 'Мои проекты', 
        href: '/dashboard/projects', 
        icon: Briefcase,
        description: 'Проекты вашей организации',
        visible: true
      },
      { 
        name: 'Организация', 
        href: '/dashboard/organization', 
        icon: Building2,
        description: 'Данные и верификация',
        visible: canViewOrganization
      },
      { 
        name: 'Управление', 
        href: '/dashboard/organization/settings', 
        icon: Settings,
        description: 'Управление организацией',
        visible: canViewOrganization
      },
      { 
        name: 'Команда', 
        href: '/dashboard/admins', 
        icon: Users,
        description: 'Администраторы и прорабы',
        visible: canManageUsers
      },
      { 
        name: 'Роли', 
        href: '/dashboard/custom-roles', 
        icon: ShieldCheck,
        description: 'Кастомные роли организации',
        visible: canViewOrganization && canManageUsers
      },
      { 
        name: 'Финансы', 
        href: '/dashboard/billing', 
        icon: CreditCard,
        description: 'Баланс, тарифы и лимиты',
        visible: canViewBilling
      },
      { 
        name: 'Модули', 
        href: '/dashboard/modules', 
        icon: Puzzle,
        description: 'Модули организации',
        badge: hasExpiring ? expiringModules.length : undefined,
        visible: canManageModules
      },
      { 
        name: 'Приглашения', 
        href: '/dashboard/contractor-invitations', 
        icon: Mail,
        description: 'Приглашения подрядчиков',
        visible: canInviteUsers
      }
    ];

    const baseNavigation = allNavigationItems.filter(item => item.visible);

    if (hasMultiOrgAccess && canManageMultiOrg) {
      const userOrg = user && 'organization' in user ? (user.organization as any) : null;
      const isHoldingOrg = userOrg?.organization_type === 'holding';
      
      baseNavigation.push({
        name: isHoldingOrg ? 'Панель холдинга' : 'Мультиорганизация', 
        href: isHoldingOrg ? '/landing/multi-organization/dashboard' : '/dashboard/multi-organization', 
        icon: Building,
        description: isHoldingOrg 
          ? 'Управление холдингом'
          : 'Создание холдинга',
        visible: true,
        badge: undefined
      });
    }

    baseNavigation.push({
      name: 'Настройки', 
      href: '/dashboard/profile', 
      icon: UserCog,
      description: 'Профиль и настройки',
      visible: true,
      badge: undefined
    });

    return baseNavigation;
  }, [hasExpiring, expiringModules.length, 
      canViewOrganization, canManageUsers, canViewBilling, canViewLimits, 
      canManageBilling, canManageModules, canInviteUsers, canManageMultiOrg, hasMultiOrgModule, user]);

  const supportNavigation = [
    { 
      name: 'Справка', 
      href: '/dashboard/help', 
      icon: HelpCircle,
      description: 'База знаний и FAQ'
    }
  ];

  const userNavigation = [
    { name: 'Профиль', href: '/dashboard/profile', onClick: () => {} },
    { name: 'Настройки', href: '/dashboard/settings', onClick: () => {} },
    { name: 'Выйти', href: '/login', onClick: handleLogout },
  ];

  const sidebarProps = {
    navigation: mainNavigation,
    supportNavigation,
    userNavigation,
    onLogout: handleLogout
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Sidebar {...sidebarProps} />
      <div className="flex flex-1 flex-col md:pl-72">
        <Header 
            user={user} 
            balance={actualBalance} 
            balanceError={balanceError}
            refreshBalance={refreshBalance}
            onLogout={handleLogout}
            sidebarProps={sidebarProps}
            navigation={mainNavigation}
        />
        <EmailVerificationBanner />
        <main className="flex-1">
           <PageWrapper>
              <Outlet />
           </PageWrapper>
        </main>
      </div>

      <OrganizationProfileModal
        isOpen={shouldShowOnboarding}
        onClose={hideOnboarding}
        onComplete={() => {
          hideOnboarding();
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default DashboardLayout; 
