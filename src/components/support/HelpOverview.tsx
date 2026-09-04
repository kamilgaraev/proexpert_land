import { Link } from 'react-router-dom';
import { ArrowRightIcon, BookOpenIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface HelpOverviewProps {
  onTabChange: (tab: string) => void;
}

export function HelpOverview({ onTabChange }: HelpOverviewProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-5 sm:p-6">
          <ChatBubbleLeftRightIcon className="mb-5 h-7 w-7 text-primary" aria-hidden="true" />
          <h2 className="mb-2 text-xl font-semibold">Нужна помощь с работой в МОСТ?</h2>
          <p className="mb-5 max-w-prose text-base text-muted-foreground">Опишите, что вы хотели сделать и на каком шаге возник вопрос. Укажите раздел системы и результат, который вы ожидали.</p>
          <button type="button" onClick={() => onTabChange('support')} className="inline-flex min-h-11 items-center gap-3 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Написать обращение <ArrowRightIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
          </button>
        </section>
        <section className="rounded-lg border border-border bg-white p-5 sm:p-6">
          <BookOpenIcon className="mb-5 h-7 w-7 text-primary" aria-hidden="true" />
          <h2 className="mb-2 text-xl font-semibold">Инструкции по работе</h2>
          <p className="mb-5 max-w-prose text-base text-muted-foreground">Найдите нужный раздел и следуйте пошаговым руководствам по работе в системе.</p>
          <Link to="/dashboard/help/knowledge" className="inline-flex min-h-11 items-center gap-3 rounded-lg border border-border px-4 py-2 font-medium transition-colors hover:bg-secondary">
            Открыть инструкции <ArrowRightIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
          </Link>
        </section>
      </div>
      <div className="grid gap-6 border-t border-border pt-6 xl:grid-cols-2">
        <section className="flex items-start gap-4">
          <DocumentTextIcon className="mt-1 h-6 w-6 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Частые вопросы</h2>
            <button type="button" onClick={() => onTabChange('faq')} className="inline-flex min-h-11 items-center gap-3 text-left font-medium text-primary hover:underline">Посмотреть ответы <ArrowRightIcon className="h-5 w-5 shrink-0" aria-hidden="true" /></button>
          </div>
        </section>
        <section className="flex items-start gap-4">
          <EnvelopeIcon className="mt-1 h-6 w-6 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Удобнее по почте?</h2>
            <a href="mailto:support@xn--1-xtbgmf.xn--p1ai" className="inline-flex min-h-11 items-center break-all font-medium text-primary hover:underline">support@1мост.рф</a>
          </div>
        </section>
      </div>
    </div>
  );
}
