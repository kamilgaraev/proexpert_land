import CtaBand from '@/components/marketing/blocks/CtaBand';
import TrustFactList from '@/components/marketing/blocks/TrustFactList';
import { PageHero, SectionHeader } from '@/components/marketing/MarketingPrimitives';
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
    <div className="bg-white pt-28">
      <PageHero
        eyebrow="О продукте"
        title="ProHelper для управления строительной компанией."
        description="Единый рабочий контур для офиса, площадки, снабжения, финансового блока и руководителя."
        actions={[
          { label: 'Связаться с нами', href: marketingPaths.contact, primary: true },
          { label: 'Посмотреть возможности', href: marketingPaths.features },
        ]}
        nav={[
          { label: 'Подход', href: '#approach' },
          { label: 'Принципы', href: '#principles' },
          { label: 'Доверие', href: '#trust' },
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
              <a href={marketingCompany.emailHref} className="block font-semibold text-construction-700">
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
              <h2 className="mt-3 text-2xl font-bold text-steel-950">{section.title}</h2>
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

      <section id="principles" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <SectionHeader
              eyebrow="Принципы"
              title="Как мы подходим к внедрению и развитию продукта."
              description="ProHelper запускается поэтапно и масштабируется вместе с компанией."
            />
          </div>
          <div className="rounded-[1.75rem] border border-steel-900 bg-steel-950 p-6 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
              Что изменилось в подаче
            </div>
            <div className="mt-4 grid gap-3">
              {[
                'Смысловые блоки стали компактнее и быстрее считываются.',
                'Верхнеуровневый narrative теперь поддерживает SEO-структуру и перелинковку.',
                'Страница яснее связывает маркетинг, внедрение и доверительный слой.',
              ].map((item) => (
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
              eyebrow="Доверие"
              title="Почему ProHelper удобен для корпоративного клиента."
              description="Понятные роли, прозрачные процессы и управляемый формат запуска."
            />
          </div>
          <TrustFactList items={marketingTrustFacts} />
        </div>
      </section>

      <section className="pb-16 lg:pb-20">
        <div className="container-custom">
          <CtaBand
            eyebrow="Следующий шаг"
            title="Если хотите увидеть ProHelper на своем процессе, проведем прицельную демонстрацию."
            description="Покажем релевантный контур, обсудим этап внедрения и отдельно ответим на вопросы по безопасности и документам."
            actions={[
              { label: 'Связаться с нами', href: marketingPaths.contact, primary: true },
              { label: 'Безопасность', href: marketingPaths.security },
            ]}
            tone="light"
          />
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
