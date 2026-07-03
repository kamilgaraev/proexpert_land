import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail,
  BarChart2,
  Info
} from 'lucide-react';
import { usePageTitle } from '@/hooks/useSEO';
import ContractorInvitationsList from '@/components/dashboard/contractor-invitations/ContractorInvitationsList';
import ContractorInvitationsStats from '@/components/dashboard/contractor-invitations/ContractorInvitationsStats';
import ContractorInvitationDetails from '@/components/dashboard/contractor-invitations/ContractorInvitationDetails';
import type { ContractorInvitation } from '@/types/contractor-invitations';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// type TabType = 'invitations' | 'stats';

const ContractorInvitationsPage: React.FC = () => {
  // const [activeTab, setActiveTab] = useState<TabType>('invitations');
  const [selectedInvitation, setSelectedInvitation] = useState<ContractorInvitation | null>(null);
  
  usePageTitle('Партнерские приглашения');

  const handleInvitationSelect = (invitation: ContractorInvitation) => {
    setSelectedInvitation(invitation);
  };

  const handleBackToList = () => {
    setSelectedInvitation(null);
  };

  const handleInvitationProcessed = (updatedInvitation: ContractorInvitation) => {
    setSelectedInvitation(updatedInvitation);
  };

  if (selectedInvitation) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <ContractorInvitationDetails
          invitation={selectedInvitation}
          onBack={handleBackToList}
          onInvitationProcessed={handleInvitationProcessed}
        />
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Партнерские приглашения</h1>
        <p className="text-muted-foreground">
          Приглашайте подрядчиков бесплатно, принимайте входящие запросы и получайте бонусы после первой оплаченной подписки партнера.
        </p>
      </div>

      <Tabs defaultValue="invitations" onValueChange={() => {}} className="space-y-4">
        <TabsList>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Входящие
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Статистика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="space-y-4">
            <ContractorInvitationsList
              onInvitationSelect={handleInvitationSelect}
              showFilters={true}
            />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
            <ContractorInvitationsStats
              showTitle={false}
              className="max-w-6xl mx-auto"
            />
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-6">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Info className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Как работает партнерская программа?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                        <li><span className="font-medium text-foreground">Приглашение:</span> Вы можете бесплатно пригласить подрядную организацию к работе в МОСТ.</li>
                        <li><span className="font-medium text-foreground">Первая оплата:</span> Бонусы появляются только после первой оплаченной подписки приглашенной организации.</li>
                        <li><span className="font-medium text-foreground">Антифрод:</span> Начисление выполняется после окончания оплаченного периода, если подписка не отменена заранее.</li>
                        <li><span className="font-medium text-foreground">Использование бонуса:</span> Бонус остается на балансе МОСТ и может быть потрачен внутри сервиса.</li>
                    </ul>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" asChild>
            <Link to="/dashboard/contractor-referral-program">Условия программы</Link>
        </Button>
        <Button asChild>
            <Link to="/dashboard/help?tab=support">Связаться с поддержкой</Link>
        </Button>
      </div>
    </div>
  );
};

export default ContractorInvitationsPage;
