import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpOverview } from '@/components/support/HelpOverview';
import { FaqSection } from '@/components/support/FaqSection';
import { ContactForm } from '@/components/support/ContactForm';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const HelpPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100">
            <QuestionMarkCircleIcon className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3">Центр помощи</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Найдите ответы на вопросы, изучите руководства или свяжитесь с нашей командой поддержки
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8 max-w-5xl mx-auto">
        <div className="flex justify-center">
          <TabsList className="bg-secondary/50 p-1 rounded-xl inline-flex">
            <TabsTrigger value="overview" className="rounded-lg px-8 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Обзор</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-lg px-8 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">FAQ</TabsTrigger>
            <TabsTrigger value="support" className="rounded-lg px-8 py-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Поддержка</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="focus-visible:outline-none">
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
          >
            <HelpOverview onTabChange={handleTabChange} />
          </motion.div>
        </TabsContent>

        <TabsContent value="faq" className="focus-visible:outline-none">
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
          >
            <FaqSection />
          </motion.div>
        </TabsContent>

        <TabsContent value="support" className="focus-visible:outline-none">
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
          >
            <ContactForm />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpPage;
