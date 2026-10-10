import { MarketingLink } from "./MarketingPrimitives";
import "@/styles/marketing-journal.css";

const journalImagePath = "/images/marketing/journal";

export const JournalHero = () => (
  <figure className="most-journal-hero">
    <div className="most-journal-image-frame">
      <span className="most-journal-image-label">МОСТ / Журнал работ</span>
      <div className="most-journal-image-viewport is-daily">
        <img
          src={`${journalImagePath}/daily-entry.jpg`}
          width={2584}
          height={1121}
          alt="Реальная форма записи в МОСТ: дата, описание работ, смета и выполненный объём"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </div>
    <figcaption>Реальный интерфейс МОСТ · учебный пример</figcaption>
  </figure>
);

const JournalShowcase = () => (
  <section
    id="journal-interface"
    className="most-scenario-section most-journal-showcase"
  >
    <div className="most-container">
      <div className="most-journal-section-intro">
        <p className="most-journal-eyebrow">
          От рабочего дня — к записи в журнале
        </p>
        <h2>Посмотрите, как это устроено</h2>
        <p>
          Дата, выполненные работы и ресурсы собраны в одной записи. Прораб
          готовит её, а ответственный проверяет и принимает результат.
        </p>
      </div>
      <div className="most-journal-screen-layout">
        <div className="most-journal-screen-copy">
          <span className="most-journal-screen-number" aria-hidden="true">
            01
          </span>
          <h3>Зафиксируйте работы за день</h3>
          <p>
            Выберите дату и смету, опишите участок работ и укажите выполненный
            объём по нужной позиции. Сохраните черновик или отправьте запись на
            проверку.
          </p>
          <ul className="most-scenario-lines">
            <li>Описание — что сделано и на каком участке.</li>
            <li>Объём — сколько выполнено и в каких единицах.</li>
            <li>Смета — к какой позиции относится работа.</li>
          </ul>
          <a
            className="most-text-link"
            href={`${journalImagePath}/daily-entry.jpg`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Открыть скриншот крупнее <span aria-hidden="true">↗</span>
          </a>
        </div>
        <figure className="most-journal-screen">
          <div className="most-journal-image-frame">
            <span className="most-journal-image-label">
              Запись за день / Объёмы работ
            </span>
            <div className="most-journal-image-viewport is-daily">
              <img
                src={`${journalImagePath}/daily-entry.jpg`}
                width={2584}
                height={1121}
                alt="Учебный пример заполнения ежедневной записи в реальной админке МОСТ"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <figcaption>
            Форма новой записи в тестовом проекте. Пример не отправлен на
            проверку.
          </figcaption>
        </figure>
      </div>
      <div className="most-journal-screen-layout is-reversed">
        <div className="most-journal-screen-copy">
          <span className="most-journal-screen-number" aria-hidden="true">
            02
          </span>
          <h3>Дополните картину рабочего дня</h3>
          <p>
            Персонал, механизмы и материалы находятся в соседних вкладках.
            Условия и заметки помогают сохранить контекст: погоду, возникшие
            проблемы и замечания по качеству.
          </p>
          <ul className="most-scenario-lines">
            <li>Одна дата для работ, ресурсов и примечаний.</li>
            <li>Отдельные поля для условий на площадке.</li>
            <li>Черновик можно подготовить до отправки.</li>
          </ul>
          <a
            className="most-text-link"
            href={`${journalImagePath}/conditions.jpg`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Открыть скриншот крупнее <span aria-hidden="true">↗</span>
          </a>
        </div>
        <figure className="most-journal-screen">
          <div className="most-journal-image-frame">
            <span className="most-journal-image-label">
              Запись за день / Условия и заметки
            </span>
            <div className="most-journal-image-viewport is-conditions">
              <img
                src={`${journalImagePath}/conditions.jpg`}
                width={2576}
                height={1118}
                alt="Погода и примечания к рабочему дню во вкладке «Условия и заметки» в МОСТ"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <figcaption>
            Скриншот настоящего интерфейса с учебными данными.
          </figcaption>
        </figure>
      </div>
      <div className="most-journal-next-step">
        <div>
          <h3>Сначала разобраться в заполнении?</h3>
          <p>В статье — три примера записей и порядок подготовки данных.</p>
        </div>
        <MarketingLink
          className="most-text-link"
          href="/blog/obshchiy-zhurnal-rabot-v-stroitelstve"
        >
          Посмотреть образцы заполнения <span aria-hidden="true">↗</span>
        </MarketingLink>
      </div>
    </div>
  </section>
);

export default JournalShowcase;
