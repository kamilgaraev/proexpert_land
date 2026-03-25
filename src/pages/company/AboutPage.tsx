import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  marketingAboutSections,
  marketingCompany,
  marketingPaths,
  marketingSeo,
  marketingTrustFacts,
} from '@/data/marketingRegistry';
import { useSEO } from '@/hooks/useSEO';

const AboutPage = () => {
  useSEO({
    ...marketingSeo.about,
    type: 'website',
  });

  return (
    <div className="bg-white pt-20">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.14),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <SectionHeader
            eyebrow="About"
            title="Публичный сайт ProHelper строится на реальном продукте, а не на витринных цифрах"
            description="В этой версии мы сознательно убрали вымышленные статистики, офисы и истории успеха. В доверительном контуре остаются только подтверждённые продуктовые и архитектурные факты."
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            {marketingAboutSections.map((section) => (
              <article
                key={section.title}
                className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-steel-950">{section.title}</h2>
                <p className="mt-4 text-sm leading-7 text-steel-600">
                  {section.description}
                </p>
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

          <div className="space-y-6">
            <article className="rounded-[2rem] border border-steel-200 bg-steel-950 p-7 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-construction-200">
                Как мы работаем
              </div>
              <div className="mt-5 space-y-4 text-sm leading-7 text-white/80">
                <p>{marketingCompany.location}</p>
                <p>{marketingCompany.responseTime}</p>
                <p>{marketingCompany.hours}</p>
              </div>
              <a
                href={marketingCompany.emailHref}
                className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-construction-200"
              >
                {marketingCompany.email}
              </a>
              <p className="mt-4 text-sm leading-7 text-white/70">
                {marketingCompany.legalStatusNote}
              </p>
            </article>

            <article className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
                Trust contour
              </div>
              <div className="mt-5 space-y-4">
                {marketingTrustFacts.map((fact) => (
                  <div
                    key={fact.title}
                    className="rounded-[1.5rem] bg-concrete-50 px-4 py-4"
                  >
                    <div className="text-base font-bold text-steel-950">{fact.title}</div>
                    <p className="mt-2 text-sm leading-7 text-steel-600">{fact.text}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="rounded-[2rem] border border-steel-200 bg-construction-50 p-7">
              <div className="text-2xl font-bold text-steel-950">
                Нужен walkthrough по продуктовым контурам и security-слою?
              </div>
              <p className="mt-4 text-sm leading-7 text-steel-700">
                Покажем, как capability matrix связывается с пакетами, legal-страницами
                и фактическими surface-ами продукта.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={marketingPaths.contact}
                  className="inline-flex items-center gap-2 rounded-2xl bg-steel-950 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-steel-900"
                >
                  Связаться с нами
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to={marketingPaths.security}
                  className="inline-flex items-center justify-center rounded-2xl border border-steel-300 bg-white px-6 py-4 text-sm font-semibold text-steel-900 transition hover:border-steel-500"
                >
                  Страница безопасности
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
