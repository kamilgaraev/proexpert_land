import {
  DocumentTextIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Простое мобильное приложение',
    description: 'Интуитивно понятное мобильное приложение для прорабов - фиксация материалов и работ даже без интернета.',
    icon: DevicePhoneMobileIcon,
  },
  {
    name: 'Отчеты для бухгалтерии',
    description: 'Готовые выгрузки данных в форматах, совместимых с 1С, СБИС и другими учетными системами.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Синхронизация данных',
    description: 'Автоматический обмен данными между стройплощадкой и офисом - никакого двойного ввода.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Облачное хранение данных',
    description: 'Все данные надежно хранятся в облаке - доступ с любого устройства, в любое время.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Экономия времени',
    description: 'Сокращение времени на рутинные операции - прорабы тратят на 70% меньше времени на отчеты.',
    icon: ClockIcon,
  },
  {
    name: 'Контроль финансов',
    description: 'Оперативный контроль затрат и остатков материалов - предотвращение кассовых разрывов.',
    icon: CurrencyDollarIcon,
  },
];

const Features = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="features" className="py-12 bg-secondary-50 sm:py-16 lg:py-20">
      <div className="container-custom">
        <div className="text-center">
          <motion.h2 
            className="text-primary-600 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            ВОЗМОЖНОСТИ
          </motion.h2>
          <motion.h3 
            className="mt-2 text-3xl font-bold text-secondary-900 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Все, что нужно для эффективного учета в строительстве
          </motion.h3>
          <motion.p 
            className="mt-4 max-w-2xl mx-auto text-xl text-secondary-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Забудьте о сложных таблицах, потерянных фото и задержках в передаче данных
          </motion.p>
        </div>

        <motion.div 
          className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.name}
              className="relative p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              variants={item}
            >
              <div className="absolute -top-4 -left-4 p-3 rounded-full bg-construction-100">
                <feature.icon className="h-6 w-6 text-construction-700" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-secondary-900">{feature.name}</h3>
              <p className="mt-2 text-base text-secondary-500">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features; 