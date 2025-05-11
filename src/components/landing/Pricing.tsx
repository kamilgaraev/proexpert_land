import { CheckIcon, CogIcon, PuzzlePieceIcon, LifebuoyIcon, WalletIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const tiers = [
  {
    name: 'Старт',
    id: 'tier-start',
    price: '1 990',
    description: 'Для небольших компаний, ИП и начинающих подрядчиков.',
    features: [
      'До 2-х пользователей-прорабов',
      'До 3-х активных объектов',
      'До 500 МБ хранилища',
      'Основные функции мобильного приложения',
      'Базовый просмотр логов',
      'Стандартные отчеты (CSV/Excel)',
      'Email-поддержка',
    ],
    cta: 'Начать с тарифа Старт',
    mostPopular: false,
  },
  {
    name: 'Бизнес',
    id: 'tier-business',
    price: '6 990',
    description: 'Оптимальный выбор для малых и средних строительных компаний.',
    features: [
      'До 10 пользователей-прорабов',
      'До 15 активных объектов',
      'До 5 ГБ хранилища',
      'До 2-х пользователей-администраторов',
      'Все функции тарифа "Старт"',
      'Импорт справочников из CSV/Excel',
      'Конструктор шаблонов выгрузок',
      'Расширенная фильтрация и поиск',
      'Базовая интеграция с ЭДО (сверка)',
      'Техническая поддержка по email/чату',
    ],
    cta: 'Попробовать Бизнес бесплатно',
    mostPopular: true,
  },
  {
    name: 'Профи',
    id: 'tier-pro',
    price: '14 990',
    description: 'Для компаний с несколькими командами и повышенными требованиями.',
    features: [
      'До 30 пользователей-прорабов',
      'До 50 активных объектов',
      'До 20 ГБ хранилища',
      'До 5 пользователей-администраторов',
      'Все функции тарифа "Бизнес"',
      'API-доступ для интеграций',
      'Расширенные права доступа и роли',
      'Приоритетная техническая поддержка',
    ],
    cta: 'Выбрать Профи',
    mostPopular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-12 bg-secondary-50 sm:py-16 lg:py-20">
      <div className="container-custom">
        <div className="text-center">
          <motion.h2 
            className="text-primary-600 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            ТАРИФЫ
          </motion.h2>
          <motion.h3 
            className="mt-2 text-3xl font-bold text-secondary-900 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Гибкие тарифные планы для любого бизнеса
          </motion.h3>
          <motion.p 
            className="mt-4 max-w-2xl mx-auto text-xl text-secondary-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Выберите план, который подходит именно вам. Тариф "Бизнес" включает 14-дневный бесплатный пробный период.
          </motion.p>
        </div>

        <motion.div 
          className="mt-12 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col p-8 rounded-2xl shadow-sm ${
                tier.mostPopular
                  ? 'bg-white ring-2 ring-primary-600 lg:scale-105 z-10'
                  : 'bg-white'
              }`}
            >
              {tier.mostPopular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary-600 px-3 py-1 rounded-full text-white text-sm font-semibold">
                  Популярный
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{tier.name}</h3>
                <p className="mt-4 text-sm text-secondary-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-bold text-secondary-900">{tier.price}</span>
                  <span className="text-base font-medium text-secondary-500"> руб./мес.</span>
                </p>
                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-secondary-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/register"
                  className={`w-full btn ${
                    tier.mostPopular ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-16 text-center bg-white p-8 rounded-xl shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="text-2xl font-bold text-secondary-900">Тариф "Энтерпрайз"</h4>
          <p className="mt-2 text-lg text-secondary-500">
            Для крупных строительных организаций и холдингов. Индивидуальные условия и цена по запросу.
          </p>
          <div className="mt-6">
            <a
              href="mailto:info@prorabmost.ru"
              className="btn btn-primary"
            >
              Связаться для консультации
            </a>
          </div>
        </motion.div>

        {/* Дополнительные услуги и возможности */}
        <motion.div
          className="mt-16 pt-10 border-t border-secondary-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-secondary-900 sm:text-4xl lg:text-5xl">
              Дополнительные услуги и возможности
            </h3>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-secondary-600">
              Настройте платформу под себя: расширьте функционал и получите поддержку, соответствующую вашим уникальным бизнес-процессам.
            </p>
          </div>

          <div className="space-y-12">
            {/* Платные Модули */}
            <div>
              <div className="flex items-center mb-6">
                <PuzzlePieceIcon className="h-8 w-8 text-primary-600 mr-3" />
                <h4 className="text-2xl font-semibold text-secondary-800">Платные Модули (Add-ons)</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h5 className="text-lg font-semibold text-primary-700">Продвинутая Аналитика и BI</h5>
                  <p className="mt-3 text-secondary-600 text-sm">
                    Детальные дашборды, кастомные отчеты, сравнение план/факт для глубокого анализа.<br />
                    <em>Ориентировочно: +20-30% к стоимости тарифа "Профи" или "Бизнес". Точная стоимость зависит от выбранного тарифа.</em>
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h5 className="text-lg font-semibold text-primary-700">Модуль Управления Заявками и Согласованиями</h5>
                  <p className="mt-3 text-secondary-600 text-sm">
                    Для более сложных процессов документооборота, согласования заявок и внутреннего контроля.<br />
                    <em>Ориентировочно: +15-25% к стоимости основного тарифа. Обсуждается индивидуально.</em>
                  </p>
                </div>
              </div>
            </div>

            {/* Услуги по Внедрению и Кастомизации */}
            <div>
              <div className="flex items-center mb-6">
                <CogIcon className="h-8 w-8 text-primary-600 mr-3" />
                <h4 className="text-2xl font-semibold text-secondary-800">Услуги по Внедрению и Кастомизации</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h5 className="text-lg font-semibold text-primary-700">Стартовый Пакет Внедрения</h5>
                  <p className="mt-3 text-secondary-600 text-sm">
                    Помощь с импортом ваших данных, детальная настройка справочников, комплексное обучение вашей команды.<br />
                    <em>Ориентировочно: 15 000 - 50 000 руб. (разовый платеж).</em>
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h5 className="text-lg font-semibold text-primary-700">Разработка Кастомных Интеграций/Отчетов</h5>
                  <p className="mt-3 text-secondary-600 text-sm">
                    Создание уникальных интеграций с вашими системами или разработка специфических отчетов под ваши нужды.<br />
                    <em>Стоимость определяется индивидуально (почасовая ставка или фиксированная цена за проект).</em>
                  </p>
                </div>
              </div>
            </div>

            {/* Премиум-Поддержка */}
            <div>
              <div className="flex items-center mb-6">
                <LifebuoyIcon className="h-8 w-8 text-primary-600 mr-3" />
                <h4 className="text-2xl font-semibold text-secondary-800">Премиум-Поддержка</h4>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <p className="text-secondary-600 text-sm">
                  Выделенная линия поддержки с гарантированным временем ответа для оперативного решения вопросов (доступно для тарифов "Старт" и "Бизнес").<br />
                  <em>Ориентировочно: +1000-2000 руб./месяц к основному тарифу.</em>
                </p>
              </div>
            </div>

            {/* Оплата за Превышение Лимитов */}
            <div>
              <div className="flex items-center mb-6">
                <WalletIcon className="h-8 w-8 text-primary-600 mr-3" />
                <h4 className="text-2xl font-semibold text-secondary-800">Оплата за Превышение Лимитов (Pay-per-use)</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h5 className="text-lg font-semibold text-primary-700">Дополнительное хранилище</h5>
                  <p className="mt-3 text-secondary-600 text-sm">
                    Если стандартных объемов будет недостаточно для ваших фото и документов.<br />
                    <em>Стоимость: 500 руб. за каждые дополнительные 5 ГБ/месяц. <br />Например, +10 ГБ обойдутся в 1000 руб./мес.</em>
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h5 className="text-lg font-semibold text-primary-700">Дополнительные пользователи-прорабы</h5>
                  <p className="mt-3 text-secondary-600 text-sm">
                    Если количество пользователей-прорабов в вашем тарифе нужно увеличить.<br />
                    <em>Стоимость: 500-700 руб./месяц за каждого дополнительного пользователя. <br />Например, +2 прораба будут стоить 1000-1400 руб./мес.</em>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
        {/* Конец Дополнительные услуги и возможности */}

      </div>
    </section>
  );
};

export default Pricing; 