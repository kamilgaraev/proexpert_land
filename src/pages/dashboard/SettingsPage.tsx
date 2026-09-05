import { Link } from 'react-router-dom';
import { ArrowUpRight, Bell, KeyRound, UserRound } from 'lucide-react';
import { NotificationPreferences } from '@/components/dashboard/NotificationPreferences';
import { SecuritySessions } from '@/components/dashboard/SecuritySessions';
import { Button } from '@/components/ui/button';

const accountActions = [
  {
    title: 'Личные данные',
    description: 'Имя, фотография, телефон и рабочая почта.',
    action: 'Открыть профиль',
    to: '/dashboard/profile',
    icon: UserRound,
  },
  {
    title: 'Пароль',
    description: 'Получите ссылку на почту, чтобы задать новый пароль.',
    action: 'Восстановить пароль',
    to: '/forgot-password',
    icon: KeyRound,
  },
  {
    title: 'Уведомления',
    description: 'Посмотрите сообщения о событиях и отметьте прочитанные.',
    action: 'Открыть уведомления',
    to: '/dashboard/notifications',
    icon: Bell,
  },
];

const SettingsPage = () => (
  <div className="space-y-8">
    <header className="border-b border-border pb-6">
      <h1 className="text-3xl font-semibold tracking-tight">Настройки</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Личные данные, доступ к аккаунту и устройства, на которых вы входили в МОСТ.</p>
    </header>
    <section aria-label="Аккаунт" className="grid gap-4 lg:grid-cols-3">
      {accountActions.map(({ title, description, action, to, icon: Icon }) => (
        <article key={to} className="flex min-w-0 flex-col border border-border bg-card p-5 sm:p-6">
          <Icon className="mb-4 h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mb-5 mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          <Button asChild variant="outline" className="mt-auto h-auto min-h-11 w-fit max-w-full whitespace-normal text-left">
            <Link to={to}>{action}<ArrowUpRight className="ml-2 h-5 w-5 shrink-0" aria-hidden="true" /></Link>
          </Button>
        </article>
      ))}
    </section>
    <NotificationPreferences />
    <SecuritySessions />
  </div>
);

export default SettingsPage;
