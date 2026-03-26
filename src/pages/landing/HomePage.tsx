import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContactForm from '@/components/landing/ContactForm';
import CapabilityCard from '@/components/marketing/blocks/CapabilityCard';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import FaqAccordion from '@/components/marketing/blocks/FaqAccordion';
import PackageFamilyCard from '@/components/marketing/blocks/PackageFamilyCard';
import TrustFactList from '@/components/marketing/blocks/TrustFactList';
import {
  PageHero,
  PageSectionNav,
  SectionHeader,
} from '@/components/marketing/MarketingPrimitives';
import {
  marketingCapabilityMatrix,
  marketingFaqs,
  marketingHeroFacts,
  marketingLaunchSteps,
  marketingPackages,
  marketingPaths,
  marketingSeo,
  marketingSolutionSegments,
  marketingTrustFacts,
} from '@/data/marketingRegistry';
import useAnalytics from '@/hooks/useAnalytics';
import { useSEO } from '@/hooks/useSEO';

const homeSections = [
  { label: 'Для кого', href: '#audiences' },
  { label: 'Контуры', href: '#product' },
  { label: 'Доверие', href: '#proof' },
  { label: 'Пакеты', href: '#packages' },
  { label: 'Запуск', href: '#launch' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Контакт', href: '#contact' },
];

const featuredCapabilityIds = [
  'project-control',
  'supply-chain',
  'finance-control',
  'multi-org',
];

const contactHighlights = [
  'Разберем текущий процесс до показа системы.',
  'Покажем релевантный контур, а не весь каталог модулей.',
  'Сразу обсудим этап запуска, роли и возможные ограничения.',
];

const HomePage = () => {
  const { addFAQSchema } = useSEO({
    ...marketingSeo.home,
    type: 'website',
  });
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    addFAQSchema(marketingFaqs);
  }, [addFAQSchema]);

  useEffect(() => {
    trackPageView('marketing_home');
  }, [trackPageView]);

  const featuredCapabilities = featuredCapabilityIds
    .map((id) => marketingCapabilityMatrix.find((capability) => capability.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="overflow-hidden bg-white">
      <PageHero
        eyebrow="Платформа управления строительством"
        title="Соберите объект, снабжение, финансы и документы в одной системе."
        description="ProHelper помогает подрядчику, генподрядчику, девелоперу и инженерной команде работать в едином цифровом процессе без разрыва между офисом, площадкой и руководителем."
        actions={[
          { label: 'Запросить демонстрацию', href: '#contact', primary: true },
          { label: 'Посмотреть решения', href: marketingPaths.solutions },
        ]}
        nav={homeSections}
        aside={
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                Что получает команда
              </div>
              <div className="mt-4 space-y-3">
                {[
                  'Единый рабочий контур по объекту, снабжению и финансам.',
                  'Пошаговый запуск без перегруженного внедрения.',
                  'Масштабирование от одного процесса до группы компаний.',
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

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {marketingHeroFacts.map((fact) => (
                <div key={fact.label} className="rounded-[1.5rem] border border-steel-200 bg-white p-5 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                    {fact.label}
                  </div>
                  <div className="mt-3 text-2xl font-bold text-steel-950">{fact.value}</div>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{fact.detail}</p>
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section id="audiences" className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Для кого"
            title="Сайт говорит не про абстрактный SaaS, а про реальные роли и сценарии."
            description="Каждый сценарий ниже собран вокруг рабочего запроса компании: где теряется управление, как выглядит целевой контур и с какого этапа запускать систему."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {marketingSolutionSegments.map((segment) => (
              <article
                key={segment.id}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-steel-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                      {segment.audience}
                    </div>
                    <h3 className="mt-2 text-2xl font-bold text-steel-950">{segment.title}</h3>
                  </div>
                  <Link
                    to={marketingPaths.solutions}
                    className="text-sm font-semibold text-steel-500 transition hover:text-construction-700"
                  >
                    Полный сценарий
                  </Link>
                </div>
                <p className="mt-5 text-sm leading-7 text-steel-600">
                  <span className="font-semibold text-steel-950">Проблема:</span> {segment.challenge}
                </p>
                <p className="mt-3 text-sm leading-7 text-steel-600">
                  <span className="font-semibold text-steel-950">Что меняется:</span>{' '}
                  {segment.transformation}
                </p>
                <div className="mt-5 grid gap-3">
                  {segment.workflows.map((workflow) => (
                    <div
                      key={workflow}
                      className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-6 text-steel-700"
                    >
                      {workflow}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Контуры"
            title="Ключевые процессы собраны в понятные бизнес-контуры, а не разбросаны по экранным фичам."
            description="На главной оставили только те контуры, которые быстрее всего объясняют ценность ProHelper: объект, снабжение, финансы и корпоративный слой."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {featuredCapabilities.map((capability) => (
              <CapabilityCard key={capability.id} capability={capability} />
            ))}
          </div>

          <div className="mt-8">
            <PageSectionNav
              items={[
                { label: 'Смотреть все возможности', href: marketingPaths.features },
                { label: 'Сценарии по ролям', href: marketingPaths.solutions },
                { label: 'Безопасность и доступ', href: marketingPaths.security },
              ]}
            />
          </div>
        </div>
      </section>

      <section id="proof" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div>
            <SectionHeader
              eyebrow="Доверие"
              title="Публичный сайт теперь сразу отвечает на корпоративные вопросы клиента."
              description="Роли, прозрачность процессов, централизованная работа с документами и понятная модель запуска вынесены в отдельный доверительный слой."
            />

            <div className="mt-8 grid gap-4">
              {marketingHeroFacts.map((fact) => (
                <article key={fact.label} className="rounded-[1.5rem] bg-concrete-50 px-5 py-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                    {fact.label}
                  </div>
                  <div className="mt-2 text-3xl font-bold text-steel-950">{fact.value}</div>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{fact.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <TrustFactList items={marketingTrustFacts} />
          </div>
        </div>
      </section>

      <section id="packages" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Пакеты"
            title="Вместо абстрактных тарифов сайт показывает рабочие точки входа в продукт."
            description="Пакетная логика помогает начать с нужного контура, а затем расширять систему по мере роста команды и числа объектов."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {marketingPackages.slice(0, 4).map((item) => (
              <PackageFamilyCard key={item.slug} item={item} compact />
            ))}
          </div>
        </div>
      </section>

      <section id="launch" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
          <div className="rounded-[1.9rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7">
            <SectionHeader
              eyebrow="Запуск"
              title="Внедрение разбито на понятные шаги, без обещаний «включить все сразу»."
              description="Это важный сдвиг для маркетинга: мы продаем не перегруженный редизайн, а ясный маршрут внедрения."
            />

            <div className="mt-8 space-y-4">
              {marketingLaunchSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-[1.25rem] bg-concrete-50 px-4 py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-steel-950 text-sm font-bold text-construction-200">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-steel-950">{step.title}</div>
                    <p className="mt-2 text-sm leading-7 text-steel-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <CtaBand
            eyebrow="Маршрут запуска"
            title="Поможем выбрать минимально достаточный состав решения под ваш текущий этап."
            description="На встрече разложим роли, процессы и ограничения, после чего предложим стартовый контур без лишних модулей и перегруза."
            actions={[
              { label: 'Перейти к пакетам', href: marketingPaths.pricing, primary: true },
              { label: 'Связаться с нами', href: '#contact' },
            ]}
            tone="dark"
          />
        </div>
      </section>

      <section id="faq" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div>
            <SectionHeader
              eyebrow="FAQ"
              title="Частые вопросы теперь встроены в структуру сайта, а не прячутся внизу страницы."
              description="Это помогает и SEO, и продажам: пользователь быстрее считывает ограничения, формат запуска и логику демонстрации."
            />
          </div>
          <FaqAccordion items={marketingFaqs} />
        </div>
      </section>

      <section id="contact" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(420px,0.92fr)] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Контакт"
              title="Сайт завершает маршрут не абстрактным CTA, а нормальным B2B-контактом."
              description="Форма собрана проще и строже: она помогает быстро перейти от маркетинга к содержательному созвону по вашему сценарию."
            />
            <div className="mt-8 grid gap-3">
              {contactHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <ContactForm variant="full" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
