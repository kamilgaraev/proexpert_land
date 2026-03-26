import CtaBand from '@/components/marketing/blocks/CtaBand';
import TrustFactList from '@/components/marketing/blocks/TrustFactList';
import {
  PageHero,
  SectionHeader,
  SurfaceBadges,
} from '@/components/marketing/MarketingPrimitives';
import {
  marketingCapabilityMatrix,
  marketingPaths,
  marketingSecuritySections,
  marketingSeo,
  marketingTrustFacts,
} from '@/data/marketingRegistry';
import { useSEO } from '@/hooks/useSEO';

const SecurityPage = () => {
  useSEO({
    ...marketingSeo.security,
    type: 'website',
  });

  return (
    <div className="bg-white pt-28">
      <PageHero
        eyebrow="Безопасность"
        title="Безопасность ProHelper для корпоративных клиентов."
        description="Роли, доступ, документы, прозрачность действий и поддержка проектного запуска."
        actions={[
          { label: 'Связаться с нами', href: marketingPaths.contact, primary: true },
          { label: 'О продукте', href: marketingPaths.about },
        ]}
        nav={[
          { label: 'Принципы', href: '#principles' },
          { label: 'Роли', href: '#roles' },
          { label: 'Доверие', href: '#trust' },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Что важно клиенту
            </div>
            <div className="mt-4 grid gap-3">
              {[
                'Понятная модель ролей и доступа.',
                'Централизованная работа с документами.',
                'Прозрачность действий и процессов.',
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
              <p className="mt-4 text-sm leading-7 text-steel-600">{section.description}</p>
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
              title="Офис, площадка, кабинет и корпоративный контур разделены по задачам."
              description="Показываем это на примерах из продуктовых контуров ProHelper."
            />
            <div className="mt-8 grid gap-4">
              {marketingCapabilityMatrix.slice(0, 5).map((capability) => (
                <article
                  key={capability.id}
                  className="rounded-[1.5rem] border border-steel-200 bg-white px-5 py-5 shadow-sm"
                >
                  <div className="text-lg font-bold text-steel-950">{capability.title}</div>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{capability.publicClaim}</p>
                  <div className="mt-4">
                    <SurfaceBadges surfaces={capability.surfaces} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              eyebrow="Доверительный слой"
              title="Безопасность поддерживает управляемость, а не мешает работе."
              description="Акцент на ролях, прозрачности процессов и понятной модели запуска."
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
            eyebrow="Обсуждение проекта"
            title="Если нужна оценка безопасности до старта, подключим этот блок отдельно и пройдемся по материалам."
            description="На встрече покажем релевантный контур, расскажем о принципах доступа и обсудим, какие публичные и проектные материалы нужны вашей стороне."
            actions={[
              { label: 'Связаться с нами', href: marketingPaths.contact, primary: true },
              { label: 'Публичная оферта', href: marketingPaths.offer },
            ]}
            tone="light"
          />
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;
