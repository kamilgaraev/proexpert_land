import CtaBand from '@/components/marketing/blocks/CtaBand';
import TrustFactList from '@/components/marketing/blocks/TrustFactList';
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
    <div className="bg-white pt-28">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.14),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="container-custom py-20 lg:py-24">
          <SectionHeader
            eyebrow="О продукте"
            title="ProHelper помогает строительным командам работать как одна система"
            description="Мы показываем продукт через реальный рабочий процесс: объект, снабжение, финансовый блок, документы и управленческий контроль."
          />
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="container-custom grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            {marketingAboutSections.map((section) => (
              <article
                key={section.title}
                className="rounded-[2.25rem] border border-steel-200 bg-white p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-steel-950">{section.title}</h2>
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

          <div className="space-y-6">
            <article className="rounded-[2.25rem] border border-steel-900 bg-steel-950 p-8 lg:p-9">
              <SectionHeader
                eyebrow="Как работаем"
                title="Показываем сценарий запуска, а не перегруженную демонстрацию"
                description="Перед показом уточняем роли команды, масштаб компании и тот участок процесса, где сейчас больше всего ручной нагрузки."
                tone="dark"
              />
              <div className="mt-8 space-y-4 text-sm leading-7 text-white/75">
                <p>{marketingCompany.location}</p>
                <p>{marketingCompany.responseTime}</p>
                <p>{marketingCompany.hours}</p>
                <a href={marketingCompany.emailHref} className="block text-construction-200">
                  {marketingCompany.email}
                </a>
              </div>
            </article>

            <article className="rounded-[2.25rem] border border-steel-200 bg-white p-8 shadow-sm lg:p-9">
              <SectionHeader
                eyebrow="Почему это удобно"
                title="То, что особенно важно заказчику на этапе выбора"
                description="Понятная модель доступа, прозрачный процесс и единая рабочая логика для офиса и объекта."
              />
              <div className="mt-8">
                <TrustFactList items={marketingTrustFacts} />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="pb-20 lg:pb-24">
        <div className="container-custom">
          <CtaBand
            eyebrow="Следующий шаг"
            title="Если хотите увидеть продукт на своем процессе, проведем прицельную демонстрацию"
            description="Покажем релевантный контур, обсудим этап внедрения и отдельно ответим на вопросы по безопасности и документам."
            actions={[
              { label: 'Связаться с нами', href: marketingPaths.contact, primary: true },
              { label: 'Безопасность', href: marketingPaths.security },
            ]}
          />
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
