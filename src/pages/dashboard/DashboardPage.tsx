import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  FileText,
  CheckCircle,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  Plus,
} from 'lucide-react';

import { landingService } from '@utils/api';
import type { LandingDashboardResponse } from '@utils/api';
import LineChart from '@components/dashboard/LineChart';
import DonutStatusChart from '@components/dashboard/DonutStatusChart';
import { usePermissionsReady } from '@/hooks/usePermissions';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const isSuccessfulStatus = (status: number) => status >= 200 && status < 300;

const dashboardStatusFallbackLabels: Record<string, string> = {
  active: 'Активные',
  completed: 'Завершенные',
  draft: 'Черновики',
  planned: 'Запланированные',
  planning: 'Планирование',
  paused: 'Приостановленные',
  cancelled: 'Отмененные',
  terminated: 'Расторгнутые',
  suspended: 'Приостановленные',
  on_hold: 'На паузе',
  archived: 'Архивные',
};

const localizeStatusDistribution = (
  distribution?: Record<string, number>,
  labels?: Record<string, string>,
): Record<string, number> => Object.entries(distribution ?? {}).reduce<Record<string, number>>(
  (result, [status, value]) => {
    const label = labels?.[status] ?? dashboardStatusFallbackLabels[status] ?? 'Другой статус';
    result[label] = (result[label] ?? 0) + value;

    return result;
  },
  {},
);

