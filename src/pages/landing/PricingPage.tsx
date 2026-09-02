import { useEffect, useState } from "react";
import ContactForm from "@/components/landing/ContactForm";
import {
  MarketingLink,
  PageHero,
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
    <div
      className={`marketing-page-shell ${selection.selectedPackages.length > 0 ? "has-package-selection" : ""}`}
    >
      <PageHero
        eyebrow="Тарифы"
        title="Начните бесплатно. Платите за нужные задачи."
        description="Создайте организацию и пригласите команду. Для управления работами, снабжением и финансами выберите подходящие пакеты. Все цены — за одну организацию и 30 дней."
        actions={[
          { label: "Создать организацию", href: "/register", primary: true },
          { label: "Рассчитать стоимость", href: "#constructor" },
        ]}
        nav={[
          { label: "Бесплатная основа", href: "#foundation" },
          { label: "Пакеты", href: "#constructor" },
          { label: "Полный комплект", href: "#full-suite" },
          { label: "Условия", href: "#terms" },
          { label: "Для группы компаний", href: "#corporate" },
        ]}
      />

      <section
        id="foundation"
        className="most-content-section most-content-tint"
      >
        <div className="most-container most-pricing-foundation">
          <div>
            <h2>Бесплатная основа МОСТ</h2>
            <p>{freeFoundationOffer.description}</p>
          </div>
          <div className="most-pricing-foundation-price">
            <strong>{formatPrice(freeFoundationOffer.price)}</strong>
            <span>без ограничения пробным периодом</span>
          </div>
          <ul>
            {freeFoundationOffer.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="constructor" className="most-content-section">
        <div className="most-container">
          <div className="most-content-lead">
            <h2>Какие задачи будете вести в МОСТ?</h2>
            <p>
              Отметьте пакеты — стоимость посчитается рядом. Каждый пакет можно
              один раз попробовать бесплатно: {commercialTerms.trialHours / 24}{" "}
              дня для одной организации, без банковской карты.
            </p>
          </div>
          <div className="most-package-constructor">
            <fieldset className="most-package-options">
              <legend className="sr-only">Выбор бизнес-пакетов</legend>
              {commercialPackages.map((item) => (
                <label
                  key={item.slug}
                  className={`most-package-option ${selectedPackageSlugs.has(item.slug) ? "is-selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPackageSlugs.has(item.slug)}
                    onChange={() => togglePackage(item.slug)}
                    aria-label={item.name}
                  />
                  <span className="most-package-copy">
                    <strong>{item.name}</strong>
                    <span>{item.description}</span>
                    <span className="most-package-includes">
                      {item.highlights.join(" · ")}
                    </span>
                  </span>
                  <span className="most-package-price">
                    <strong>{formatPrice(item.price)}</strong>
                    <span>за 30 дней</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <aside
              id="package-summary"
              className="most-package-summary"
              aria-labelledby="selection-title"
            >
              <h3 id="selection-title">Ваш набор</h3>
              <div
                className="most-package-total"
                aria-live="polite"
                aria-atomic="true"
              >
                <span>
                  Выбрано пакетов: {selection.selectedPackages.length} из{" "}
                  {commercialPackages.length}
                </span>
                <strong>{formatPrice(selection.total)}</strong>
                <span>за организацию / 30 дней</span>
              </div>
              {selection.selectedPackages.length > 0 ? (
                <ul className="most-package-selected">
                  {selection.selectedPackages.map((item) => (
                    <li key={item.slug}>
                      <span>{item.name}</span>
                      <span>{formatPrice(item.price)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  Бесплатная основа уже доступна. Дополнительные пакеты можно
                  выбрать сейчас или позже.
                </p>
              )}
              {selection.recommendFullSuite ? (
                <div className="most-package-recommendation" role="status">
                  <strong>Сравните с полным комплектом</strong>
                  <p>
                    Все {commercialPackages.length} пакетов стоят{" "}
                    {formatPrice(fullSuiteOffer.price)} за 30 дней. Ваш выбор
                    сохранён.
                  </p>
                  <MarketingLink href="#full-suite" className="most-text-link">
                    Посмотреть условия <span aria-hidden="true">↓</span>
                  </MarketingLink>
                </div>
              ) : null}
              <MarketingLink
                href={registrationHref}
                className="most-button most-button-orange"
              >
                {selection.selectedPackages.length > 0
                  ? "Продолжить с этим набором"
                  : "Создать организацию"}
              </MarketingLink>
              <p className="most-package-note">
                Подключение и оплата — в личном кабинете после регистрации.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {selection.selectedPackages.length > 0 ? (
        <div className="most-package-mobile-summary">
          <span>
            <strong>{formatPrice(selection.total)}</strong> / 30 дней
          </span>
          <MarketingLink href="#package-summary" className="most-text-link">
            К набору ({selection.selectedPackages.length}){" "}
            <span aria-hidden="true">↓</span>
          </MarketingLink>
        </div>
      ) : null}

      <section id="full-suite" className="most-page-closing">
        <div className="most-container">
          <div className="most-cta-panel is-dark most-full-suite">
            <div>
              <h2>Все {commercialPackages.length} пакетов. Одна стоимость.</h2>
              <p>
                По отдельности — {formatPrice(fullSuiteOffer.separatePrice)}.
                Полный комплект экономит {formatPrice(fullSuiteOffer.savings)}{" "}
                за каждый 30-дневный период.
              </p>
            </div>
            <div className="most-full-suite-price">
              <strong>{formatPrice(fullSuiteOffer.price)}</strong>
              <span>за организацию / 30 дней</span>
              <MarketingLink
                href="/register?packages=full-suite"
                className="most-button most-button-orange"
              >
                Выбрать полный комплект
              </MarketingLink>
            </div>
          </div>
        </div>
      </section>

      <section id="terms" className="most-content-section most-content-tint">
        <div className="most-container most-capabilities-layout">
          <div className="most-content-lead">
            <h2>Перед подключением</h2>
            <p>Как попробовать пакеты, оплатить доступ и продлить его.</p>
          </div>
          <div className="most-capability-details">
            <details open>
              <summary>Что входит в пробный период?</summary>
              <p>
                Каждый пакет можно один раз бесплатно попробовать в течение{" "}
                {commercialTerms.trialHours / 24} дней для одной организации.
                Банковская карта не нужна.
              </p>
            </details>
            <details>
              <summary>На какой срок подключается пакет?</summary>
              <p>
                Оплата рассчитана на 30 дней. Дата следующего периода
                фиксируется при подключении. Выбранные пакеты оплачиваются в
                личном кабинете.
              </p>
            </details>
            <details>
              <summary>Что произойдёт, если задержать оплату?</summary>
              <p>
                На продление предусмотрено {commercialTerms.graceDays} дней.
                Поздний платёж сохраняет прежнюю расчётную дату: новый период не
                отсчитывается от дня оплаты.
              </p>
            </details>
            <details>
              <summary>Полный комплект подключится автоматически?</summary>
              <p>
                Нет. Даже если вы выбрали много отдельных пакетов, состав набора
                остаётся прежним. Полный комплект нужно выбрать самостоятельно.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section id="corporate" className="most-content-section">
        <div className="most-container most-content-columns">
          <div>
            <h2>Несколько организаций или особые требования?</h2>
            <p>
              Для группы компаний отдельно обсудим структуру доступа, сводную
              отчётность, перенос данных и обучение сотрудников.
            </p>
          </div>
          <div>
            <h3>Условия под вашу структуру</h3>
            <p>
              Согласуем необходимые интеграции, требования к входу в систему и
              поддержке. Состав работ и стоимость определяются до подключения;
              они не включены автоматически в цену полного комплекта.
            </p>
            <MarketingLink href="#contact" className="most-text-link">
              Обсудить условия <span aria-hidden="true">↓</span>
            </MarketingLink>
          </div>
        </div>
      </section>

      <section id="contact" className="most-content-section most-content-tint">
        <div className="most-container most-content-columns">
          <div>
            <h2>Поможем выбрать пакеты.</h2>
            <p>
              Расскажите, какие задачи хотите вести в МОСТ и сколько организаций
              участвует в работе. Разберём состав пакетов на демонстрации.
            </p>
          </div>
          <ContactForm variant="compact" className="most-contact-form" />
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
