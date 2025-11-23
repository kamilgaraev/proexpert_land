import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  FileText,
  CheckCircle,
  Wallet,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  File,
  Plus,
  Ticket
} from 'lucide-react';

import { landingService, billingService } from '@utils/api';
import type { LandingDashboardResponse } from '@utils/api';
import LineChart from '@components/dashboard/LineChart';
import DonutStatusChart from '@components/dashboard/DonutStatusChart';
import { useSubscriptionLimits } from '@hooks/useSubscriptionLimits';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const DashboardPage = () => {
  const [landingData, setLandingData] = useState<LandingDashboardResponse | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  // const [dashboardLoading, setDashboardLoading] = useState(true);
  // const [dashboardError, setDashboardError] = useState<string | null>(null);

  const { 
    hasWarnings, 
    criticalWarnings, 
    // needsUpgrade 
  } = useSubscriptionLimits({
    autoRefresh: true,
    refreshInterval: 300000,
    onCritical: () => {},
    onWarning: () => {}
  });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: landing }, { data: planData }] = await Promise.all([
          landingService.getLandingDashboard(),
          billingService.getOrgDashboard(),
        ]);
        setLandingData(landing);
        setDashboard(planData);
        // setDashboardError(null);
        // setDashboardLoading(false);
      } catch (e: any) {
        // setDashboardError(e.message || 'Ошибка загрузки данных');
        // setDashboardLoading(false);
      }
    })();
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(val);

  const statCards = landingData ? [
    {
      name: 'Проекты',
      value: landingData.projects?.total || 0,
      icon: Building2,
      trend: '+12%', // Mock trend
      trendUp: true,
      description: 'Активных объектов'
    },
    {
      name: 'Контракты',
      value: landingData.contracts?.total || 0,
      icon: FileText,
      trend: '+5%',
      trendUp: true,
      description: 'Подписанных договоров'
    },
    {
      name: 'Команда',
      value: landingData.team?.total || 0,
      icon: Users,
      trend: '0%',
      trendUp: true,
      description: 'Сотрудников в штате'
    },
    {
      name: 'Акты',
      value: landingData.acts?.total || 0,
      icon: CheckCircle,
      trend: '+8%',
      trendUp: true,
      description: 'Закрытых работ'
    },
  ] : [];

  const quickActions = [
    {
      name: 'Создать проект',
      description: 'Новый объект строительства',
      href: '/dashboard/projects/create',
      icon: Building2,
      variant: 'default' as const
    },
    {
      name: 'Пригласить прораба',
      description: 'Добавить сотрудника',
      href: '/dashboard/admins',
      icon: Users,
      variant: 'outline' as const
    },
    {
      name: 'Загрузить документы',
      description: 'Планы и чертежи',
      href: '/dashboard/documents',
      icon: File,
      variant: 'outline' as const
    },
    {
      name: 'Посмотреть отчеты',
      description: 'Сводная аналитика',
      href: '/dashboard/reports',
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
           <span className="text-sm text-muted-foreground flex items-center bg-muted px-3 py-1 rounded-full">
             <Clock className="h-3 w-3 mr-2" />
             Обновлено: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
           </span>
           <Button asChild>
             <Link to="/dashboard/projects/create">
               <Plus className="h-4 w-4 mr-2" />
               Новый проект
             </Link>
           </Button>
        </div>
      </div>

      {/* Alerts */}
      {hasWarnings && criticalWarnings.length > 0 && (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center justify-between text-destructive"
        >
             <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5" />
                <div>
                    <p className="font-semibold">Внимание: Лимиты подписки исчерпаны</p>
                    <p className="text-sm opacity-90">У вас {criticalWarnings.length} критических предупреждений. Функционал может быть ограничен.</p>
                </div>
             </div>
             <Button variant="destructive" size="sm" asChild>
                 <Link to="/dashboard/billing">Обновить тариф</Link>
             </Button>
        </motion.div>
      )}

      {/* Stats Grid */}
      {landingData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             {/* Financial Card - Featured */}
             <Card className="bg-gradient-to-br from-primary to-orange-600 text-primary-foreground border-none shadow-lg md:col-span-2 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 skew-x-12 -translate-x-10 pointer-events-none"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-primary-foreground/90">
                    Финансовый баланс
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-primary-foreground/70" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(landingData.financial?.balance || 0)}</div>
                  <p className="text-xs text-primary-foreground/70 mt-1">
                    Доступные средства
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                          <div className="flex items-center text-green-100 text-xs mb-1">
                             <ArrowUpRight className="h-3 w-3 mr-1" />
                             Поступления
                          </div>
                          <div className="font-semibold text-lg">{formatCurrency(landingData.financial?.credits_this_month || 0)}</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                          <div className="flex items-center text-red-100 text-xs mb-1">
                             <ArrowDownRight className="h-3 w-3 mr-1" />
                             Расходы
                          </div>
                          <div className="font-semibold text-lg">{formatCurrency(landingData.financial?.debits_this_month || 0)}</div>
                      </div>
                  </div>
                </CardContent>
              </Card>

             {statCards.slice(0, 2).map((stat) => (
                <Card key={stat.name} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.name}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
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
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statCards.slice(2).map((stat) => (
                <Card key={stat.name} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.name}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                    </p>
                    </CardContent>
                </Card>
             ))}
              <Card className="md:col-span-2 bg-muted/50 border-dashed">
                 <CardHeader className="pb-2">
                     <CardTitle className="text-base">Быстрые действия</CardTitle>
                 </CardHeader>
                 <CardContent className="grid grid-cols-2 gap-2">
                     {quickActions.map((action) => (
                         <Button key={action.name} variant="outline" className="h-auto py-3 justify-start text-left bg-background" asChild>
                             <Link to={action.href}>
                                 <div className="bg-primary/10 p-2 rounded-md mr-3">
                                     <action.icon className="h-4 w-4 text-primary" />
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="font-medium">{action.name}</span>
                                     <span className="text-[10px] text-muted-foreground font-normal">{action.description}</span>
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
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
             <Card className="lg:col-span-4">
                 <CardHeader>
                     <CardTitle>Проекты по месяцам</CardTitle>
                     <CardDescription>Динамика создания новых объектов</CardDescription>
                 </CardHeader>
                 <CardContent className="pl-2">
                     <div className="h-[300px]">
                        <LineChart
                            title=""
                            labels={landingData.charts?.projects_monthly?.labels || []}
                            values={landingData.charts?.projects_monthly?.values || []}
                        />
                     </div>
                 </CardContent>
             </Card>
             <Card className="lg:col-span-3">
                 <CardHeader>
                     <CardTitle>Статус проектов</CardTitle>
                     <CardDescription>Распределение по этапам</CardDescription>
                 </CardHeader>
                 <CardContent>
                     <div className="h-[300px] flex items-center justify-center">
                        <DonutStatusChart title="" data={landingData.charts?.projects_status || []} />
                     </div>
                 </CardContent>
             </Card>
         </div>
      )}
      
      {/* Additional Charts */}
      {landingData && (
         <div className="grid gap-4 md:grid-cols-3">
            <Card>
                 <CardHeader>
                     <CardTitle className="text-sm">Контракты</CardTitle>
                 </CardHeader>
                 <CardContent className="pl-0 pr-2">
                    <div className="h-[200px]">
                         <LineChart
                            title=""
                            labels={landingData.charts?.contracts_monthly?.labels || []}
                            values={landingData.charts?.contracts_monthly?.values || []}
                        />
                    </div>
                 </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                     <CardTitle className="text-sm">Завершённые работы</CardTitle>
                 </CardHeader>
                 <CardContent className="pl-0 pr-2">
                    <div className="h-[200px]">
                        <LineChart
                            title=""
                            labels={landingData.charts?.completed_works_monthly?.labels || []}
                            values={landingData.charts?.completed_works_monthly?.values || []}
                        />
                    </div>
                 </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                     <CardTitle className="text-sm">Баланс (Динамика)</CardTitle>
                 </CardHeader>
                 <CardContent className="pl-0 pr-2">
                    <div className="h-[200px]">
                        <LineChart
                            title=""
                            labels={landingData.charts?.balance_monthly?.labels || []}
                            values={landingData.charts?.balance_monthly?.values || []}
                        />
                    </div>
                 </CardContent>
            </Card>
         </div>
      )}

      {/* Limits & Subscription */}
      {dashboard && dashboard.plan && (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle>Ваш Тариф</CardTitle>
                        <CardDescription>Информация о подписке</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3 py-1">{dashboard.plan.name}</Badge>
                </CardHeader>
                <CardContent className="grid gap-4 pt-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             <Clock className="h-4 w-4 text-muted-foreground" />
                             <span className="text-sm">Истекает</span>
                        </div>
                        <span className="font-medium">
                            {dashboard.plan.ends_at ? new Date(dashboard.plan.ends_at).toLocaleDateString('ru-RU') : 'Бессрочно'}
                        </span>
                     </div>
                     <Separator />
                     
                     <div className="space-y-3">
                         <LimitItem label="Прорабы" used={dashboard.plan.used_foremen} max={dashboard.plan.max_foremen} />
                         <LimitItem label="Объекты" used={dashboard.plan.used_projects} max={dashboard.plan.max_projects} />
                         <LimitItem label="Хранилище" used={dashboard.plan.used_storage_gb} max={dashboard.plan.max_storage_gb} unit="ГБ" />
                     </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                        <Link to="/dashboard/billing">Управление тарифом</Link>
                    </Button>
                </CardFooter>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Дополнительные услуги</CardTitle>
                    <CardDescription>Активные модули и расширения</CardDescription>
                </CardHeader>
                <CardContent>
                    {dashboard.addons && dashboard.addons.length > 0 ? (
                         <div className="space-y-4">
                            {dashboard.addons.map((addon: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{addon.name}</div>
                                        {addon.expires_at && (
                                            <div className="text-xs text-muted-foreground">до {new Date(addon.expires_at).toLocaleDateString('ru-RU')}</div>
                                        )}
                                    </div>
                                    <Badge variant={addon.status === 'active' ? 'default' : 'secondary'}>
                                        {addon.status === 'active' ? 'Активен' : addon.status}
                                    </Badge>
                                </div>
                            ))}
                         </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Ticket className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Нет активных услуг</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button className="w-full" asChild>
                        <Link to="/dashboard/paid-services">Каталог услуг</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      )}
    </div>
  );
};

const LimitItem = ({ label, used, max, unit = '' }: { label: string, used: number, max: number, unit?: string }) => {
    const percentage = max > 0 ? Math.min((used / max) * 100, 100) : 0;
    const isWarning = percentage > 80;
    const isCritical = percentage >= 100;

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span>{label}</span>
                <span className="text-muted-foreground">
                    {used} / {max} {unit}
                </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                    className={cn("h-full transition-all duration-500", 
                        isCritical ? "bg-destructive" : isWarning ? "bg-yellow-500" : "bg-primary"
                    )} 
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

export default DashboardPage;
