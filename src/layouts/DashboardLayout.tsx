import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  BookOpen,
  Building,
  Building2,
  HelpCircle,
  History,
  Handshake,
  LayoutDashboard,
  Puzzle,
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

  const { shouldShowOnboarding, hideOnboarding, skipOnboarding } = useProfileOnboarding();
  const { profile, fetchProfile } = useOrganizationProfile();

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

  const { balance: actualBalance, error: balanceError, refresh: refreshBalance } = useBalance({
    enabled: canViewBilling,
  });

  const { activeModules } = useModules({
    autoRefresh: true,
    refreshInterval: 900000,
    includeBilling: canViewBilling,
  });

  const canInviteUsers =
    useCanAccess({ permission: 'users.invite' }) ||
    useCanAccess({ role: 'organization_owner' }) ||
    useCanAccess({ role: 'organization_admin' });

  const canViewContractorMarketplaceProfile = useCanAccess({ permission: 'contractor_marketplace.profile.view' });
  const canSearchContractorMarketplace = useCanAccess({ permission: 'contractor_marketplace.search.view' });
  const canViewContractorMarketplaceOffers = useCanAccess({ permission: 'contractor_marketplace.offers.view' });
  const canCreateContractorMarketplaceOffers = useCanAccess({ permission: 'contractor_marketplace.offers.create' });
  const canAccessContractorMarketplaceAsOwner = useCanAccess({ role: 'organization_owner' });
  const canAccessContractorMarketplaceAsAdmin = useCanAccess({ role: 'organization_admin' });
  const canViewContractorMarketplace =
    canViewContractorMarketplaceProfile ||
    canSearchContractorMarketplace ||
    canViewContractorMarketplaceOffers ||
    canCreateContractorMarketplaceOffers ||
    canAccessContractorMarketplaceAsOwner ||
    canAccessContractorMarketplaceAsAdmin;

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
        name: 'Главная',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Сводная статистика и стартовые сценарии',
        visible: true,
      },
      {
        name: 'Проекты',
        href: '/dashboard/projects',
        icon: Briefcase,
        description: 'Проекты вашей организации',
        visible: true,
      },
      {
        name: 'Данные компании',
        href: '/dashboard/organization',
        icon: Building2,
        description: 'Реквизиты, верификация и направления работы',
        aliases: ['направления работы', 'профиль организации', 'специализации'],
        visible: canViewOrganization,
      },
      {
        name: 'Сотрудники и доступ',
        href: '/dashboard/admins',
        icon: Users,
        description: 'Пользователи, роли и доступ к кабинету',
        aliases: ['сотрудники', 'права доступа', 'роли', 'пользователи', 'доступ'],
        activeHrefs: ['/dashboard/custom-roles'],
        visible: canManageUsers,
      },
      {
        name: 'Пакеты и оплата',
        href: '/dashboard/billing',
        icon: Puzzle,
        description: 'Подключенные разделы, тариф и оплата',
        aliases: ['разделы системы', 'модули', 'оплата', 'тариф', 'баланс', 'лимиты'],
        activeHrefs: [
          '/dashboard/billing',
        ],
        visible: canViewBilling,
      },
      {
        name: 'Подрядчики',
        href: canViewContractorMarketplace
          ? '/dashboard/contractor-marketplace'
          : '/dashboard/contractor-invitations',
        icon: Handshake,
        description: 'Каталог, приглашения и офферы подрядчиков',
        aliases: ['каталог подрядчиков', 'приглашения подрядчиков', 'офферы подрядчиков', 'партнеры'],
        activeHrefs: [
          '/dashboard/contractor-marketplace',
          '/dashboard/contractor-invitations',
          '/dashboard/contractor-referral-program',
        ],
        visible: canInviteUsers || canViewContractorMarketplace,
      },
    ];

    const baseNavigation = allNavigationItems.filter((item) => item.visible);

    if (hasMultiOrgAccess && canManageMultiOrg) {
      const userOrg = user && 'organization' in user ? (user.organization as any) : null;
      const isHoldingOrg = userOrg?.organization_type === 'parent' || userOrg?.is_holding === true;

      baseNavigation.push({
        name: isHoldingOrg ? 'Холдинг' : 'Группа компаний',
        href: isHoldingOrg
          ? '/landing/multi-organization/dashboard'
          : '/dashboard/multi-organization',
        icon: Building,
        description: isHoldingOrg ? 'Управление группой компаний' : 'Настройка группы компаний',
        visible: true,
      });
    }

    return prioritizeWorkspaceNavigation(
      baseNavigation,
      profile?.workspace_profile,
      activeModuleSlugs
    );
  }, [
    activeModuleSlugs,
    canInviteUsers,
    canManageMultiOrg,
    canManageUsers,
    canViewBilling,
    canViewContractorMarketplace,
    canViewOrganization,
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
      name: 'Помощь',
      href: '/dashboard/help',
      icon: HelpCircle,
      description: 'Вопросы и поддержка',
    },
    {
      name: 'Инструкции',
      href: '/dashboard/help/knowledge',
      icon: BookOpen,
      description: 'Руководства и практики',
    },
    {
      name: 'Что изменилось',
      href: '/dashboard/help/changelog',
      icon: History,
      description: 'Что изменилось',
    },
  ];

  const userNavigation = [
    { name: 'Мой профиль', href: '/dashboard/profile', onClick: () => {} },
    { name: 'Настройки кабинета', href: '/dashboard/settings', onClick: () => {} },
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
          showBalance={canViewBilling}
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