const DashboardPage = () => {
  const [landingData, setLandingData] = useState<LandingDashboardResponse | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const permissionsReady = usePermissionsReady();
  useEffect(() => {
    if (!permissionsReady) {
      return;
    }

    let isMounted = true;

    (async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      const landingResult = await landingService.getLandingDashboard()
        .then((value) => ({ status: 'fulfilled' as const, value }))
        .catch((reason) => ({ status: 'rejected' as const, reason }));

      if (!isMounted) {
        return;
      }

      if (
        landingResult.status === 'fulfilled' &&
        isSuccessfulStatus(landingResult.value.status) &&
        landingResult.value.data
      ) {
        setLandingData(landingResult.value.data);
      } else {
        setLandingData(null);
        setDashboardError('Не удалось загрузить сводку. Попробуйте обновить страницу.');
      }

      setDashboardLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [permissionsReady]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(val);
  const projectStatusChartData = localizeStatusDistribution(
    landingData?.charts?.projects_status,
    landingData?.charts?.status_labels?.projects,
  );

  const statCards = landingData ? [
    {
      name: 'Проекты',
      value: landingData.projects?.total || 0,
      icon: Building2,
      description: 'Всего объектов'
    },
    {
      name: 'Контракты',
      value: landingData.contracts?.total || 0,
      icon: FileText,
      description: 'Всего договоров'
    },
    {
      name: 'Команда',
      value: landingData.team?.total || 0,
      icon: Users,
      description: 'Пользователей организации'
    },
    {
      name: 'Акты',
      value: landingData.acts?.total || 0,
      icon: CheckCircle,
      description: 'Всего актов'
    },
  ] : [];

  const quickActions = [
    {
      name: 'Создать проект',
      description: 'Новый объект строительства',
      href: 'https://admin.1мост.рф/projects/create',
      icon: Building2,
      variant: 'default' as const
    },
    {
      name: 'Сотрудники',
      description: 'Добавить сотрудника',
      href: '/dashboard/admins',
      icon: Users,
      variant: 'outline' as const
    },
    {
      name: 'Приглашения подрядчиков',
      description: 'Пригласить компанию к работе',
      href: '/dashboard/contractor-invitations',
      icon: BarChart,
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Обзор</h1>
          <p className="text-muted-foreground">Сводная информация по вашим проектам и финансам.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button asChild>
             <Link to="https://admin.1мост.рф/projects/create">
               <Plus className="h-5 w-5 mr-2" />
               Новый проект
             </Link>
           </Button>
        </div>
      </div>

      {dashboardLoading && !landingData && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            Загружаем сводку…
          </CardContent>
        </Card>
      )}

      {dashboardError && !dashboardLoading && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-6 flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">{dashboardError}</span>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      {landingData && (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
             {/* Financial Card - Featured */}
             <Card className="border-border bg-card shadow-none rounded-lg md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Баланс организации
                  </CardTitle>
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(landingData.financial?.balance || 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Доступные средства
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="min-w-0 border-t border-border pt-3">
                          <div className="flex items-center text-muted-foreground text-xs mb-1">
                             <ArrowUpRight className="h-5 w-5 mr-1" />
                             Поступления
                          </div>
                          <div className="font-semibold text-lg">{formatCurrency(landingData.financial?.credits_this_month || 0)}</div>
                      </div>
                      <div className="min-w-0 border-t border-border pt-3">
                          <div className="flex items-center text-muted-foreground text-xs mb-1">
                             <ArrowDownRight className="h-5 w-5 mr-1" />
                             Расходы
                          </div>
                          <div className="font-semibold text-lg">{formatCurrency(landingData.financial?.debits_this_month || 0)}</div>
                      </div>
                  </div>
                </CardContent>
              </Card>

             {statCards.slice(0, 2).map((stat) => (
                <Card key={stat.name} className="rounded-lg border-border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.name}
                    </CardTitle>
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                    </p>
                    </CardContent>
                </Card>
             ))}
        </div>
      )}

      {landingData && (
         <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {statCards.slice(2).map((stat) => (
                <Card key={stat.name} className="rounded-lg border-border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.name}
                    </CardTitle>
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                    </p>
                    </CardContent>
                </Card>
             ))}
              <Card className="md:col-span-2 rounded-lg border-border bg-card shadow-none">
                 <CardHeader className="pb-2">
                     <CardTitle className="text-base">Быстрые действия</CardTitle>
                 </CardHeader>
                 <CardContent className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                     {quickActions.map((action) => (
                         <Button key={action.name} variant="outline" className="h-auto min-h-14 whitespace-normal rounded-md py-3 justify-start text-left bg-card shadow-none" asChild>
                             <Link to={action.href}>
                                 <div className="mr-3 shrink-0">
                                     <action.icon className="h-5 w-5 text-primary" />
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="font-medium">{action.name}</span>
                                     <span className="text-xs text-muted-foreground font-normal">{action.description}</span>
                                 </div>
                             </Link>
                         </Button>
                     ))}
                 </CardContent>
              </Card>
         </div>
      )}

      {/* Charts */}
      {landingData && (
         <div className="grid gap-4 xl:grid-cols-7">
             <Card className="rounded-lg shadow-none xl:col-span-4">
                 <CardHeader>
                     <CardTitle>Проекты по месяцам</CardTitle>
                     <CardDescription>Динамика создания новых объектов</CardDescription>
                 </CardHeader>
                 <CardContent className="h-[300px] pl-2 pr-4 pb-6">
                    <LineChart
                        title=""
                        labels={landingData.charts?.projects_monthly?.labels || []}
                        values={landingData.charts?.projects_monthly?.values || []}
                    />
                 </CardContent>
             </Card>
             <Card className="rounded-lg shadow-none xl:col-span-3">
                 <CardHeader>
                     <CardTitle>Статус проектов</CardTitle>
                     <CardDescription>Распределение по этапам</CardDescription>
                 </CardHeader>
                 <CardContent className="h-[300px] pb-6">
                    <DonutStatusChart title="" data={projectStatusChartData} />
                 </CardContent>
             </Card>
         </div>
      )}
      
      {/* Additional Charts */}
      {landingData && (
         <div className="grid gap-4 2xl:grid-cols-3">
            <Card>
                 <CardHeader>
                     <CardTitle className="text-sm">Контракты</CardTitle>
                 </CardHeader>
                 <CardContent className="h-[240px] pl-2 pr-4 pb-6">
                    <LineChart
                        title=""
                        labels={landingData.charts?.contracts_monthly?.labels || []}
                        values={landingData.charts?.contracts_monthly?.values || []}
                    />
                 </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                     <CardTitle className="text-sm">Завершённые работы</CardTitle>
                 </CardHeader>
                 <CardContent className="h-[240px] pl-2 pr-4 pb-6">
                    <LineChart
                        title=""
                        labels={landingData.charts?.completed_works_monthly?.labels || []}
                        values={landingData.charts?.completed_works_monthly?.values || []}
                    />
                 </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                     <CardTitle className="text-sm">Изменение баланса</CardTitle>
                 </CardHeader>
                 <CardContent className="h-[240px] pl-2 pr-4 pb-6">
                    <LineChart
                        title=""
                        labels={landingData.charts?.balance_monthly?.labels || []}
                        values={landingData.charts?.balance_monthly?.values || []}
                    />
                 </CardContent>
            </Card>
         </div>
      )}

    </div>
  );
};

export default DashboardPage;
