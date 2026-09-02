import { useEffect, useRef } from "react";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import ContactForm from "@/components/landing/ContactForm";
import {
  marketingFaqs,
  marketingPaths,
  marketingSeo,
} from "@/data/marketingRegistry";
import useAnalytics from "@/hooks/useAnalytics";
import { useSEO } from "@/hooks/useSEO";

const roles = [
  {
    name: "Руководителю",
    text: "Сроки и деньги по каждому объекту.",
    href: marketingPaths.constructionBudgetControl,
  },
  {
    name: "Прорабу",
    text: "Задания, фото и заявки с площадки.",
    href: marketingPaths.foremanSoftware,
  },
  {
    name: "Инженеру ПТО",
    text: "Работы и документы по проекту.",
    href: marketingPaths.ptoSoftware,
  },
  {
    name: "Снабженцу",
    text: "Потребности объектов и поставки.",
    href: marketingPaths.constructionProcurement,
  },
];

const HomePage = () => {
  const homeRef = useRef<HTMLDivElement>(null);
  useSEO({ ...marketingSeo.home, type: "website" });
  const { trackPageView } = useAnalytics();
  useEffect(() => {
    trackPageView("marketing_home");
  }, [trackPageView]);

  useEffect(() => {
    const root = homeRef.current;
    if (!root || !window.IntersectionObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-motion-entered", "");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    root
      .querySelectorAll(
        ".most-bridge-scene, .most-request-history, .most-build-story, .most-start-section",
      )
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={homeRef} className="most-home">
      <section className="most-hero" aria-labelledby="most-home-title">
        <div className="most-container most-hero-heading">
          <div>
            <h1 id="most-home-title">
              Между офисом
              <br />и стройкой — <span>МОСТ.</span>
            </h1>
            <p className="most-hero-subtitle">
              Система управления строительством
            </p>
          </div>
          <div className="most-hero-intro">
            <p>
              Задачи, материалы, документы и деньги проходят один путь — от
              решения до работы на объекте.
            </p>
            <Link to="/register" className="most-button most-button-orange">
              Начать бесплатно
            </Link>
            <a href="#workflow" className="most-text-link">
              Как это работает{" "}
              <span aria-hidden="true">
                <ArrowDownIcon className="most-icon" />
              </span>
            </a>
          </div>
        </div>
        <div className="most-bridge-scene">
          <img
            src="/images/marketing/most-bridge-v2-1774.webp"
            srcSet="/images/marketing/most-bridge-v2-640.webp 640w, /images/marketing/most-bridge-v2-1024.webp 1024w, /images/marketing/most-bridge-v2-1774.webp 1774w"
            sizes="100vw"
            width={1774}
            height={887}
            alt="Мост с опорами в форме буквы М соединяет строительную площадку и офис"
            loading="eager"
            fetchPriority="high"
          />
          <ol className="most-bridge-path" aria-label="От заявки до работы">
            <li>Заявка</li>
            <li>Решение</li>
            <li>Работа</li>
          </ol>
          <div className="most-bridge-places" aria-hidden="true">
            <span>Площадка</span>
            <span>Офис</span>
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="most-product-section"
        aria-labelledby="most-product-title"
      >
        <div id="product" className="most-container">
          <div className="most-section-heading">
            <h2 id="most-product-title">
              Одна заявка.
              <br />
              Общая работа.
            </h2>
            <div>
              <p>
                На площадке понадобился материал. Прораб передаёт потребность,
                снабженец организует поставку, склад принимает её для объекта. В
                МОСТ у этой работы есть заявка, ответственные и данные по
                объекту.
              </p>
              <Link to={marketingPaths.features} className="most-text-link">
                Все возможности МОСТ{" "}
                <span aria-hidden="true">
                  <ArrowUpRightIcon className="most-icon" />
                </span>
              </Link>
            </div>
          </div>
          <figure className="most-request-example most-object-story">
            <figcaption>
              <span>Пример: строительство жилого дома</span>
              <strong>От потребности до поставки</strong>
            </figcaption>
            <div className="most-request-example-body">
              <div className="most-story-visual">
                <img
                  src="/images/marketing/most-material-story-1440.webp"
                  srcSet="/images/marketing/most-material-story-720.webp 720w, /images/marketing/most-material-story-1440.webp 1440w"
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1600px) 60vw, 920px"
                  width={1672}
                  height={941}
                  alt="Арматура на площадке и фундамент, для которого она нужна"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <dl className="most-request-facts">
                <div>
                  <dt>Объект</dt>
                  <dd>Строительство жилого дома</dd>
                </div>
                <div>
                  <dt>Материал</dt>
                  <dd>Арматура А500С, 12 мм</dd>
                </div>
                <div>
                  <dt>Количество</dt>
                  <dd>8 тонн</dd>
                </div>
                <div>
                  <dt>Для каких работ</dt>
                  <dd>Армирование фундамента</dd>
                </div>
              </dl>
            </div>
            <ol className="most-request-history">
              <li>
                <span className="most-request-person">Площадка · Прораб</span>
                <h3>Нужно для работы</h3>
                <p>
                  В заявке — материал, количество и срок. Офис понимает, что
                  требуется объекту, без пересказа в другом чате.
                </p>
              </li>
              <li>
                <span className="most-request-person">Офис · Снабженец</span>
                <h3>Есть решение</h3>
                <p>
                  Снабженец работает с потребностью объекта: организует закупку
                  и фиксирует договорённости о поставке.
                </p>
              </li>
              <li>
                <span className="most-request-person">Объект · Склад</span>
                <h3>Материал поступил</h3>
                <p>
                  Поступление и остаток отражены в учёте. Материал остаётся
                  связан с объектом, для которого его заказали.
                </p>
              </li>
            </ol>
          </figure>
          <div className="most-product-links">
            <Link to={marketingPaths.materialAccounting}>
              Материалы и склад{" "}
              <span aria-hidden="true">
                <ArrowUpRightIcon className="most-icon" />
              </span>
            </Link>
            <Link to={marketingPaths.constructionBudgetControl}>
              Бюджет и платежи{" "}
              <span aria-hidden="true">
                <ArrowUpRightIcon className="most-icon" />
              </span>
            </Link>
            <Link to={marketingPaths.ptoSoftware}>
              Работы и документы{" "}
              <span aria-hidden="true">
                <ArrowUpRightIcon className="most-icon" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <div className="most-container most-build-story">
        <div className="most-build-visuals">
          <figure className="most-story-visual most-build-frame">
            <img
              src="/images/marketing/most-frame-story-1440.webp"
              srcSet="/images/marketing/most-frame-story-720.webp 720w, /images/marketing/most-frame-story-1440.webp 1440w"
              sizes="(max-width: 1079px) calc(100vw - 40px), 52vw"
              width={1672}
              height={941}
              alt="Тот же объект на следующем этапе: над фундаментом вырос каркас здания"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <figure className="most-story-visual most-build-complete">
            <img
              src="/images/marketing/most-completed-story-1440.webp"
              srcSet="/images/marketing/most-completed-story-720.webp 720w, /images/marketing/most-completed-story-1440.webp 1440w"
              sizes="(max-width: 1079px) calc(100vw - 40px), 52vw"
              width={1672}
              height={941}
              alt="Тот же объект после завершения строительства: готовое здание на месте фундамента"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="most-build-route" aria-hidden="true">
            <span>Работы на объекте</span>
            <span>Документы по проекту</span>
          </div>
        </div>
        <div className="most-build-chapters">
          <section
            className="most-build-roles"
            aria-labelledby="most-roles-title"
          >
            <h2 id="most-roles-title">
              Свой участок работы.
              <br />
              Один общий объект.
            </h2>
            <p>
              Материалы поступили — стройка продолжается. Прораб ведёт задачи,
              ПТО — документы, руководитель — сроки и деньги. В МОСТ эта работа
              связана с одним объектом.
            </p>
            <div className="most-role-list">
              {roles.map((role) => (
                <Link key={role.name} to={role.href}>
                  <div>
                    <h3>{role.name}</h3>
                    <p>{role.text}</p>
                  </div>
                  <span aria-hidden="true">
                    <ArrowUpRightIcon className="most-icon" />
                  </span>
                </Link>
              ))}
            </div>
            <Link to={marketingPaths.solutions} className="most-text-link">
              Решение для вашей компании{" "}
              <span aria-hidden="true">
                <ArrowUpRightIcon className="most-icon" />
              </span>
            </Link>
          </section>
          <section
            className="most-build-finish"
            aria-labelledby="most-completion-title"
          >
            <h2 id="most-completion-title">
              Работы завершены.
              <br />
              Документы под рукой.
            </h2>
            <p>
              Когда приходит время сдавать объект, команде нужны чертежи,
              замечания, акты и расчёты. В МОСТ они остаются связаны с проектом
              — к документам и истории работ можно вернуться и после завершения
              строительства.
            </p>
            <Link to={marketingPaths.ptoSoftware} className="most-text-link">
              От работ к документам{" "}
              <span aria-hidden="true">
                <ArrowUpRightIcon className="most-icon" />
              </span>
            </Link>
          </section>
        </div>
      </div>

      <section
        className="most-start-section"
        aria-labelledby="most-start-title"
      >
        <div className="most-container most-start-layout">
          <div>
            <h2 id="most-start-title">Начните с одного объекта.</h2>
            <p>
              Создайте организацию, пригласите команду и заведите первый проект.
              Подключайте платные возможности по мере необходимости.
            </p>
            <div className="most-inline-actions">
              <Link to="/register" className="most-button most-button-orange">
                Начать бесплатно{" "}
                <span aria-hidden="true">
                  <ArrowUpRightIcon className="most-icon" />
                </span>
              </Link>
              <Link to={marketingPaths.pricing} className="most-text-link">
                Состав и стоимость пакетов{" "}
                <span aria-hidden="true">
                  <ArrowRightIcon className="most-icon" />
                </span>
              </Link>
            </div>
          </div>
          <div className="most-free-price">
            <strong>
              0 <span>₽</span>
            </strong>
            <p>
              Организация, команда
              <br />и первые проекты
            </p>
          </div>
        </div>
      </section>

      <section
        className="most-section most-container most-faq"
        aria-labelledby="most-faq-title"
      >
        <h2 id="most-faq-title">До начала работы</h2>
        <div>
          {marketingFaqs.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <span aria-hidden="true">
                  <PlusIcon className="most-icon" />
                </span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="most-contact-section"
        aria-labelledby="most-contact-title"
      >
        <div className="most-container most-contact-layout">
          <div>
            <h2 id="most-contact-title">
              Покажем МОСТ
              <br />
              на вашей задаче.
            </h2>
            <p>
              Расскажите, как устроена работа вашей компании и что хотите
              изменить. Разберём нужные разделы, доступ сотрудников и первые
              шаги.
            </p>
            <a
              className="most-contact-email"
              href="mailto:info@xn--1-xtbgmf.xn--p1ai"
            >
              info@1мост.рф{" "}
              <span aria-hidden="true">
                <ArrowUpRightIcon className="most-icon" />
              </span>
            </a>
          </div>
          <ContactForm variant="compact" className="most-contact-form" />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
