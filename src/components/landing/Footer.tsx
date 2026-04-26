import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  marketingCommercialLandingLinks,
  marketingCompany,
  marketingPaths,
  marketingRoleLandingLinks,
} from '@/data/marketingRegistry';

const sitemapGroups = [
  {
    title: 'Сайт',
    links: [
      { label: 'Главная', href: marketingPaths.home },
      { label: 'Решения', href: marketingPaths.solutions },
      { label: 'Продукт', href: marketingPaths.features },
      { label: 'Интеграции', href: marketingPaths.integrations },
      { label: 'Пакеты', href: marketingPaths.pricing },
    ],
  },
  {
    title: 'Роли и сценарии',
    links: [
      { label: 'Программа для прораба', href: marketingPaths.foremanSoftware },
      { label: 'Система для ПТО', href: marketingPaths.ptoSoftware },
      { label: 'Учет материалов', href: marketingPaths.materialAccounting },
      { label: 'Контроль подрядчиков', href: marketingPaths.contractorControl },
      { label: 'Контроль бюджета стройки', href: marketingPaths.constructionBudgetControl },
    ],
  },
  {
    title: 'Решения',
    links: [
      { label: 'CRM для строительной компании', href: marketingPaths.constructionCrm },
      { label: 'ERP для строительства', href: marketingPaths.constructionErp },
      { label: 'Исполнительная документация', href: marketingPaths.constructionDocuments },
      { label: 'Мобильное приложение', href: marketingPaths.mobileApp },
      { label: 'AI сметы по чертежам', href: marketingPaths.aiEstimates },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О продукте', href: marketingPaths.about },
      { label: 'Безопасность', href: marketingPaths.security },
      { label: 'Контакты', href: marketingPaths.contact },
      { label: 'Блог', href: marketingPaths.blog },
      { label: 'Войти в кабинет', href: '/login' },
    ],
  },
  {
    title: 'Документы',
    links: [
      { label: 'Политика конфиденциальности', href: marketingPaths.privacy },
      { label: 'Публичная оферта', href: marketingPaths.offer },
      { label: 'Политика cookie', href: marketingPaths.cookies },
    ],
  },
];

const footerNotes = [
  'Показываем продукт через рабочий сценарий, а не через витрину экранов.',
  'Запуск можно начать с одного контура и расширять по мере роста процессов.',
  'Материалы по безопасности и юридическому блоку предоставляем по запросу.',
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="overflow-x-hidden bg-steel-950 text-white">
      <div className="container-custom py-14 lg:py-16">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(249,115,22,0.08))] p-8 lg:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_auto] xl:items-end">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
                Следующий шаг
              </div>
              <h2 className="mt-4 max-w-4xl text-[clamp(2rem,4.2vw,3.8rem)] font-bold leading-[1.02]">
                Разберем ваш сценарий и покажем, с какого контура ProHelper лучше стартовать.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/72">
                На созвоне раскладываем роли команды, текущий процесс и приоритет запуска.
                Без лишнего визуального шума и попытки продавать весь каталог сразу.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
              <Link
                to={`${marketingPaths.home}#contact`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-steel-950 transition hover:bg-construction-100 sm:w-auto"
              >
                Запросить демо
                <ArrowUpRightIcon className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                to={marketingPaths.contact}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Связаться с нами
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
          <div>
            <div className="flex items-center gap-4">
              <img
                src="/logo-white.svg"
                alt=""
                className="h-14 w-14 shrink-0 object-contain"
              />
              <div>
                <div className="text-2xl font-bold">{marketingCompany.brand}</div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                  {marketingCompany.tagline}
                </div>
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
              ProHelper помогает собрать объект, снабжение, финансы, документы и управленческую картину
              в одной системе для офиса, площадки и руководителя.
            </p>

            <div className="mt-8 grid gap-3 lg:grid-cols-3">
              {footerNotes.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/72"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <a
                href={marketingCompany.emailHref}
                className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10"
              >
                <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-construction-200" />
                <div>
                  <div className="text-sm font-semibold text-white">Почта</div>
                  <div className="mt-1 text-sm text-white/68">{marketingCompany.email}</div>
                </div>
              </a>

              <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4">
                <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-construction-200" />
                <div>
                  <div className="text-sm font-semibold text-white">Ответ</div>
                  <div className="mt-1 text-sm text-white/68">
                    {marketingCompany.responseTime}. {marketingCompany.hours}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-construction-200" />
                <div>
                  <div className="text-sm font-semibold text-white">Формат</div>
                  <div className="mt-1 text-sm text-white/68">{marketingCompany.location}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
                Популярные сценарии
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {marketingRoleLandingLinks.slice(0, 4).map((item) => (
                  <Link
                    key={item.href + item.label}
                    to={item.href}
                    className="rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/72 transition hover:bg-white/10 hover:text-white"
                  >
                    <span className="font-semibold text-white">{item.label}.</span> {item.description}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {sitemapGroups.map((group) => (
              <div
                key={group.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
                  {group.title}
                </div>
                <div className="mt-4 space-y-3">
                  {group.links.map((item) => (
                    <Link
                      key={`${group.title}-${item.href}-${item.label}`}
                      to={item.href}
                      className="block text-sm leading-7 text-white/72 transition hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
            Популярные решения
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {marketingCommercialLandingLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/72 transition hover:bg-white/10 hover:text-white"
              >
                <span className="font-semibold text-white">{item.label}.</span> {item.description}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <div>© {currentYear} ProHelper. Все права защищены.</div>
          <div className="flex flex-wrap gap-5">
            <Link to={marketingPaths.privacy} className="transition hover:text-white">
              Конфиденциальность
            </Link>
            <Link to={marketingPaths.offer} className="transition hover:text-white">
              Оферта
            </Link>
            <Link to={marketingPaths.cookies} className="transition hover:text-white">
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
