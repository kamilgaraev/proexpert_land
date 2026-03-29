import CtaBand from '@/components/marketing/blocks/CtaBand';
import {
  MarketingLink,
  PageHero,
  SectionHeader,
  SurfaceBadges,
} from '@/components/marketing/MarketingPrimitives';
import {
  marketingCapabilityMatrix,
  marketingPaths,
  marketingSeo,
  marketingTrustFacts,
} from '@/data/marketingRegistry';
import { useSEO } from '@/hooks/useSEO';

const enterpriseHighlights = [
  'Единые правила доступа для офиса, площадки и корпоративного контура.',
  'Запуск поэтапно: пилот, тиражирование, управленческая отчетность.',
  'Контроль группы компаний без ручной сборки статусов из разных систем.',
];

const enterpriseOperatingModel = [
  {
    title: 'Корпоративный контур',
    description:
      'Собираем единые правила ролей, доступа, отчетности и работы с документами для нескольких компаний и проектов.',
    bullets: [
      'Разделяем операционный и управленческий слой.',
      'Фиксируем, кто и на каком уровне принимает решения.',
      'Подключаем аналитику только после определения базового контура.',
    ],
  },
  {
    title: 'Масштабирование запуска',
    description:
      'Не разворачиваем все сразу. Сначала согласуем пилотный сценарий, затем тиражируем рабочую модель по подразделениям и объектам.',
    bullets: [
      'Пилот на одном блоке процессов или группе команд.',
      'Расширение после подтвержденного рабочего результата.',
      'Отдельная настройка для корпоративных требований и отчетности.',
    ],
  },
];

const enterpriseTrustLayer = [
  'Показываем, как разграничиваются офис, объект, подрядчик и корпоративный уровень.',
  'На встрече разбираем только релевантные роли и сценарии, без витринных обещаний.',
  'Безопасность, документы и проектные материалы подключаются по запросу, а не в виде абстрактного списка.',
];

const featuredCapabilities = marketingCapabilityMatrix.filter((capability) =>
  ['multi-org', 'finance-control', 'project-control', 'document-control'].includes(capability.id),
);

const enterpriseRelatedLinks = [
  {
    label: 'ERP для строительства',
    href: marketingPaths.constructionErp,
    description: 'Если нужен единый слой по объектам, финансам и документам для нескольких команд и юридических контуров.',
  },
  {
    label: 'Интеграции и расширения',
    href: marketingPaths.integrations,
    description: 'Подходит, когда корпоративный запуск требует внешнего обмена данными, пилотов или согласованных сценариев интеграции.',
  },
  {
    label: 'Контроль бюджета стройки',
    href: marketingPaths.constructionBudgetControl,
    description: 'Для компаний, которым важно вынести в отдельный контур лимиты, платежный календарь и управленческую аналитику.',
  },
  {
    label: 'Безопасность и доступ',
    href: marketingPaths.security,
    description: 'Если в обсуждении на первом месте роли, разграничение доступа, журнал действий и требования корпоративной безопасности.',
  },
];

const EnterprisePage = () => {
  useSEO({
    ...marketingSeo.enterprise,
    type: 'website',
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Корпоративный контур"
        title="ProHelper для группы компаний, корпоративного контроля и поэтапного запуска."
        description="Подходит командам, которым нужен единый рабочий контур между объектами, офисом и управленческим уровнем без ручной склейки процессов и отчетов."
        actions={[
          { label: 'Обсудить корпоративный сценарий', href: marketingPaths.contact, primary: true },
          { label: 'Безопасность и доступ', href: marketingPaths.security },
        ]}
        nav={[
          { label: 'Модель запуска', href: '#operating-model' },
          { label: 'Контуры', href: '#enterprise-capabilities' },
          { label: 'Следующий шаг', href: '#enterprise-cta' },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Что важно крупной команде
            </div>
            <div className="mt-4 grid gap-3">
              {enterpriseHighlights.map((item) => (
                <div key={item} className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section id="operating-model" className="py-16 lg:py-20">
        <div className="container-custom grid gap-5 xl:grid-cols-2">
          {enterpriseOperatingModel.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                {item.title}
              </div>
              <p className="mt-4 text-sm leading-7 text-steel-600">{item.description}</p>
              <div className="mt-5 grid gap-3">
                {item.bullets.map((bullet) => (
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

      <section id="enterprise-capabilities" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Контуры"
            title="Берем в запуск только те продуктовые блоки, которые поддерживают корпоративную модель."
            description="Ниже не общий каталог функций, а те контуры, которые чаще всего нужны группе компаний и крупным строительным командам."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {featuredCapabilities.map((capability) => (
              <article
                key={capability.id}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-steel-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                      {capability.businessContour}
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-steel-950">{capability.title}</h2>
                  </div>
                  <SurfaceBadges surfaces={capability.surfaces} />
                </div>
                <p className="mt-5 text-sm leading-7 text-steel-600">{capability.publicClaim}</p>
                <div className="mt-5 grid gap-3">
                  {capability.outcomes.slice(0, 3).map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <div>
            <SectionHeader
              eyebrow="Как мы это обсуждаем"
              title="Разговор о корпоративном запуске начинается не с лицензий, а с модели управления."
              description="На первой встрече разбираем роли, уровень стандартизации, структуру команд и последовательность запуска, чтобы показать рабочий, а не витринный сценарий."
            />
            <div className="mt-8 grid gap-3">
              {enterpriseTrustLayer.map((item) => (
                <div key={item} className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
              Почему этому сценарию доверяют
            </div>
            <div className="mt-5 grid gap-3">
              {marketingTrustFacts.slice(0, 4).map((fact) => (
                <article key={fact.title} className="rounded-[1.15rem] bg-concrete-50 px-4 py-4">
                  <div className="text-base font-semibold text-steel-950">{fact.title}</div>
                  <p className="mt-2 text-sm leading-7 text-steel-600">{fact.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Смежные сценарии"
            title="Если корпоративный контур нужно уточнить, переходите в профильную страницу"
            description="Эти направления чаще всего идут рядом с enterprise-запуском и помогают быстрее сузить предмет разговора."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {enterpriseRelatedLinks.map((item) => (
              <MarketingLink
                key={item.href}
                href={item.href}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm transition hover:border-construction-300 hover:bg-construction-50/40"
              >
                <div className="text-xl font-bold text-steel-950">{item.label}</div>
                <p className="mt-3 text-sm leading-7 text-steel-600">{item.description}</p>
              </MarketingLink>
            ))}
          </div>
        </div>
      </section>

      <section id="enterprise-cta" className="pb-16 pt-16 lg:pb-20 lg:pt-20">
        <div className="container-custom">
          <CtaBand
            eyebrow="Следующий шаг"
            title="Если нужен корпоративный разбор, соберем релевантный сценарий запуска без лишних обещаний."
            description="На встрече покажем подходящий контур, обсудим роли, модель доступа, поэтапное внедрение и отдельные требования по безопасности или документам."
            actions={[
              { label: 'Связаться с нами', href: marketingPaths.contact, primary: true },
              { label: 'О продукте', href: marketingPaths.about },
            ]}
            tone="dark"
          />
        </div>
      </section>
    </div>
  );
};

export default EnterprisePage;
