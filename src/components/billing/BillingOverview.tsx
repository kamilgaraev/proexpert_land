import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  OrganizationBalance, 
  Subscription, 
  ModuleBillingResponse, 
  BalanceTransaction 
} from '@/utils/api';
import { 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  ReceiptRefundIcon, 
  WalletIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  StarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BillingOverviewProps {
  balance: OrganizationBalance | null;
  subscription: Subscription | null;
  billingStats: ModuleBillingResponse | null;
  recentTransactions: BalanceTransaction[];
  loading: boolean;
  onTabChange: (tab: string) => void;
}

const BillingOverview = ({ 
  balance, 
  subscription, 
  billingStats, 
  recentTransactions, 
  loading,
  onTabChange
}: BillingOverviewProps) => {

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Н/Д';
    return new Date(dateString).toLocaleString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowUpIcon className="w-5 h-5 text-emerald-600" />;
      case 'debit':
        return <ArrowDownIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'text-emerald-600 bg-emerald-50';
      case 'debit':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getSubscriptionStatus = (subscription: Subscription) => {
    if (subscription.is_canceled) {
      return { status: 'Отменена', color: 'bg-orange-100 text-orange-800 hover:bg-orange-100', icon: XCircleIcon };
    }
    if (subscription.is_trial) {
      return { status: 'Пробная', color: 'bg-amber-100 text-amber-800 hover:bg-amber-100', icon: SparklesIcon };
    }
    if (subscription.status === 'active') {
      return { status: 'Активна', color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100', icon: CheckCircleIcon };
    }
    return { status: 'Неактивна', color: 'bg-slate-100 text-slate-800 hover:bg-slate-100', icon: ClockIcon };
  };
  
  // Helper for XCircleIcon as it was not imported
  const XCircleIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('прораб') || feature.includes('Прораб')) return UserGroupIcon;
    if (feature.includes('проект') || feature.includes('Проект')) return DocumentTextIcon;
    if (feature.includes('пользователь') || feature.includes('Пользователь')) return UserGroupIcon;
    if (feature.includes('ГБ') || feature.includes('хранилищ')) return ShieldCheckIcon;
    if (feature.includes('админ') || feature.includes('Админ')) return AcademicCapIcon;
    if (feature.includes('API')) return ShieldCheckIcon;
    if (feature.includes('менеджер') || feature.includes('SLA')) return StarIcon;
    return CheckCircleIcon;
  };

  if (loading) {
     return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-secondary/30 animate-pulse rounded-3xl"></div>
           ))}
        </div>
     );
  }

  return (
    <div className="space-y-8">
      {/* Карточки статистики */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Текущая подписка */}
        <Card className="col-span-1 md:col-span-2 relative overflow-hidden border-border shadow-md group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-orange-200">
                  <StarIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Текущая подписка</h3>
                  <p className="text-muted-foreground text-sm">Информация о вашем тарифе</p>
                </div>
              </div>
              {subscription && (() => {
                const statusInfo = getSubscriptionStatus(subscription);
                return (
                  <Badge className={cn("px-4 py-1.5 rounded-full text-sm font-bold", statusInfo.color)} variant="outline">
                    <statusInfo.icon className="w-4 h-4 mr-1.5" />
                    {statusInfo.status}
                  </Badge>
                );
              })()}
            </div>

            {subscription ? (
              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                    <h4 className="font-bold text-foreground text-lg mb-1">{subscription.plan.name}</h4>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{subscription.plan.description}</p>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-primary">
                        {Number(subscription.plan.price).toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-muted-foreground ml-1 font-medium">/{subscription.plan.currency === 'RUB' ? 'мес' : subscription.plan.currency}</span>
                    </div>
                  </div>

                  <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Автоплатеж</span>
                      <Badge variant={subscription.is_auto_payment_enabled ? "default" : "secondary"} className={subscription.is_auto_payment_enabled ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                        {subscription.is_auto_payment_enabled ? 'Включен' : 'Отключен'}
                      </Badge>
                    </div>
                    {subscription.ends_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Действует до</span>
                        <span className="font-bold text-foreground">
                          {formatDate(subscription.ends_at)}
                        </span>
                      </div>
                    )}
                    {subscription.next_billing_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Следующий платеж</span>
                        <span className="font-bold text-foreground">
                          {formatDate(subscription.next_billing_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                   <Button onClick={() => onTabChange('plans')} className="font-bold shadow-md shadow-orange-100">
                      Сменить тариф
                   </Button>
                   <Button variant="outline" onClick={() => onTabChange('limits')}>
                      Проверить лимиты
                   </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-secondary/30 rounded-2xl border-2 border-dashed border-border">
                <SparklesIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Подписка не оформлена</p>
                <Button onClick={() => onTabChange('plans')} className="mt-4 font-bold">
                   Выбрать тариф
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Текущий баланс */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none text-white shadow-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
          
          <CardContent className="p-6 flex flex-col h-full justify-between relative z-10">
             <div className="flex items-center justify-between mb-6">
               <div>
                 <p className="text-slate-400 text-sm font-medium mb-1">Текущий баланс</p>
                 {balance ? (
                   <p className="text-4xl font-bold text-white tracking-tight">
                     {balance.balance_formatted} <span className="text-2xl text-slate-400 font-normal">{balance.currency}</span>
                   </p>
                 ) : (
                   <p className="text-slate-500">...</p>
                 )}
               </div>
               <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
                 <WalletIcon className="w-6 h-6 text-orange-400" />
               </div>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Заблокировано</span>
                      <span className="font-medium">0.00 ₽</span>
                   </div>
                   <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-0"></div>
                   </div>
                </div>
                
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold border-none">
                   Пополнить баланс
                </Button>
             </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Дополнительная статистика */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Всего потрачено */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Всего потрачено</p>
                {billingStats?.stats?.stats?.total_spent_all_time ? (
                  <p className="text-2xl font-bold text-foreground">
                    ₽{billingStats.stats.stats.total_spent_all_time.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-muted-foreground">...</p>
                )}
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <ArrowDownIcon className="w-4 h-4 mr-1 text-red-500" />
              <span>За все время</span>
            </div>
          </CardContent>
        </Card>

        {/* Ежемесячные платежи */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Ежемесячно</p>
                {billingStats?.stats?.stats?.monthly_recurring !== undefined ? (
                  <p className="text-2xl font-bold text-foreground">
                    ₽{billingStats.stats.stats.monthly_recurring.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-muted-foreground">...</p>
                )}
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                <BanknotesIcon className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <ChartBarIcon className="w-4 h-4 mr-1 text-orange-500" />
              <span>Регулярные подписки</span>
            </div>
          </CardContent>
        </Card>

        {/* Активные модули */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Активные модули</p>
                {billingStats?.stats?.stats?.active_modules !== undefined ? (
                  <p className="text-2xl font-bold text-foreground">
                    {billingStats.stats.stats.active_modules}
                  </p>
                ) : (
                  <p className="text-muted-foreground">...</p>
                )}
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="text-emerald-600 font-bold mr-1">{Math.round((billingStats?.stats?.stats?.active_modules || 0) / (billingStats?.stats?.stats?.total_modules_ever || 1) * 100)}%</span>
              <span>от всех доступных</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Детализация расходов */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between group hover:border-orange-300 transition-colors cursor-pointer">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                 <CreditCardIcon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Подписки</p>
                 <p className="text-lg font-bold text-slate-900">{billingStats?.stats?.breakdown_by_type?.subscription || 0}</p>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between group hover:border-orange-300 transition-colors cursor-pointer">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors">
                 <CurrencyDollarIcon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Разовые</p>
                 <p className="text-lg font-bold text-slate-900">{billingStats?.stats?.breakdown_by_type?.one_time || 0}</p>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between group hover:border-orange-300 transition-colors cursor-pointer">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-slate-200 transition-colors">
                 <CheckCircleIcon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Бесплатные</p>
                 <p className="text-lg font-bold text-slate-900">{billingStats?.stats?.breakdown_by_type?.free || 0}</p>
              </div>
           </div>
        </div>
      </motion.div>

      {/* История транзакций (Short) */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4 px-6">
          <div>
            <CardTitle className="text-lg font-bold">Последние операции</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onTabChange('history')}>
             Все транзакции
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentTransactions.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
                Транзакций нет
             </div>
          ) : (
             <div className="divide-y divide-border">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getTransactionColor(transaction.type))}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{transaction.description || 'Транзакция'}</p>
                        <p className="text-xs text-muted-foreground font-medium">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-bold text-sm",
                        transaction.type === 'credit' ? 'text-emerald-600' : 'text-foreground'
                      )}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        {transaction.amount_formatted} {balance?.currency || 'RUB'}
                      </p>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingOverview;

