import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { SectionHeader, SurfaceBadges } from '@/components/marketing/MarketingPrimitives';
import {
  marketingCapabilityMatrix,
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
    <div className="bg-white pt-20">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.14),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <SectionHeader
            eyebrow="Security"
            title="Безопасность и доверительный контур публичного сайта ProHelper"
            description="Security-страница описывает только реально существующие архитектурные решения: JWT, role definitions, S3-ориентированное хранение, response-контракты и раздельные surface-ы."
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom grid gap-6 lg:grid-cols-3">
          {marketingSecuritySections.map((section) => (
            <article
              key={section.title}
              className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-construction-50 text-construction-700">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-steel-950">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-steel-600">{section.description}</p>
              <div className="mt-5 grid gap-3">
                {section.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="rounded-2xl bg-concrete-50 px-4 py-4 text-sm leading-6 text-steel-700"
                  >
                    {bullet}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionHeader
              eyebrow="Surface model"
              title="Доступ к функциям зависит от surface и роли"
              description="Public security-страница показывает, что возможности платформы не смешаны в один интерфейс без разграничения."
            />
            <div className="mt-8 grid gap-4">
              {marketingCapabilityMatrix.slice(0, 6).map((capability) => (
                <article
                  key={capability.id}
                  className="rounded-[1.75rem] border border-steel-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-steel-950">{capability.title}</h3>
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

          <div className="rounded-[2rem] border border-steel-200 bg-steel-950 p-8 text-white">
            <SectionHeader
              eyebrow="Trust facts"
              title="Что можно утверждать публично уже сейчас"
              description="Эти пункты связаны с кодовой базой и инфраструктурными правилами проекта."
            />
            <div className="mt-8 space-y-4">
              {marketingTrustFacts.map((fact) => (
                <div
                  key={fact.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5"
                >
                  <div className="text-lg font-bold">{fact.title}</div>
                  <p className="mt-2 text-sm leading-7 text-white/75">{fact.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;
