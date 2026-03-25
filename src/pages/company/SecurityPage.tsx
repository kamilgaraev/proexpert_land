import { Link } from 'react-router-dom';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import TrustFactList from '@/components/marketing/blocks/TrustFactList';
import { SectionHeader, SurfaceBadges } from '@/components/marketing/MarketingPrimitives';
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
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.14),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="container-custom py-20 lg:py-24">
          <SectionHeader
            eyebrow="Безопасность"
            title="Рассказываем о безопасности так, как это действительно важно заказчику"
            description="На этой странице собраны основные принципы: доступ по ролям, централизованная работа с документами, прозрачность действий и поддержка запуска."
          />
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="container-custom grid gap-5 xl:grid-cols-2">
          {marketingSecuritySections.map((section) => (
            <article
              key={section.title}
              className="rounded-[2.25rem] border border-steel-200 bg-white p-8 shadow-sm"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-construction-700">
                {section.title}
              </div>
              <p className="mt-4 text-sm leading-7 text-steel-600">{section.description}</p>
              <div className="mt-6 grid gap-3">
                {section.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="rounded-[1.5rem] bg-concrete-50 px-4 py-4 text-sm leading-6 text-steel-700"
                  >
                    {bullet}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-concrete-50 py-20 lg:py-24">
        <div className="container-custom grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2.5rem] border border-steel-200 bg-white p-8 shadow-sm lg:p-9">
            <SectionHeader
              eyebrow="Рабочие роли"
              title="Офис, площадка, кабинет и корпоративный контур разделены по задачам"
              description="Продукт позволяет выстраивать доступ в соответствии с ролью пользователя и тем процессом, за который он отвечает."
            />
            <div className="mt-8 grid gap-4">
              {marketingCapabilityMatrix.slice(0, 5).map((capability) => (
                <article
                  key={capability.id}
                  className="rounded-[1.75rem] bg-concrete-50 px-5 py-5"
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

          <div className="rounded-[2.5rem] border border-steel-900 bg-steel-950 p-8 lg:p-9">
            <SectionHeader
              eyebrow="Почему это важно"
              title="Безопасность не должна мешать работе, она должна поддерживать управляемость"
              description="Мы выстраиваем публичное объяснение вокруг бизнес-пользы: кто что видит, как хранятся документы и как контролируется процесс."
              tone="dark"
            />
            <div className="mt-8">
              <TrustFactList items={marketingTrustFacts} tone="dark" />
            </div>
            <Link
              to={marketingPaths.contact}
              className="mt-8 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Запросить материалы
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-20 lg:pb-24">
        <div className="container-custom">
          <CtaBand
            eyebrow="Обсуждение проекта"
            title="Если вам нужно пройти оценку безопасности до старта, подключим этот блок отдельно"
            description="На встрече покажем релевантный контур, расскажем о принципах доступа и обсудим, какие материалы нужны вашей стороне для согласования."
            actions={[
              { label: 'Связаться с нами', href: marketingPaths.contact, primary: true },
              { label: 'Публичная оферта', href: marketingPaths.offer },
            ]}
          />
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;
