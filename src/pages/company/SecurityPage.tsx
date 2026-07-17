import CtaBand from "@/components/marketing/blocks/CtaBand";
import TrustFactList from "@/components/marketing/blocks/TrustFactList";
import {
  PageHero,
  SectionHeader,
  SurfaceBadges,
} from "@/components/marketing/MarketingPrimitives";
import { marketingSecurityCapabilities } from "@/data/marketing/trust";
import {
  marketingPaths,
  marketingSecuritySections,
  marketingSeo,
  marketingTrustFacts,
} from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";

const SecurityPage = () => {
  useSEO({
    ...marketingSeo.security,
    type: "website",
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Безопасность"
        title="Как МОСТ ограничивает доступ к рабочим данным."
        description="Права пользователя зависят от роли, организации и доступных объектов. Файлы связаны с рабочими записями, а предусмотренные продуктом действия и изменения доступны в защищённых журналах."
        actions={[
          {
            label: "Связаться с нами",
            href: marketingPaths.contact,
            primary: true,
          },
          { label: "О продукте", href: marketingPaths.about },
        ]}
        nav={[
          { label: "Принципы", href: "#principles" },
          { label: "Роли", href: "#roles" },
          { label: "Доверие", href: "#trust" },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Подтверждённые механизмы
            </div>
            <div className="mt-4 grid gap-3">
              {[
                "Проверка ролей и прав перед действием.",
                "Ограничение данных по организациям и объектам.",
                "Привязка файлов и доступная история изменений.",
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

      <section id="principles" className="py-16 lg:py-20">
        <div className="container-custom grid gap-5 xl:grid-cols-2">
          {marketingSecuritySections.map((section) => (
            <article
              key={section.title}
              className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                {section.title}
              </div>
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

      <section id="roles" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <div>
            <SectionHeader
              eyebrow="Роли"
              title="Интерфейсы и действия доступны по правам."
              description="Офис, мобильное приложение, кабинеты и управление группой компаний используют общую систему ролей и разрешений."
            />
            <div className="mt-8 grid gap-4">
              {marketingSecurityCapabilities.map((capability) => (
                <article
                  key={capability.id}
                  className="rounded-[1.5rem] border border-steel-200 bg-white px-5 py-5 shadow-sm"
                >
                  <div className="text-lg font-bold text-steel-950">
                    {capability.title}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-steel-600">
                    {capability.publicClaim}
                  </p>
                  <div className="mt-4">
                    <SurfaceBadges surfaces={capability.surfaces} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              eyebrow="Проверка доступа"
              title="Ограничения применяются к рабочим действиям."
              description="Права определяют, какие разделы пользователь открывает, какие операции выполняет и какие журналы просматривает."
            />
            <div className="mt-8">
              <TrustFactList items={marketingTrustFacts} />
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="pb-16 pt-16 lg:pb-20 lg:pt-20">
        <div className="container-custom">
          <CtaBand
            eyebrow="Демонстрация доступа"
            title="Проверьте роли и права на примере вашей команды."
            description="На встрече покажем доступ к разделам и объектам, работу с файлами и доступные журналы действий. Дополнительные требования зафиксируем отдельно."
            actions={[
              {
                label: "Связаться с нами",
                href: marketingPaths.contact,
                primary: true,
              },
              { label: "Публичная оферта", href: marketingPaths.offer },
            ]}
            tone="light"
          />
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;
