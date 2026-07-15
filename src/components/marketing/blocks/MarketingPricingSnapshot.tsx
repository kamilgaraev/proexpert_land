import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  commercialPackages,
  freeFoundationOffer,
  fullSuiteOffer,
  marketingPaths,
} from '@/data/marketingRegistry';

const formatPrice = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const MarketingPricingSnapshot = () => (
  <section id="pricing" className="border-y border-steel-100 bg-white py-16 lg:py-20">
    <div className="container-custom">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-end">
        <SectionHeader
          eyebrow="Пакеты МОСТ"
          title="Начните бесплатно. Подключайте нужные пакеты."
          description="Создайте организацию и работайте с основными возможностями без оплаты. Затем подключите отдельные пакеты или полный комплект под задачи команды."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.3rem] border border-steel-200 bg-concrete-50 px-5 py-5">
            <div className="text-2xl font-bold text-steel-950">0 ₽</div>
            <div className="mt-2 text-sm font-semibold text-steel-700">{freeFoundationOffer.name}</div>
          </div>
          <div className="rounded-[1.3rem] border border-steel-200 bg-concrete-50 px-5 py-5">
            <div className="text-2xl font-bold text-steel-950">10 бизнес-пакетов</div>
            <div className="mt-2 text-sm text-steel-600">от {formatPrice(Math.min(...commercialPackages.map((item) => item.price)))}</div>
          </div>
          <div className="rounded-[1.3rem] border border-construction-300 bg-construction-50 px-5 py-5">
            <div className="text-2xl font-bold text-steel-950">{formatPrice(fullSuiteOffer.price)}</div>
            <div className="mt-2 text-sm font-semibold text-construction-800">экономия {formatPrice(fullSuiteOffer.savings)}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.55rem] border border-steel-200 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-steel-500">Основа</div>
          <h3 className="mt-3 text-xl font-bold text-steel-950">Начните без оплаты</h3>
          <p className="mt-3 text-sm leading-7 text-steel-600">{freeFoundationOffer.description}</p>
          <Link to="/register" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-steel-950">
            Создать организацию <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </article>
        <article className="rounded-[1.55rem] border border-steel-700 bg-steel-950 p-6 text-white shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-construction-200">Конструктор</div>
          <h3 className="mt-3 text-xl font-bold">Подключите только нужные процессы</h3>
          <p className="mt-3 text-sm leading-7 text-white/70">Каждый пакет действует 30 дней. До оплаты его можно один раз попробовать бесплатно в течение 3 дней, без карты.</p>
          <Link to={`${marketingPaths.pricing}#constructor`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
            Собрать свой набор <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </article>
        <article className="rounded-[1.55rem] border border-construction-300 bg-construction-50 p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-construction-800">Полный комплект</div>
          <h3 className="mt-3 text-xl font-bold text-steel-950">Все 10 пакетов выгоднее вместе</h3>
          <p className="mt-3 text-sm leading-7 text-steel-700">{formatPrice(fullSuiteOffer.price)} за организацию на 30 дней вместо {formatPrice(fullSuiteOffer.separatePrice)}.</p>
          <Link to={`${marketingPaths.pricing}#full-suite`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-steel-950">
            Посмотреть полный комплект <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </article>
      </div>
    </div>
  </section>
);

export default MarketingPricingSnapshot;
