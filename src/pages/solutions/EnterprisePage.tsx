import CtaBand from '@/components/marketing/blocks/CtaBand';
import {
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

const EnterprisePage = () => {
  useSEO({
    ...marketingSeo.enterprise,
    type: 'website',
  });

  return (
    <div className="bg-white pt-28">
      <PageHero
        eyebrow="Enterprise"
        title="ProHelper для группы компаний, корпоративного контроля и масштабируемого запуска."
        description="Страница для команд, которым нужен единый рабочий контур между объектами, офисом и управленческим уровнем без ручной склейки процессов."
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
              title="Разговор про enterprise начинается не с лицензий, а с модели управления."
              description="На первой встрече разбираем роли, уровень стандартизации, структуру команд и последовательность запуска."
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
              Дополнительный слой доверия
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
