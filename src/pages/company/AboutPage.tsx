import CtaBand from "@/components/marketing/blocks/CtaBand";
import TrustFactList from "@/components/marketing/blocks/TrustFactList";
import {
  PageHero,
  SectionHeader,
} from "@/components/marketing/MarketingPrimitives";
import {
  marketingAboutSections,
  marketingCompany,
  marketingPaths,
  marketingSeo,
  marketingTrustFacts,
} from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";

const valueHighlights = [
  "Рабочие данные относятся к объектам, этапам и ответственным.",
  "Роли определяют доступные пользователю разделы и действия.",
  "Готовые и пилотные функции обозначаются разными статусами.",
];

const AboutPage = () => {
  useSEO({
    ...marketingSeo.about,
    type: "website",
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="О продукте"
        title="МОСТ создан для связи объекта и офиса."
        description="Площадка фиксирует ход работ, задачи, заявки и замечания. ПТО, снабжение и финансовая служба дополняют эти данные, а руководитель использует их для управления."
        actions={[
          {
            label: "Связаться с нами",
            href: marketingPaths.contact,
            primary: true,
          },
          { label: "Посмотреть возможности", href: marketingPaths.features },
        ]}
        nav={[
          { label: "Подход", href: "#approach" },
          { label: "Принципы", href: "#principles" },
          { label: "Доверие", href: "#trust" },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Формат работы
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-steel-600">
              <p>{marketingCompany.location}</p>
              <p>{marketingCompany.responseTime}</p>
              <p>{marketingCompany.hours}</p>
              <a
                href={marketingCompany.emailHref}
                className="block font-semibold text-construction-700"
              >
                {marketingCompany.email}
              </a>
            </div>
          </div>
        }
      />

      <section id="approach" className="py-16 lg:py-20">
        <div className="container-custom grid gap-5 xl:grid-cols-3">
          {marketingAboutSections.map((section) => (
            <article
              key={section.title}
              className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                Подход
              </div>
              <h2 className="mt-3 text-2xl font-bold text-steel-950">
                {section.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-steel-600">
                {section.description}
              </p>
              <div className="mt-5 grid gap-3">
                {section.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                  >
                    {bullet}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="principles" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <SectionHeader
              eyebrow="Принципы"
              title="Принципы разработки МОСТ."
              description="Понятные обязанности, связанные данные, проверяемые права и честное обозначение готовности функций."
            />
          </div>
          <div className="rounded-[1.75rem] border border-steel-900 bg-steel-950 p-6 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
              Что получает команда
            </div>
            <div className="mt-4 grid gap-3">
              {valueHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/76"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <div>
            <SectionHeader
              eyebrow="Как устроен продукт"
              title="Доступ, данные и действия остаются связанными."
              description="Пользователь видит разрешённые организации и объекты, работает с прикреплёнными файлами и доступной историей операций."
            />
          </div>
          <TrustFactList items={marketingTrustFacts} />
        </div>
      </section>

      <section className="pb-16 lg:pb-20">
        <div className="container-custom">
          <CtaBand
            eyebrow="Демонстрация"
            title="Посмотрите МОСТ на задачах вашей команды."
            description="На встрече покажем нужные разделы, разберём роли и отдельно ответим на вопросы о доступе и документах."
            actions={[
              {
                label: "Связаться с нами",
                href: marketingPaths.contact,
                primary: true,
              },
              { label: "Безопасность", href: marketingPaths.security },
            ]}
            tone="light"
          />
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
