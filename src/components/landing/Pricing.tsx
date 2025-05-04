import { CheckIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const tiers = [
  {
    name: 'Базовый',
    id: 'tier-basic',
    price: '2 990',
    description: 'Идеально для небольших строительных компаний или индивидуальных подрядчиков.',
    features: [
      '1 прораб',
      '3 активных объекта',
      'Неограниченное хранение материалов',
      'Базовые отчеты (CSV)',
      'Email-поддержка',
    ],
    cta: 'Попробовать бесплатно',
    mostPopular: false,
  },
  {
    name: 'Стандарт',
    id: 'tier-standard',
    price: '5 990',
    description: 'Оптимально для средних строительных компаний с несколькими объектами.',
    features: [
      '5 прорабов',
      '10 активных объектов',
      'Неограниченное хранение материалов',
      'Расширенные отчеты (CSV, Excel)',
      'Приоритетная поддержка',
      'Резервное копирование данных',
    ],
    cta: 'Попробовать бесплатно',
    mostPopular: true,
  },
  {
    name: 'Профессиональный',
    id: 'tier-professional',
    price: '9 990',
    description: 'Комплексное решение для крупных строительных компаний с множеством объектов.',
    features: [
      'Неограниченное количество прорабов',
      'Неограниченное количество объектов',
      'Неограниченное хранение материалов',
      'Все форматы отчетов',
      'Приоритетная поддержка 24/7',
      'Резервное копирование данных',
      'API для интеграций',
      'Персональный менеджер',
    ],
    cta: 'Попробовать бесплатно',
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
            Выберите план, который подходит именно вам. Все тарифы включают 14-дневный бесплатный пробный период.
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
          <h4 className="text-2xl font-bold text-secondary-900">Нужен индивидуальный план?</h4>
          <p className="mt-2 text-lg text-secondary-500">
            Свяжитесь с нами для получения специального предложения для вашего бизнеса.
          </p>
          <div className="mt-6">
            <a
              href="mailto:info@prorabmost.ru"
              className="btn btn-primary"
            >
              Связаться с нами
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing; 