import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgePercent,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const rewardRules = [
  {
    title: 'Приглашение бесплатно',
    description: 'Подрядчика можно пригласить без покупки отдельного модуля и без списания с баланса.',
    icon: CheckCircle2,
  },
  {
    title: 'Бонус после первой оплаты',
    description: 'Пригласившая организация получает бонус, когда приглашенный партнер впервые оплачивает подписку.',
    icon: BadgePercent,
  },
  {
    title: 'Проверка после периода',
    description: 'Бонус начисляется после окончания первого оплаченного периода, если заказ оплачен и по платежу не было возврата.',
    icon: Clock3,
  },
  {
    title: 'Только внутри МОСТ',
    description: 'Бонус остается на балансе и используется для подписки, пакетов и дополнительных модулей.',
    icon: Wallet,
  },
];

const antiFraudRules = [
  'Не начисляем бонус за приглашение своей же организации.',
  'Не начисляем бонус, если у организаций совпадают ИНН, email или телефон.',
  'Не начисляем бонус, если заказ отменён или по первому платежу оформлен полный либо частичный возврат до начисления.',
  'Бонус доступен только за первую платную подписку приглашенной организации.',
];

const ContractorReferralProgramPage: React.FC = () => {
  usePageTitle('Условия партнерской программы');

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <Button variant="ghost" asChild className="mb-3 -ml-3">
            <Link to="/dashboard/contractor-invitations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              К партнерским приглашениям
            </Link>
          </Button>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="text-3xl font-bold tracking-tight">Условия партнерской программы</h1>
            <p className="mt-2 text-muted-foreground">
              Приглашайте подрядчиков в МОСТ бесплатно. Бонус начисляется только после первой успешной оплаты приглашенной организации и проверки оплаченного периода.
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
      >
        {rewardRules.map((rule) => {
          const Icon = rule.icon;

          return (
            <Card key={rule.title} className="border-border shadow-sm">
              <CardContent className="p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-foreground">{rule.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rule.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Размер бонусов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-border bg-secondary/30 p-5">
              <p className="text-sm text-muted-foreground">Пригласившая организация</p>
              <p className="mt-1 text-2xl font-bold text-foreground">30% от первого платежа</p>
              <p className="mt-2 text-sm text-muted-foreground">Максимум 30 000 ₽ на баланс МОСТ.</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/30 p-5">
              <p className="text-sm text-muted-foreground">Приглашенная организация</p>
              <p className="mt-1 text-2xl font-bold text-foreground">20% от первого платежа</p>
              <p className="mt-2 text-sm text-muted-foreground">Максимум 20 000 ₽ на баланс МОСТ после проверки периода.</p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Бонус округляется до ближайшей 1 000 ₽, затем применяется указанный максимум. Например, при первом платеже 10 000 ₽ пригласившая организация получит 3 000 ₽, а приглашённая — 2 000 ₽.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle>Когда бонус не начисляется</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {antiFraudRules.map((rule) => (
                <li key={rule} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed bg-muted/40 shadow-none">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Где увидеть начисления?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              После начисления бонус появится в разделе финансов как операция по балансу.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/billing">Открыть пакеты и оплату</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorReferralProgramPage;
