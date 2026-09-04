import { Link } from "react-router-dom";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { marketingPaths, marketingSeo } from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";
import "@/styles/marketing-company.css";

const AboutPage = () => {
  useSEO({ ...marketingSeo.about, type: "website" });

  return (
    <div className="most-company-page">
      <section
        className="most-container most-company-heading"
        aria-labelledby="about-title"
      >
        <h1 id="about-title">У стройки и офиса одна работа.</h1>
        <div>
          <p className="most-company-lead">
            Но видят её по-разному. На площадке нужны материалы и понятные
            задания. В офисе — основания для закупки, сроки и документы. МОСТ
            создан, чтобы связать эти стороны через данные конкретного объекта.
          </p>
          <Link className="most-text-link" to={marketingPaths.features}>
            Как работает МОСТ{" "}
            <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <figure className="most-about-bridge">
        <img
          src="/images/marketing/most-bridge-v2-1774.webp"
          srcSet="/images/marketing/most-bridge-v2-640.webp 640w, /images/marketing/most-bridge-v2-1024.webp 1024w, /images/marketing/most-bridge-v2-1774.webp 1774w"
          sizes="100vw"
          width="1774"
          height="887"
          alt="Мост с опорами в форме буквы М соединяет строительную площадку и офис"
        />
      </figure>
      <section
        id="approach"
        className="most-container most-company-section most-company-split"
      >
        <h2>Название — это принцип работы.</h2>
        <div className="most-company-prose">
          <p>
            Заявка с площадки нужна снабженцу. Сметная позиция — инженеру,
            который проверяет объём. Выполненная работа — сотруднику, который
            готовит акт. У каждой записи есть продолжение.
          </p>
          <p>
            МОСТ связывает эти записи с объектом, ответственными и текущим
            состоянием работы. Так команда может вернуться к исходной
            потребности и понять, на чём основано решение.
          </p>
        </div>
      </section>
      <section id="principles" className="most-container most-company-section">
        <h2>Что сохраняем в каждом разделе</h2>
        <div className="most-company-principles">
          <article>
            <h3>Контекст объекта</h3>
            <p>
              Материал, задача, документ или платёж относятся к работе
              конкретной команды на конкретном объекте.
            </p>
          </article>
          <article>
            <h3>Ответственность человека</h3>
            <p>
              Данные помогают проверить ситуацию. Решение о работах, деньгах и
              приёмке принимают уполномоченные сотрудники.
            </p>
          </article>
          <article>
            <h3>Понятный доступ</h3>
            <p>
              Роль сотрудника определяет, с какими объектами и документами он
              работает и какие действия выполняет.
            </p>
          </article>
        </div>
      </section>
      <section
        id="trust"
        className="most-container most-company-section most-company-split"
      >
        <h2>Начнём с вашей работы.</h2>
        <div className="most-company-prose">
          <p>
            Разберём один процесс: например, заявку на материалы или подготовку
            комплекта документов. Покажем нужные разделы, определим участников и
            обсудим данные для начала работы.
          </p>
          <div className="most-company-actions">
            <Link
              className="most-button most-button-orange"
              to={marketingPaths.contact}
            >
              Обсудить задачу{" "}
              <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
            </Link>
            <Link className="most-text-link" to={marketingPaths.security}>
              Доступ к данным{" "}
              <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
