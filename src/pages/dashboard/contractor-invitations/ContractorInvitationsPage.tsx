import React, { useState } from 'react';
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

type TabType = 'invitations' | 'stats';

const ContractorInvitationsPage: React.FC = () => {
  // const [activeTab, setActiveTab] = useState<TabType>('invitations');
  const [selectedInvitation, setSelectedInvitation] = useState<ContractorInvitation | null>(null);
  
  usePageTitle('Приглашения подрядчиков');

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
        <h1 className="text-3xl font-bold tracking-tight">Приглашения к сотрудничеству</h1>
        <p className="text-muted-foreground">
          Управляйте входящими приглашениями от потенциальных заказчиков и отслеживайте статистику сотрудничества
        </p>
      </div>

      <Tabs defaultValue="invitations" onValueChange={() => {}} className="space-y-4">
        <TabsList>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Приглашения
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
                    <h3 className="font-semibold mb-2">Как работают приглашения?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                        <li><span className="font-medium text-foreground">Получение приглашения:</span> Потенциальные заказчики находят вашу организацию и отправляют приглашение.</li>
                        <li><span className="font-medium text-foreground">Рассмотрение:</span> Вы изучаете детали приглашения и условия.</li>
                        <li><span className="font-medium text-foreground">Принятие решения:</span> Принимаете или отклоняете. При принятии создается связь.</li>
                        <li><span className="font-medium text-foreground">Сотрудничество:</span> Вы получаете доступ к совместной работе.</li>
                    </ul>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" asChild>
            <a href="/help/contractor-invitations">Справочная информация</a>
        </Button>
        <Button asChild>
            <a href="/support">Связаться с поддержкой</a>
        </Button>
      </div>
    </div>
  );
};

export default ContractorInvitationsPage;
