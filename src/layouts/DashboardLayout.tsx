import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building,
  Building2,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  Mail,
  Puzzle,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';

import { useAuth } from '@hooks/useAuth';
import { useBalance } from '@hooks/useBalance';
import { useModules } from '@hooks/useModules';
import { useCanAccess } from '@/hooks/usePermissions';
import { useProfileOnboarding } from '@/hooks/useProfileOnboarding';
import { useOrganizationProfile } from '@/hooks/useOrganizationProfile';

import { Sidebar } from '@/components/dashboard-layout/sidebar';
import { Header } from '@/components/dashboard-layout/header';
import { PageWrapper } from '@/components/dashboard-layout/page-wrapper';
import { OrganizationProfileModal } from '@/components/dashboard/organization/OrganizationProfileModal';
import { EmailVerificationBanner } from '@/components/dashboard/EmailVerificationBanner';
import {
  buildWorkspaceSummary,
  getPreferredWorkspaceRoute,
  prioritizeWorkspaceNavigation,
} from '@/utils/workspaceOrchestration';

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { balance: actualBalance, error: balanceError, refresh: refreshBalance } = useBalance();
  const { shouldShowOnboarding, hideOnboarding, skipOnboarding } = useProfileOnboarding();
  const { profile, fetchProfile } = useOrganizationProfile();
  const { activeModules, expiringModules, hasExpiring } = useModules({
    autoRefresh: true,
    refreshInterval: 900000,
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const canViewOrganization =
    useCanAccess({ permission: 'organization.view' }) ||
    useCanAccess({ role: 'organization_owner' }) ||
    useCanAccess({ role: 'organization_admin' });

  const canManageUsers =
    useCanAccess({ permission: 'users.manage' }) ||
    useCanAccess({ permission: 'users.manage_admin' }) ||
    useCanAccess({ role: 'organization_owner' }) ||
    useCanAccess({ role: 'organization_admin' });

  const canViewBilling =
    useCanAccess({ permission: 'billing.manage' }) ||
    useCanAccess({ permission: 'billing.view' }) ||
    useCanAccess({ role: 'organization_owner' }) ||
    useCanAccess({ role: 'accountant' });

  const canManageModules =
    useCanAccess({ permission: 'modules.manage' }) ||
    useCanAccess({ role: 'organization_owner' }) ||
    useCanAccess({ role: 'organization_admin' });

  const canInviteUsers =
    useCanAccess({ permission: 'users.invite' }) ||
    useCanAccess({ role: 'organization_owner' }) ||
    useCanAccess({ role: 'organization_admin' });

  const canManageMultiOrg =
    useCanAccess({ permission: 'multi-organization.manage' }) ||
    useCanAccess({ permission: 'multi_organization.manage' }) ||
    useCanAccess({ permission: 'multi-organization.*' });

  const hasMultiOrgModule = useCanAccess({ module: 'multi-organization' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const workspaceSummary = useMemo(
    () => buildWorkspaceSummary(profile?.workspace_profile),
    [profile?.workspace_profile]
  );

  const activeModuleSlugs = useMemo(
    () => activeModules.map((module) => module.slug),
    [activeModules]
  );

  const mainNavigation = useMemo(() => {
    const hasMultiOrgAccess = hasMultiOrgModule;
    const allNavigationItems = [
      {
        name: 'Обзор',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Сводная статистика и стартовые сценарии',
        visible: true,
      },
      {
        name: 'Мои проекты',
        href: '/dashboard/projects',
        icon: Briefcase,
        description: 'Проекты вашей организации',
        visible: true,
      },
      {
        name: 'Организация',
        href: '/dashboard/organization',
        icon: Building2,
        description: 'Данные и верификация',
        visible: canViewOrganization,
      },
      {
        name: 'Управление',
        href: '/dashboard/organization/settings',
        icon: Settings,
        description: 'Рабочий профиль и специализации',
        visible: canViewOrganization,
      },
      {
        name: 'Команда',
        href: '/dashboard/admins',
        icon: Users,
        description: 'Администраторы и прорабы',
        visible: canManageUsers,
      },
      {
        name: 'Роли',
        href: '/dashboard/custom-roles',
        icon: ShieldCheck,
        description: 'Кастомные роли организации',
        visible: canViewOrganization && canManageUsers,
      },
      {
        name: 'Финансы',
        href: '/dashboard/billing',
        icon: CreditCard,
        description: 'Баланс, тарифы и лимиты',
        visible: canViewBilling,
      },
      {
        name: 'Модули',
        href: '/dashboard/modules',
        icon: Puzzle,
        description: 'Оплаченные и рекомендованные модули',
        badge: hasExpiring ? expiringModules.length : undefined,
        visible: canManageModules,
      },
      {
        name: 'Связи',
        href: '/dashboard/contractor-invitations',
        icon: Mail,
        description: 'Подрядчики, поставщики и контрагенты',
        visible: canInviteUsers,
      },
    ];

    const baseNavigation = allNavigationItems.filter((item) => item.visible);

    if (hasMultiOrgAccess && canManageMultiOrg) {
      const userOrg = user && 'organization' in user ? (user.organization as any) : null;
      const isHoldingOrg = userOrg?.organization_type === 'holding';

      baseNavigation.push({
        name: isHoldingOrg ? 'Панель холдинга' : 'Мультиорганизация',
        href: isHoldingOrg
          ? '/landing/multi-organization/dashboard'
          : '/dashboard/multi-organization',
        icon: Building,
        description: isHoldingOrg ? 'Управление холдингом' : 'Создание холдинга',
        visible: true,
        badge: undefined,
      });
    }

    baseNavigation.push({
      name: 'Настройки',
      href: '/dashboard/profile',
      icon: UserCog,
      description: 'Профиль и настройки пользователя',
      visible: true,
      badge: undefined,
    });

    return prioritizeWorkspaceNavigation(
      baseNavigation,
      profile?.workspace_profile,
      activeModuleSlugs
    );
  }, [
    activeModuleSlugs,
    canInviteUsers,
    canManageModules,
    canManageMultiOrg,
    canManageUsers,
    canViewBilling,
    canViewOrganization,
    expiringModules.length,
    hasExpiring,
    hasMultiOrgModule,
    profile?.workspace_profile,
    user,
  ]);

  const preferredWorkspaceRoute = useMemo(
    () =>
      getPreferredWorkspaceRoute(
        mainNavigation,
        profile?.workspace_profile,
        activeModuleSlugs
      ),
    [activeModuleSlugs, mainNavigation, profile?.workspace_profile]
  );

  useEffect(() => {
    if (
      shouldShowOnboarding ||
      location.pathname !== '/dashboard' ||
      preferredWorkspaceRoute === '/dashboard' ||
      !profile?.organization_id
    ) {
      return;
    }

    const redirectKey = `workspace-redirect:${profile.organization_id}:${profile.primary_business_type ?? 'none'}`;

    if (sessionStorage.getItem(redirectKey) === 'done') {
      return;
    }

    sessionStorage.setItem(redirectKey, 'done');
    navigate(preferredWorkspaceRoute, { replace: true });
  }, [
    location.pathname,
    navigate,
    preferredWorkspaceRoute,
    profile?.organization_id,
    profile?.primary_business_type,
    shouldShowOnboarding,
  ]);

  const supportNavigation = [
    {
      name: 'Справка',
      href: '/dashboard/help',
      icon: HelpCircle,
      description: 'База знаний и FAQ',
    },
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
    onLogout: handleLogout,
    workspaceSummary,
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
        onClose={skipOnboarding}
        onComplete={(defaultRoute) => {
          hideOnboarding();
          navigate(defaultRoute || '/dashboard');
        }}
      />
    </div>
  );
};

export default DashboardLayout;
