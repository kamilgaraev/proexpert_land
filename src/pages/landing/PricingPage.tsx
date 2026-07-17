import { useEffect, useState } from "react";
import ContactForm from "@/components/landing/ContactForm";
import {
  MarketingLink,
  PageHero,
  SectionHeader,
} from "@/components/marketing/MarketingPrimitives";
import {
  commercialPackages,
  commercialTerms,
  freeFoundationOffer,
  fullSuiteOffer,
  getCommercialSelection,
  marketingSeo,
} from "@/data/marketingRegistry";
import useAnalytics from "@/hooks/useAnalytics";
import { useSEO } from "@/hooks/useSEO";
import { serializeCommercialIntent } from "@/utils/commercialIntent";

const formatPrice = (value: number) => `${value.toLocaleString("ru-RU")} ₽`;

const corporateOptions = [
  "Несколько организаций",
  "Сводная отчетность",
  "Единый вход (SSO) и аудит действий",
  "Интеграции с 1С, системами управления ресурсами (ERP) и аналитикой (BI)",
  "Интеграционный доступ и события",
  "Сервисные условия (SLA) и выделенный менеджер",
  "Миграция данных и обучение",
];

const PricingPage = () => {
  const [selectedPackageSlugs, setSelectedPackageSlugs] = useState<Set<string>>(
    new Set(),
  );

  useSEO({ ...marketingSeo.pricing, type: "website" });
  const { trackPageView, trackPricingView } = useAnalytics();

  useEffect(() => {
    trackPageView("marketing_commercial_packages");
    trackPricingView("package_constructor");
  }, [trackPageView, trackPricingView]);

  const selection = getCommercialSelection(Array.from(selectedPackageSlugs));
  const intent = serializeCommercialIntent(selection.selectedSlugs);
  const registrationHref = intent
    ? `/register?packages=${intent}`
    : "/register";

  const togglePackage = (slug: string) => {
    setSelectedPackageSlugs((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  return (
    <div className="marketing-page-shell overflow-hidden">
      <PageHero
        eyebrow="Пакеты МОСТ"
        title="Цены, состав пакетов и правила подключения."
        description="Основные возможности доступны без оплаты. Каждый бизнес-пакет подключается на 30 дней, перед оплатой его можно один раз попробовать бесплатно в течение 3 дней без карты."
        actions={[
          { label: "Создать организацию", href: "/register", primary: true },
          { label: "Собрать набор", href: "#constructor" },
        ]}
        nav={[
          { label: "Начните бесплатно", href: "#foundation" },
          { label: "Конструктор", href: "#constructor" },
          { label: "Полный комплект", href: "#full-suite" },
          { label: "Условия", href: "#terms" },
          { label: "Корпоративный уровень", href: "#corporate" },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-700 bg-steel-950 p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.2)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
              Варианты подключения
            </div>
            <div className="mt-5 grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-4 text-sm">
              <span className="font-mono text-construction-200">00</span>
              <span>Начните бесплатно</span>
              <strong>0 ₽</strong>
              <span className="font-mono text-construction-200">01–10</span>
              <span>Бизнес-пакеты</span>
              <strong>7 900–12 900 ₽</strong>
              <span className="font-mono text-construction-200">Σ</span>
              <span>Полный комплект</span>
              <strong>79 900 ₽</strong>
            </div>
            <div className="mt-6 border-t border-white/10 pt-5 text-sm leading-7 text-white/68">
              Все цены указаны за одну организацию и 30 дней.
            </div>
          </div>
        }
      />

      <section
        id="foundation"
        className="border-y border-steel-100 bg-white py-16 lg:py-20"
      >
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-center">
          <SectionHeader
            eyebrow="Начните бесплатно"
            title="Основные возможности МОСТ — без оплаты."
            description={freeFoundationOffer.description}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {freeFoundationOffer.includes.map((item, index) => (
              <div
                key={item}
                className="rounded-[1.35rem] border border-steel-200 bg-concrete-50 p-5"
              >
                <div className="font-mono text-xs font-bold text-construction-700">
                  0{index + 1}
                </div>
                <div className="mt-3 text-sm font-semibold leading-6 text-steel-800">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="constructor"
        className="bg-steel-950 py-16 text-white lg:py-20"
      >
        <div className="container-custom">
          <SectionHeader
            eyebrow="Конструктор"
            title="Отметьте процессы, которые нужны вашей команде."
            description="Отметьте интересующие пакеты и продолжите регистрацию. Подключить и оплатить их можно будет в личном кабинете."
            tone="dark"
          />

          <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="sr-only">Выбор бизнес-пакетов</legend>
              {commercialPackages.map((item) => {
                const selected = selectedPackageSlugs.has(item.slug);
                return (
                  <label
                    key={item.slug}
                    className={`group relative cursor-pointer rounded-[1.45rem] border p-5 transition motion-reduce:transform-none ${
                      selected
                        ? "border-construction-300 bg-white text-steel-950 shadow-[0_18px_50px_rgba(0,0,0,0.2)]"
                        : "border-white/15 bg-white/5 text-white hover:border-white/35 hover:bg-white/8"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => togglePackage(item.slug)}
                      className="absolute right-5 top-5 h-5 w-5 rounded border-white/40 accent-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-construction-300"
                    />
                    <div
                      className={`font-mono text-xs font-bold ${selected ? "text-construction-700" : "text-construction-200"}`}
                    >
                      {String(item.number).padStart(2, "0")}
                    </div>
                    <h2 className="mt-3 pr-10 text-xl font-bold">
                      {item.name}
                    </h2>
                    <p
                      className={`mt-3 text-sm leading-7 ${selected ? "text-steel-600" : "text-white/68"}`}
                    >
                      {item.description}
                    </p>
                    <div className="mt-5 flex items-end justify-between gap-4 border-t border-current/10 pt-4">
                      <span className="text-xs opacity-70">за 30 дней</span>
                      <strong className="text-lg">
                        {formatPrice(item.price)}
                      </strong>
                    </div>
                  </label>
                );
              })}
            </fieldset>

            <aside className="rounded-[1.65rem] border border-white/15 bg-white p-6 text-steel-950 shadow-xl xl:sticky xl:top-32">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                Ваш набор
              </div>
              <div
                className="mt-4 flex items-end justify-between gap-4 border-b border-steel-100 pb-5"
                aria-live="polite"
              >
                <div>
                  <div className="text-sm text-steel-500">Выбрано пакетов</div>
                  <div className="mt-1 text-3xl font-bold">
                    {selection.selectedPackages.length} из 10
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-steel-500">За 30 дней</div>
                  <div className="mt-1 text-2xl font-bold">
                    {formatPrice(selection.total)}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-2">
                {selection.selectedPackages.length > 0 ? (
                  selection.selectedPackages.map((item) => (
                    <div
                      key={item.slug}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="text-steel-600">{item.name}</span>
                      <span className="font-semibold">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-steel-600">
                    Пока вы начинаете с возможностей МОСТ без оплаты.
                  </p>
                )}
              </div>

              {selection.recommendFullSuite ? (
                <div
                  className="mt-5 rounded-[1.15rem] border border-construction-200 bg-construction-50 p-4"
                  role="status"
                >
                  <div className="font-semibold text-steel-950">
                    Полный комплект выгоднее
                  </div>
                  <p className="mt-2 text-sm leading-6 text-steel-600">
                    При восьми и более пакетах рекомендуем сравнить набор с
                    полным комплектом. Выбор не меняется автоматически.
                  </p>
                  <MarketingLink
                    href="#full-suite"
                    className="mt-3 inline-flex text-sm font-semibold text-construction-800"
                  >
                    Сравнить варианты
                  </MarketingLink>
                </div>
              ) : null}

              <MarketingLink
                href={registrationHref}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-construction-400 px-5 py-3 text-center text-sm font-semibold text-steel-950 transition hover:bg-construction-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-construction-500"
              >
                {selection.selectedPackages.length > 0
                  ? "Продолжить с выбранным набором"
                  : "Создать организацию"}
              </MarketingLink>
            </aside>
          </div>
        </div>
      </section>

      <section id="full-suite" className="py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid gap-8 rounded-[2rem] border border-construction-300 bg-construction-50 p-6 shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)] lg:p-9">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-800">
                Полный комплект
              </div>
              <h2 className="mt-4 text-[clamp(2rem,4vw,3.6rem)] font-bold leading-[1.02] text-steel-950">
                Все десять пакетов за {formatPrice(fullSuiteOffer.price)}.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-steel-700">
                По отдельности пакеты стоят{" "}
                {formatPrice(fullSuiteOffer.separatePrice)}. Полный комплект
                стоит на {formatPrice(fullSuiteOffer.savings)} меньше за каждый
                30-дневный период.
              </p>
            </div>
            <div className="flex flex-col justify-between rounded-[1.5rem] bg-steel-950 p-6 text-white">
              <div>
                <div className="text-sm text-white/60">Экономия за период</div>
                <div className="mt-2 text-4xl font-bold text-construction-200">
                  {formatPrice(fullSuiteOffer.savings)}
                </div>
                <p className="mt-4 text-sm leading-7 text-white/68">
                  Полный комплект выбирается только явно и не включается
                  автоматически.
                </p>
              </div>
              <MarketingLink
                href="/register?packages=full-suite"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-steel-950"
              >
                Продолжить с полным комплектом
              </MarketingLink>
            </div>
          </div>
        </div>
      </section>

      <section
        id="terms"
        className="border-y border-steel-100 bg-concrete-50 py-16 lg:py-20"
      >
        <div className="container-custom">
          <SectionHeader
            eyebrow="Условия подключения"
            title="Пробный период, оплата и продление."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <article className="rounded-[1.55rem] border border-steel-200 bg-white p-6">
              <div className="font-mono text-xs font-bold text-construction-700">
                3 дня
              </div>
              <h2 className="mt-3 text-xl font-bold text-steel-950">
                Пробный период без карты
              </h2>
              <p className="mt-3 text-sm leading-7 text-steel-600">
                Каждый пакет можно один раз бесплатно попробовать в течение 3
                дней для одной организации.
              </p>
            </article>
            <article className="rounded-[1.55rem] border border-steel-200 bg-white p-6">
              <div className="font-mono text-xs font-bold text-construction-700">
                30D
              </div>
              <h2 className="mt-3 text-xl font-bold text-steel-950">
                Фиксированный период
              </h2>
              <p className="mt-3 text-sm leading-7 text-steel-600">
                Пакеты оплачиваются на 30 дней. Дата следующего периода остается
                зафиксированной.
              </p>
            </article>
            <article className="rounded-[1.55rem] border border-steel-200 bg-white p-6">
              <div className="font-mono text-xs font-bold text-construction-700">
                {commercialTerms.graceDays}D
              </div>
              <h2 className="mt-3 text-xl font-bold text-steel-950">
                Семь дней на продление
              </h2>
              <p className="mt-3 text-sm leading-7 text-steel-600">
                При задержке оплаты доступ можно восстановить до прежней
                расчетной даты. Поздний платеж не создает новый 30-дневный
                период.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="corporate" className="bg-white py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <SectionHeader
              eyebrow="Корпоративный уровень"
              title="Полный комплект для нескольких организаций."
              description="Корпоративные условия дополняют полный комплект настройками для структуры компании, сводных данных и согласованных интеграций."
            />
            <MarketingLink
              href="#contact"
              className="mt-7 inline-flex rounded-full bg-steel-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Обсудить корпоративные условия
            </MarketingLink>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {corporateOptions.map((item, index) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-steel-200 bg-concrete-50 p-5"
              >
                <span className="font-mono text-xs font-bold text-construction-700">
                  C{String(index + 1).padStart(2, "0")}
                </span>
                <div className="mt-3 text-sm font-semibold leading-6 text-steel-800">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.92fr)] xl:items-start">
          <SectionHeader
            eyebrow="Контакт"
            title="Обсудим набор пакетов и корпоративные условия."
            description="Укажите процессы и структуру компании. На демонстрации сравним подходящие пакеты и отдельно обсудим корпоративные условия."
          />
          <ContactForm variant="compact" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
