import { Link } from "react-router-dom";
import {
  ArrowUpRightIcon,
  BuildingOffice2Icon,
  FolderIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  marketingPaths,
  marketingSecuritySections,
  marketingSeo,
} from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";
import "@/styles/marketing-company.css";

const SecurityPage = () => {
  useSEO({ ...marketingSeo.security, type: "website" });

  return (
    <div className="most-company-page">
      <section
        className="most-container most-company-heading"
        aria-labelledby="security-title"
      >
        <h1 id="security-title">Общая работа. Доступ по обязанностям.</h1>
        <div>
          <p className="most-company-lead">
            Офис и площадка работают с данными объекта. При этом сотрудник
            получает доступ к тем организациям, документам и действиям, которые
            разрешены его ролью.
          </p>
          <Link className="most-text-link" to={marketingPaths.contact}>
            Обсудить доступ команды{" "}
            <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section id="roles" className="most-container most-company-section">
        <h2>У каждого действия есть границы.</h2>
        <ol className="most-access-path">
          <li>
            <BuildingOffice2Icon className="most-icon" aria-hidden="true" />
            <h3>Организация</h3>
            <p>К каким данным компании относится запрос.</p>
          </li>
          <li>
            <FolderIcon className="most-icon" aria-hidden="true" />
            <h3>Объект</h3>
            <p>Разрешено ли сотруднику работать с этим проектом.</p>
          </li>
          <li>
            <UserIcon className="most-icon" aria-hidden="true" />
            <h3>Роль и действие</h3>
            <p>
              Может ли сотрудник просмотреть запись, изменить её или согласовать
              документ.
            </p>
          </li>
        </ol>
      </section>
      <section id="principles" className="most-container most-company-section">
        <h2>Как устроена работа с данными</h2>
        <div className="most-security-sections">
          {marketingSecuritySections.map((section) => (
            <article className="most-company-split" key={section.title}>
              <div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section
        id="trust"
        className="most-container most-company-section most-company-split"
      >
        <h2>Проверим на примере вашей команды.</h2>
        <div className="most-company-prose">
          <p>
            На демонстрации разберём роли сотрудников, доступ к объектам, файлам
            и истории действий. Требования к обмену данными и условиям
            сопровождения обсудим отдельно.
          </p>
          <div className="most-company-actions">
            <Link
              className="most-button most-button-orange"
              to={marketingPaths.contact}
            >
              Задать вопрос{" "}
              <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
            </Link>
            <Link className="most-text-link" to={marketingPaths.privacy}>
              Политика конфиденциальности{" "}
              <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
            </Link>
            <Link className="most-text-link" to={marketingPaths.offer}>
              Публичная оферта{" "}
              <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;
