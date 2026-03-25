import { Link } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  ClockIcon,
  EnvelopeIcon,
  LifebuoyIcon,
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
    title: 'Demo и продажи',
    value: marketingCompany.email,
    href: marketingCompany.emailHref,
    description: 'Запрос демонстрации, rollout и подбор пакетов.',
    icon: EnvelopeIcon,
  },
  {
    title: 'Окно ответа',
    value: marketingCompany.responseTime,
    description: marketingCompany.hours,
    icon: ClockIcon,
  },
  {
    title: 'Формат работы',
    value: 'Онлайн и на площадке',
    description: marketingCompany.location,
    icon: BuildingOffice2Icon,
  },
  {
    title: 'Legal и support',
    value: 'Через email и форму',
    href: marketingCompany.emailHref,
    description: 'Подходит для compliance-вопросов и продуктовой поддержки.',
    icon: LifebuoyIcon,
  },
];

const ContactPage = () => {
  useSEO({
    ...marketingSeo.contact,
    type: 'website',
  });

  return (
    <div className="bg-white pt-20">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.14),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <SectionHeader
            eyebrow="Contact"
            title="Свяжитесь с командой ProHelper по продукту, legal и rollout"
            description="Публичный контур контакта собран вокруг email, формы обращения и прозрачного consent-flow. Без фиктивных телефонов и офисов."
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-3 block text-base font-semibold text-construction-700"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div className="mt-3 text-base font-semibold text-steel-950">
                      {item.value}
                    </div>
                  )}
                  <p className="mt-3 text-sm leading-7 text-steel-600">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-6">
            <article className="rounded-[2rem] border border-steel-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-steel-950">Что происходит после отправки формы</h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-steel-600">
                <p>Форма сохраняет только необходимые поля для первичного контакта и metadata запроса.</p>
                <p>Без отдельного согласия на обработку персональных данных отправка недоступна.</p>
                <p>Analytics-контур на публичном сайте включается только после отдельного cookie-consent.</p>
              </div>
            </article>

            <article className="rounded-[2rem] border border-steel-200 bg-steel-950 p-8 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-construction-200">
                Compliance
              </div>
              <p className="mt-5 text-sm leading-7 text-white/80">
                Footer и формы ведут на реальные legal-страницы. Базовый legal-слой уже
                опубликован, а реквизиты и финальные формулировки можно уточнять отдельным
                юридическим потоком.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={marketingPaths.privacy}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Privacy
                </Link>
                <Link
                  to={marketingPaths.offer}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Offer
                </Link>
                <Link
                  to={marketingPaths.cookies}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cookies
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
