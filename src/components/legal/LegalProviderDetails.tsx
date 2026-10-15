import { legalProvider } from '@/data/marketing/legal';
import { marketingCompany } from '@/data/marketing/common';

const fields = [
  ['name', 'Полное наименование'],
  ['short_name', 'Сокращённое наименование'],
  ['inn', 'ИНН'],
  ['registration_number', 'ОГРНИП'],
  ['registration_date', 'Дата государственной регистрации'],
  ['registration_region', 'Регион регистрации'],
  ['address', 'Адрес для корреспонденции'],
  ['bank_name', 'Банк'],
  ['tax_status', 'Налоговый режим'],
] as const;

export const LegalProviderDetails = () => (
  <section id="requisites" aria-labelledby="requisites-title" className="rounded-lg border border-border bg-white p-6">
    <h2 id="requisites-title" className="text-xl font-semibold">Реквизиты владельца МОСТ</h2>
    <dl className="mt-4 space-y-3 text-sm leading-6">
      {fields.map(([key, label]) => (
        <div key={key}>
          <dt className="font-semibold">{label}</dt>
          <dd className="break-words">{legalProvider[key]}</dd>
        </div>
      ))}
      <div>
        <dt className="font-semibold">Рабочий контакт, персональные данные и юридические обращения</dt>
        <dd><a className="underline" href={marketingCompany.emailHref}>{legalProvider.email}</a></dd>
      </div>
    </dl>
    <p className="mt-4 text-sm leading-6">Для оплаты банковским переводом запросите счёт по рабочему контакту. Реквизиты расчётного счёта указываются в счёте на оплату.</p>
  </section>
);
