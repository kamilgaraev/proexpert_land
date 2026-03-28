import { useEffect } from 'react';
import ContactForm from '@/components/landing/ContactForm';
import FaqAccordion from '@/components/marketing/blocks/FaqAccordion';
import {
  MarketingLink,
  PageHero,
  PageSectionNav,
  SectionHeader,
} from '@/components/marketing/MarketingPrimitives';
import { marketingSeoLandingPages, marketingSeo, marketingPaths } from '@/data/marketingRegistry';
import { useSEO } from '@/hooks/useSEO';
import { generateCommercialPageSchema } from '@/utils/seo';

type SeoClusterPageProps = {
  pageKey: keyof typeof marketingSeoLandingPages;
};

const SeoClusterPage = ({ pageKey }: SeoClusterPageProps) => {
  const page = marketingSeoLandingPages[pageKey];
  const canonicalUrl = `https://prohelper.pro${page.path}`;
  const { addBreadcrumbSchema, addFAQSchema } = useSEO({
    ...marketingSeo[pageKey],
    type: 'website',
    structuredData: generateCommercialPageSchema({
      name: page.title,
      description: page.description,
      url: canonicalUrl,
      audience: page.audiences,
      keywords: page.supportingQueries,
    }),
  });

  useEffect(() => {
    addFAQSchema(page.faq);
    addBreadcrumbSchema([
      { name: 'ProHelper', url: 'https://prohelper.pro/' },
      { name: 'Решения', url: 'https://prohelper.pro/solutions' },
      { name: page.title, url: canonicalUrl },
    ]);
  }, [addBreadcrumbSchema, addFAQSchema, canonicalUrl, page.faq, page.title]);

  return (
    <div className="bg-white pt-28">
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        actions={[
          { label: 'Запросить демонстрацию', href: '#contact', primary: true },
          { label: 'Смотреть все решения', href: marketingPaths.solutions },
        ]}
        nav={[
          { label: 'Для кого', href: '#audience' },
          { label: 'Задачи', href: '#problems' },
          { label: 'Автоматизация', href: '#automation' },
          { label: 'FAQ', href: '#faq' },
          { label: 'Контакт', href: '#contact' },
        ]}
        aside={
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                Основной сценарий
              </div>
              <div className="mt-4 rounded-[1.2rem] bg-concrete-50 px-4 py-4 text-sm font-semibold leading-7 text-steel-950">
                {page.supportingQueries[0]}
              </div>
              <div className="mt-4 grid gap-3">
                {page.supportingQueries.slice(1).map((query) => (
                  <div
                    key={query}
                    className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                  >
                    {query}
                  </div>
                ))}
              </div>
            </div>

            <PageSectionNav items={page.relatedLinks.map((link) => ({ label: link.label, href: link.href }))} />
          </div>
        }
      />

      <section id="audience" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div>
            <SectionHeader
              eyebrow="Для кого"
              title={page.audienceTitle}
              description={page.audienceDescription}
            />
          </div>
          <div className="grid gap-4">
            {page.audiences.map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-steel-200 bg-white px-5 py-5 shadow-sm">
                <div className="text-sm leading-7 text-steel-700">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="problems" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <div>
            <SectionHeader
              eyebrow="Задачи"
              title={page.problemTitle}
              description={page.problemDescription}
            />
          </div>
          <div className="grid gap-4">
            {page.problems.map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-steel-200 bg-white px-5 py-5 shadow-sm">
                <div className="text-sm leading-7 text-steel-700">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="automation" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <div>
            <SectionHeader
              eyebrow="Автоматизация"
              title={page.automationTitle}
              description={page.automationDescription}
            />
            <div className="mt-8 grid gap-4">
              {page.automations.map((item) => (
                <div key={item} className="rounded-[1.5rem] bg-concrete-50 px-5 py-5 text-sm leading-7 text-steel-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-steel-900 bg-steel-950 p-6 text-white shadow-sm lg:p-7">
            <SectionHeader
              eyebrow="Роли и обзор"
              title={page.visibilityTitle}
              description={page.visibilityDescription}
              tone="dark"
            />
            <div className="mt-8 grid gap-4">
              {page.roleViews.map((item) => (
                <div key={item.role} className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="text-sm font-semibold text-white">{item.role}</div>
                  <div className="mt-2 text-sm leading-7 text-white/76">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-2">
          <div className="rounded-[1.9rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7">
            <SectionHeader
              eyebrow="Связанные решения"
              title="Соседние сценарии и решения"
              description="Если ваша задача затрагивает несколько ролей или процессов, здесь можно быстро перейти в смежный контур."
            />
            <div className="mt-8 grid gap-4">
              {page.relatedLinks.map((link) => (
                <MarketingLink
                  key={link.href + link.label}
                  href={link.href}
                  className="rounded-[1.35rem] border border-steel-200 px-5 py-5 transition hover:border-construction-300 hover:bg-construction-50/50"
                >
                  <div className="text-base font-semibold text-steel-950">{link.label}</div>
                  <div className="mt-2 text-sm leading-7 text-steel-600">{link.description}</div>
                </MarketingLink>
              ))}
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7">
            <SectionHeader
              eyebrow="Контент"
              title="Полезные материалы по теме"
              description="Здесь собраны статьи и разборы, которые помогают глубже понять сценарий перед демонстрацией."
            />
            <div className="mt-8 grid gap-4">
              {page.blogLinks.map((link) => (
                <MarketingLink
                  key={link.label}
                  href={link.href}
                  className="rounded-[1.35rem] bg-concrete-50 px-5 py-5 transition hover:bg-construction-50/70"
                >
                  <div className="text-base font-semibold text-steel-950">{link.label}</div>
                  <div className="mt-2 text-sm leading-7 text-steel-600">{link.description}</div>
                </MarketingLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <SectionHeader
              eyebrow="FAQ"
              title="Частые вопросы по этому сценарию"
              description="Отвечаем на запросы, которые чаще всего возникают до демонстрации и старта пилота."
            />
          </div>
          <FaqAccordion items={page.faq} />
        </div>
      </section>

      <section id="contact" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.92fr)] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Контакт"
              title="Запросите демонстрацию под ваш процесс"
              description="Покажем только релевантный сценарий, роли, отчеты и соседние контуры, которые действительно важны для запуска."
            />
            <div className="mt-8 grid gap-3">
              {page.contactHighlights.map((item) => (
                <div key={item} className="rounded-[1.25rem] bg-white px-4 py-4 text-sm leading-7 text-steel-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <ContactForm variant="compact" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default SeoClusterPage;
