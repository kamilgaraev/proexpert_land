import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  marketingCompany,
  marketingNavigation,
  marketingPackages,
  marketingPaths,
} from '@/data/marketingRegistry';

const footerGroups = [
  {
    title: 'Продукт',
    links: marketingNavigation,
  },
  {
    title: 'Сценарии',
    links: [
      { label: 'Подрядчик', href: marketingPaths.solutions },
      { label: 'Генподрядчик', href: marketingPaths.solutions },
      { label: 'Группа компаний', href: marketingPaths.solutions },
      { label: 'ПТО и документы', href: marketingPaths.solutions },
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

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-steel-950 text-white">
      <div className="container-custom py-16">
        <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 md:p-10">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-construction-200">
                Запросить демонстрацию
              </div>
              <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
                Покажем ProHelper на вашем процессе и подскажем, с какого контура лучше стартовать
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/70">
                Разберем роли команды, текущую нагрузку на процессы и подготовим демонстрацию без лишних экранов и ненужной теории.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 xl:justify-end">
              <Link
                to={marketingPaths.contact}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-steel-950 transition hover:bg-construction-100"
              >
                Связаться с нами
              </Link>
              <Link
                to={marketingPaths.pricing}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Посмотреть пакеты
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-construction-200">
                <BuildingOfficeIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xl font-bold">{marketingCompany.brand}</div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                  {marketingCompany.tagline}
                </div>
              </div>
            </div>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/70">
              ProHelper помогает собрать в одной системе проект, снабжение, финансовый контур,
              документы и управленческую картину по объектам и группе компаний.
            </p>

            <div className="mt-6 space-y-3 text-sm text-white/70">
              <a href={marketingCompany.emailHref} className="flex items-center gap-3 transition hover:text-construction-200">
                <EnvelopeIcon className="h-5 w-5" />
                {marketingCompany.email}
              </a>
              <div className="flex items-center gap-3">
                <MapPinIcon className="h-5 w-5" />
                {marketingCompany.location}
              </div>
              <div>{marketingCompany.responseTime}</div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {marketingPackages.slice(0, 4).map((item) => (
                <div key={item.slug} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                  <div className="mt-2 text-sm leading-6 text-white/62">{item.bestFor}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
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
                      className="block text-sm text-white/70 transition hover:text-white"
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
