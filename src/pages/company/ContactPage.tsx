import { Link } from "react-router-dom";
import { ArrowUpRightIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import ContactForm from "@/components/landing/ContactForm";
import {
  marketingCompany,
  marketingPaths,
  marketingSeo,
} from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";
import "@/styles/marketing-company.css";

const ContactPage = () => {
  useSEO({ ...marketingSeo.contact, type: "website" });

  return (
    <div className="most-company-page">
      <section
        className="most-container most-contact-layout"
        aria-labelledby="contact-title"
      >
        <div className="most-contact-intro">
          <h1 id="contact-title">Обсудим вашу задачу.</h1>
          <p className="most-company-lead">
            Расскажите, что сейчас сложнее всего связать между офисом и
            стройкой. Покажем, как с этой задачей можно работать в МОСТ.
          </p>
          <a className="most-contact-email" href={marketingCompany.emailHref}>
            <EnvelopeIcon className="most-icon" aria-hidden="true" />
            {marketingCompany.email}
          </a>
        </div>
        <div id="contact-form" className="most-company-form most-contact-form">
          <ContactForm variant="full" />
        </div>
        <div className="most-contact-followup">
          <div className="most-contact-next" id="next-step">
            <h2>Что будет дальше</h2>
            <ol>
              <li>Прочитаем заявку и уточним детали, если они понадобятся.</li>
              <li>
                Разберём ваш рабочий процесс: кто передаёт данные, кто принимает
                решение и кто выполняет работу.
              </li>
              <li>Покажем подходящие разделы и обсудим следующий шаг.</li>
            </ol>
          </div>
          <p className="most-contact-note">
            Если вопрос касается доступа сотрудников или документов компании,
            напишите об этом в сообщении.
          </p>
          <Link className="most-text-link" to={marketingPaths.security}>
            Как устроен доступ к данным
            <ArrowUpRightIcon className="most-icon" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
