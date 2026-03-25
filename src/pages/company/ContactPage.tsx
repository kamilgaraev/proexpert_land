import { Link } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  ClockIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import ContactForm from '@/components/landing/ContactForm';
import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  marketingCompany,
  marketingPaths,
  marketingSeo,
} from '@/data/marketingRegistry';
import { useSEO } from '@/hooks/useSEO';

const contactCards = [
  {
    title: 'Демонстрация и консультация',
    value: marketingCompany.email,
    href: marketingCompany.emailHref,
    description: 'Напишите, если хотите разобрать свой сценарий и состав решения.',
    icon: EnvelopeIcon,
  },
  {
    title: 'Скорость ответа',
    value: marketingCompany.responseTime,
    description: marketingCompany.hours,
    icon: ClockIcon,
  },
  {
    title: 'Формат работы',
    value: 'Онлайн и рабочие сессии',
    description: marketingCompany.location,
    icon: BuildingOffice2Icon,
  },
  {
    title: 'Безопасность и документы',
    value: 'Отдельно по запросу',
    href: marketingPaths.security,
    description: 'Поможем с вопросами по документам сайта и базовым материалам по безопасности.',
    icon: ShieldCheckIcon,
  },
];

const ContactPage = () => {
  useSEO({
    ...marketingSeo.contact,
    type: 'website',
  });

  return (
    <div className="bg-white pt-28">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.14),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <SectionHeader
            eyebrow="Контакты"
            title="Свяжитесь с командой ProHelper и разберите свой сценарий внедрения"
            description="Используйте форму, если хотите запросить демонстрацию, подобрать пакет, обсудить безопасность или получить юридические материалы."
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {contactCards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-construction-50 text-construction-700">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-5 text-lg font-bold text-steel-950">{item.title}</div>
                {item.href?.startsWith('mailto:') ? (
                  <a href={item.href} className="mt-3 block text-base font-semibold text-construction-700">
                    {item.value}
                  </a>
                ) : item.href ? (
                  <Link to={item.href} className="mt-3 block text-base font-semibold text-construction-700">
                    {item.value}
                  </Link>
                ) : (
                  <div className="mt-3 text-base font-semibold text-steel-950">{item.value}</div>
                )}
                <p className="mt-3 text-sm leading-7 text-steel-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
          <div className="space-y-6">
            <article className="rounded-[2rem] border border-steel-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-steel-950">Что происходит после отправки формы</h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-steel-600">
                <p>Мы уточняем роли команды, текущий процесс и желаемый контур запуска.</p>
                <p>После этого готовим демонстрацию или консультацию под ваш сценарий, а не по шаблонному скрипту.</p>
                <p>Если нужно, отдельно подключаем обсуждение безопасности, пакетов и юридических документов.</p>
              </div>
            </article>

            <article className="rounded-[2rem] border border-steel-900 bg-steel-950 p-8">
              <SectionHeader
                eyebrow="Данные и согласие"
                title="Форма обратной связи работает прозрачно и с явным согласием пользователя"
                description="Для отправки требуется согласие на обработку персональных данных, а аналитика на сайте запускается только после отдельного согласия на файлы cookie."
                tone="dark"
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={marketingCompany.emailHref}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Написать на email
                </a>
                <Link
                  to={marketingPaths.privacy}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Политика конфиденциальности
                </Link>
              </div>
            </article>
          </div>

          <ContactForm variant="full" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
