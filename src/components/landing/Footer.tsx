import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  BuildingOfficeIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  marketingCompany,
  marketingNavigation,
  marketingPaths,
} from '@/data/marketingRegistry';

const footerGroups = [
  {
    title: 'Навигация',
    links: marketingNavigation,
  },
  {
    title: 'Сценарии',
    links: [
      { label: 'Подрядчик', href: marketingPaths.solutions },
      { label: 'Генподрядчик', href: marketingPaths.solutions },
      { label: 'Девелопер и управляющая компания', href: marketingPaths.solutions },
      { label: 'ПТО и документы', href: marketingPaths.solutions },
    ],
  },
  {
    title: 'Контуры',
    links: [
      { label: 'Объекты и исполнение', href: marketingPaths.features },
      { label: 'Снабжение и материалы', href: marketingPaths.features },
      { label: 'Финансы и документы', href: marketingPaths.features },
      { label: 'Отчетность и контроль', href: marketingPaths.features },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О продукте', href: marketingPaths.about },
      { label: 'Контакты', href: marketingPaths.contact },
      { label: 'Безопасность', href: marketingPaths.security },
      { label: 'Войти в кабинет', href: '/login' },
    ],
  },
  {
    title: 'Документы',
    links: [
      { label: 'Политика конфиденциальности', href: marketingPaths.privacy },
      { label: 'Публичная оферта', href: marketingPaths.offer },
      { label: 'Политика файлов cookie', href: marketingPaths.cookies },
    ],
  },
];

const footerHighlights = [
  'Демонстрация под ваш процесс, а не по шаблонной витрине.',
  'Старт с одного рабочего контура без перегруженного внедрения.',
  'Материалы по безопасности и документам предоставляем по запросу.',
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-steel-950 text-white">
      <div className="container-custom py-16 lg:py-20">
        <div className="rounded-[2.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(251,146,60,0.08))] p-8 md:p-10 xl:p-12">
          <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-construction-200">
                Готовы показать продукт
              </div>
              <h2 className="mt-5 max-w-4xl text-[clamp(2.3rem,4.2vw,4.2rem)] font-bold leading-[1.02]">
                Разберем ваш процесс, покажем релевантный сценарий и подскажем, с чего лучше стартовать.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/72">
                Помогаем собрать публичную демонстрацию без лишнего шума: только ваш контур, роли
                команды, приоритетный этап запуска и понятный следующий шаг.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 xl:justify-end">
              <Link
                to={`${marketingPaths.home}#contact`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-steel-950 transition hover:bg-construction-100"
              >
                Запросить демо
                <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to={marketingPaths.contact}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Связаться с нами
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-12 xl:grid-cols-[1.02fr_1.18fr]">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.75rem] bg-white/10 text-construction-200">
                <BuildingOfficeIcon className="h-7 w-7" />
              </div>
              <div>
                <div className="text-2xl font-bold">{marketingCompany.brand}</div>
                <div className="text-xs uppercase tracking-[0.24em] text-white/45">
                  {marketingCompany.tagline}
                </div>
              </div>
            </div>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/70">
              ProHelper помогает строительной компании держать под контролем объекты, снабжение,
              финансы, документы и управленческую картину в одной системе.
            </p>

            <div className="mt-8 grid gap-4">
              <a
                href={marketingCompany.emailHref}
                className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10"
              >
                <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-construction-200" />
                <div>
                  <div className="text-sm font-semibold text-white">Электронная почта</div>
                  <div className="mt-1 text-sm text-white/68">{marketingCompany.email}</div>
                </div>
              </a>

              <div className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
                <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-construction-200" />
                <div>
                  <div className="text-sm font-semibold text-white">Когда отвечаем</div>
                  <div className="mt-1 text-sm text-white/68">
                    {marketingCompany.responseTime}. {marketingCompany.hours}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-construction-200" />
                <div>
                  <div className="text-sm font-semibold text-white">Формат работы</div>
                  <div className="mt-1 text-sm text-white/68">{marketingCompany.location}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {footerHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/72"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-5">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-construction-200">
                  {group.title}
                </div>
                <div className="mt-5 space-y-3">
                  {group.links.map((item) => (
                    <Link
                      key={`${group.title}-${item.href}-${item.label}`}
                      to={item.href}
                      className="block text-sm leading-7 text-white/70 transition hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <div>© {currentYear} ProHelper. Все права защищены.</div>
          <div className="flex flex-wrap gap-5">
            <Link to={marketingPaths.privacy} className="transition hover:text-white">
              Конфиденциальность
            </Link>
            <Link to={marketingPaths.offer} className="transition hover:text-white">
              Оферта
            </Link>
            <Link to={marketingPaths.cookies} className="transition hover:text-white">
              Файлы cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
