import { Link } from "react-router-dom";
import {
  BuildingOffice2Icon,
  ClockIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import ContactForm from "@/components/landing/ContactForm";
import {
  MarketingLink,
  PageHero,
  SectionHeader,
} from "@/components/marketing/MarketingPrimitives";
import {
  marketingCommercialLandingLinks,
  marketingCompany,
  marketingPaths,
  marketingSeo,
} from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";

const contactCards = [
  {
    title: "Прямой контакт",
    value: marketingCompany.email,
    href: marketingCompany.emailHref,
    description:
      "Можно отправить заявку через форму или написать на общую почту команды МОСТ.",
    icon: EnvelopeIcon,
  },
  {
    title: "Состав заявки",
    value: "Контакты, компания и задача",
    description:
      "Этих данных достаточно, чтобы изучить запрос и определить следующий шаг.",
    icon: ClockIcon,
  },
  {
    title: "Следующий шаг",
    value: "Уточнение или демонстрация",
    description:
      "Команда проверит вводные и предложит подходящий формат продолжения без обещания фиксированного срока.",
    icon: BuildingOffice2Icon,
  },
  {
    title: "Безопасность и документы",
    value: "Отдельно по запросу",
    href: marketingPaths.security,
    description:
      "При необходимости подключаем обсуждение юридических документов и базовых материалов по безопасности.",
    icon: ShieldCheckIcon,
  },
];

const ContactPage = () => {
  useSEO({
    ...marketingSeo.contact,
    type: "website",
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Контакты"
        title="Что произойдёт после обращения в МОСТ."
        description="Оставьте контакты, укажите тип компании и кратко опишите задачу. Команда изучит заявку, при необходимости уточнит вводные и предложит следующий шаг."
        nav={[
          { label: "Формат работы", href: "#contact-cards" },
          { label: "Связанные маршруты", href: "#related-routes" },
          { label: "Что дальше", href: "#next-step" },
          { label: "Форма", href: "#contact-form" },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Как обрабатывается заявка
            </div>
            <div className="mt-4 grid gap-3">
              {[
                "Проверяем контакты, тип компании и описание задачи.",
                "Если данных недостаточно, уточняем роли и нужные разделы.",
                "Следующим шагом может быть демонстрация или отдельный разговор об интеграции, доступе и документах.",
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
                <div className="mt-5 text-lg font-bold text-steel-950">
                  {item.title}
                </div>
                {item.href?.startsWith("mailto:") ? (
                  <a
                    href={item.href}
                    className="mt-3 block text-base font-semibold text-construction-700"
                  >
                    {item.value}
                  </a>
                ) : item.href ? (
                  <Link
                    to={item.href}
                    className="mt-3 block text-base font-semibold text-construction-700"
                  >
                    {item.value}
                  </Link>
                ) : (
                  <div className="mt-3 text-base font-semibold text-steel-950">
                    {item.value}
                  </div>
                )}
                <p className="mt-3 text-sm leading-7 text-steel-600">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="related-routes" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Связанные маршруты"
            title="Страницы, которые помогут уточнить запрос."
            description="Перед заявкой можно выбрать тип компании, роль или конкретную задачу и приложить ссылку в описании."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {marketingCommercialLandingLinks.slice(0, 6).map((item) => (
              <MarketingLink
                key={item.href}
                href={item.href}
                className="rounded-[1.6rem] border border-steel-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-construction-300"
              >
                <div className="text-lg font-bold text-steel-950">
                  {item.label}
                </div>
                <p className="mt-3 text-sm leading-7 text-steel-600">
                  {item.description}
                </p>
              </MarketingLink>
            ))}
          </div>
        </div>
      </section>

      <section id="next-step" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-bold text-steel-950">
              Что происходит после отправки формы
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-steel-600">
              <p>
                Команда читает описание задачи и проверяет, достаточно ли
                вводных для предметного ответа.
              </p>
              <p>
                Если нужны детали, уточняет тип компании, роли участников,
                состав данных или интересующие функции.
              </p>
              <p>
                После уточнения предлагает следующий шаг: демонстрацию нужных
                разделов или отдельное обсуждение пакетов, интеграций, доступа и
                документов.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-steel-900 bg-steel-950 p-6 text-white">
            <SectionHeader
              eyebrow="Данные и согласие"
              title="Прозрачная работа с запросами, данными и документами."
              description="Для отправки формы требуется согласие на обработку персональных данных. Аналитика включается только после согласия на аналитические файлы cookie."
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
              title="Оставьте контакты и кратко опишите задачу."
              description="Укажите тип компании, свою роль и разделы МОСТ, которые хотите обсудить. Точный срок ответа заранее не обещается."
            />
          </div>
          <ContactForm variant="full" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
