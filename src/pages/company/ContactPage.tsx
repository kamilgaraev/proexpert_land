import { Link } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  ClockIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import ContactForm from '@/components/landing/ContactForm';
import { MarketingLink, PageHero, SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  marketingCommercialLandingLinks,
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
    description:
      'Напишите, если хотите разобрать свой сценарий, состав решения и этап запуска.',
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
    description:
      'При необходимости подключаем обсуждение юридических документов и базовых материалов по безопасности.',
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
      <PageHero
        eyebrow="Контакты"
        title="Запросите демонстрацию ProHelper под ваш строительный процесс."
        description="Обсудим роли команды, текущий контур работы, пакет запуска и соседние сценарии, которые стоит показать на встрече."
        nav={[
          { label: 'Формат работы', href: '#contact-cards' },
          { label: 'Связанные маршруты', href: '#related-routes' },
          { label: 'Что дальше', href: '#next-step' },
          { label: 'Форма', href: '#contact-form' },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Как мы работаем
            </div>
            <div className="mt-4 grid gap-3">
              {[
                'Сначала коротко уточняем роль, процесс и текущую проблему.',
                'Затем показываем только релевантный контур: объект, снабжение, документы, бюджет или AI-сценарий.',
                'При необходимости отдельно подключаем блок безопасности, интеграций и договорных материалов.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section id="contact-cards" className="py-16 lg:py-20">
        <div className="container-custom grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {contactCards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-construction-50 text-construction-700">
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

      <section id="related-routes" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Связанные маршруты"
            title="Популярные страницы, с которых чаще всего приходят на демонстрацию."
            description="Если вы уже понимаете свою роль или ключевую боль, можно сразу открыть профильную посадочную и затем вернуться к заявке."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {marketingCommercialLandingLinks.slice(0, 6).map((item) => (
              <MarketingLink
                key={item.href}
                href={item.href}
                className="rounded-[1.6rem] border border-steel-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-construction-300"
              >
                <div className="text-lg font-bold text-steel-950">{item.label}</div>
                <p className="mt-3 text-sm leading-7 text-steel-600">{item.description}</p>
              </MarketingLink>
            ))}
          </div>
        </div>
      </section>

      <section id="next-step" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-bold text-steel-950">Что происходит после отправки формы</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-steel-600">
              <p>Сначала уточняем роли команды, текущий процесс и желаемый контур запуска.</p>
              <p>
                Затем готовим демонстрацию или рабочий созвон под ваш сценарий, а не по шаблонной экскурсии по всему интерфейсу.
              </p>
              <p>
                Если нужно, отдельно подключаем обсуждение безопасности, пакетов, интеграций и юридических материалов.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-steel-900 bg-steel-950 p-6 text-white">
            <SectionHeader
              eyebrow="Данные и согласие"
              title="Прозрачная работа с запросами, данными и документами."
              description="Для отправки формы требуется согласие на обработку персональных данных. Настройки аналитики регулируются cookie-consent."
              tone="dark"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={marketingCompany.emailHref}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Написать на почту
              </a>
              <Link
                to={marketingPaths.privacy}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="contact-form" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.86fr)_minmax(460px,0.94fr)] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Форма"
              title="Оставьте заявку на демонстрацию или консультацию."
              description="Достаточно контактов и краткого описания задачи, чтобы мы подготовили предметный созвон под вашу строительную команду."
            />
          </div>
          <ContactForm variant="full" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
