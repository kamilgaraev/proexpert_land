import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  billingService, 
  newModulesService, 
  OrganizationBalance, 
  BalanceTransaction, 
  PaginatedBalanceTransactions, 
  ErrorResponse, 
  ModuleBillingResponse, 
  SubscriptionResponse, 
  Subscription 
} from '@/utils/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BillingOverview from '@/components/billing/BillingOverview';
import PlansGrid from '@/components/billing/PlansGrid';
import TransactionHistory from '@/components/billing/TransactionHistory';
import LimitsView from '@/components/billing/LimitsView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const BillingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [balance, setBalance] = useState<OrganizationBalance | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<BalanceTransaction[]>([]);
  const [billingStats, setBillingStats] = useState<ModuleBillingResponse | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommonData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [balanceRes, transactionsRes, statsRes, subRes] = await Promise.all([
        billingService.getBalance(),
        billingService.getBalanceTransactions(1, 5),
        newModulesService.getBillingStats(),
        billingService.getCurrentSubscription()
      ]);

      // Balance
      if (balanceRes.status === 200) {
        if (balanceRes.data && typeof balanceRes.data === 'object' && 'data' in balanceRes.data) {
          setBalance((balanceRes.data as any).data as OrganizationBalance);
        } else {
          setBalance(null);
        }
      }

      // Recent Transactions
      if (transactionsRes.status === 200) {
        const paginatedData = transactionsRes.data as PaginatedBalanceTransactions;
        setRecentTransactions(paginatedData.data);
      }

      // Stats
      if (statsRes.status === 200) {
        if (statsRes.data && typeof statsRes.data === 'object' && 'data' in statsRes.data) {
          setBillingStats((statsRes.data as any).data as ModuleBillingResponse);
        } else {
          setBillingStats(statsRes.data as ModuleBillingResponse);
        }
      }

      // Subscription
      if (subRes.status === 200) {
        const subscriptionData = subRes.data as SubscriptionResponse;
        if (subscriptionData.success && subscriptionData.data.has_subscription) {
          setSubscription(subscriptionData.data.subscription);
        } else {
          setSubscription(null);
        }
      }

    } catch (err: any) {
      console.error('Error fetching billing data:', err);
      setError('Не удалось загрузить данные биллинга');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommonData();
  }, [fetchCommonData]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Финансы</h1>
          <p className="text-muted-foreground mt-1">Управление бюджетом, подписками и лимитами</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline">
              Скачать отчет
           </Button>
           <Button className="shadow-lg shadow-primary/20">
              Пополнить баланс
           </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 rounded-xl w-full md:w-auto inline-flex">
          <TabsTrigger value="overview" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Обзор</TabsTrigger>
          <TabsTrigger value="plans" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Тарифы</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">История</TabsTrigger>
          <TabsTrigger value="limits" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Лимиты</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="focus-visible:outline-none">
          <BillingOverview 
            balance={balance}
            subscription={subscription}
            billingStats={billingStats}
            recentTransactions={recentTransactions}
            loading={loading}
            onTabChange={handleTabChange}
          />
        </TabsContent>

        <TabsContent value="plans" className="focus-visible:outline-none">
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.4 }}
          >
            <PlansGrid />
          </motion.div>
        </TabsContent>

        <TabsContent value="history" className="focus-visible:outline-none">
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.4 }}
          >
            <TransactionHistory balance={balance} />
          </motion.div>
        </TabsContent>

        <TabsContent value="limits" className="focus-visible:outline-none">
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.4 }}
          >
             <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                   <LimitsView />
                </CardContent>
             </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingPage;
