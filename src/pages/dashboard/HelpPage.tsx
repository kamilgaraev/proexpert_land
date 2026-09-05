import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpOverview } from '@/components/support/HelpOverview';
import { FaqSection } from '@/components/support/FaqSection';
import { ContactForm } from '@/components/support/ContactForm';

const HelpPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab = requestedTab === 'faq' || requestedTab === 'support' ? requestedTab : 'overview';

  const handleTabChange = (value: string) => {
    if (value === activeTab) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', value);
    setSearchParams(nextParams);
  };

  return (
    <div className="min-w-0 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Помощь</h1>
        <p className="max-w-prose text-base text-muted-foreground">Инструкции, ответы на вопросы и обращения в поддержку.</p>
      </header>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="min-w-0 space-y-6">
        <TabsList aria-label="Разделы помощи" className="grid h-auto w-full grid-cols-3 rounded-lg border border-border bg-secondary/50 p-1 sm:w-fit">
          <TabsTrigger value="overview" className="min-h-11 rounded-md px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-none sm:px-6">Обзор</TabsTrigger>
          <TabsTrigger value="faq" className="min-h-11 rounded-md px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-none sm:px-6">Вопросы</TabsTrigger>
          <TabsTrigger value="support" className="min-h-11 rounded-md px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-none sm:px-6">Поддержка</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><HelpOverview onTabChange={handleTabChange} /></TabsContent>
        <TabsContent value="faq"><FaqSection /></TabsContent>
        <TabsContent value="support"><ContactForm /></TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpPage;
