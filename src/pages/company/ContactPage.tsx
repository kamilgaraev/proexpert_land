import { Link } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  ClockIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import ContactForm from '@/components/landing/ContactForm';
import { PageHero, SectionHeader } from '@/components/marketing/MarketingPrimitives';
import { marketingCompany, marketingPaths, marketingSeo } from '@/data/marketingRegistry';
import { useSEO } from '@/hooks/useSEO';

const contactCards = [
  {
    title: 'Демонстрация и консультация',
    value: marketingCompany.email,
    href: marketingCompany.emailHref,
    description: 'Напишите, если хотите разобрать свой сценарий, состав решения и этап запуска.',
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
    description: 'При необходимости подключаем обсуждение юридических документов и базовых материалов по безопасности.',
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
        title="Свяжитесь с командой ProHelper и разберите свой сценарий внедрения."
        description="Публичная контактная страница стала проще и строже: сначала быстрое понимание формата взаимодействия, затем нормальная форма заявки без лишнего маркетингового шума."
        nav={[
          { label: 'Формат работы', href: '#contact-cards' },
          { label: 'Что дальше', href: '#next-step' },
          { label: 'Форма', href: '#contact-form' },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Зачем страница устроена так
            </div>
            <div className="mt-4 grid gap-3">
              {[
                'Быстро отвечает на базовые B2B-вопросы по контакту.',
                'Снижает трение перед отправкой формы.',
                'Сразу связывает коммуникацию с безопасностью и документами.',
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

      <section id="next-step" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-bold text-steel-950">Что происходит после отправки формы</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-steel-600">
              <p>Сначала уточняем роли команды, текущий процесс и желаемый контур запуска.</p>
              <p>
                Затем готовим демонстрацию или рабочий созвон под ваш сценарий, а не по шаблонной
                экскурсии по интерфейсу.
              </p>
              <p>
                Если нужно, отдельно подключаем обсуждение безопасности, пакетов и юридических
                материалов.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-steel-900 bg-steel-950 p-6 text-white">
            <SectionHeader
              eyebrow="Данные и согласие"
              title="Контактный слой теперь объясняет правила работы с данными прямо и спокойно."
              description="Для отправки требуется согласие на обработку персональных данных, а аналитика на сайте запускается только после отдельного cookie-consent."
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

      <section id="contact-form" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.86fr)_minmax(460px,0.94fr)] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Форма"
              title="Форма собрана так, чтобы быстро перевести маркетинг в содержательный диалог."
              description="Нам важны контакты, компания и краткое описание задачи. Этого достаточно, чтобы подготовить предметный разговор и не заставлять вас заполнять длинный бриф."
            />
          </div>
          <ContactForm variant="full" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
