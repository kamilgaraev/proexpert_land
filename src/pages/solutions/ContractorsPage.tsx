import PageLayout from '../../components/shared/PageLayout';
import { 
  WrenchScrewdriverIcon,
  TruckIcon,
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const ContractorsPage = () => {
  const challenges = [
    {
      icon: ClockIcon,
      title: 'Сроки выполнения',
      description: 'Четкое планирование и контроль сроков каждого этапа работ'
    },
    {
      icon: UsersIcon,
      title: 'Координация бригад',
      description: 'Эффективное управление несколькими рабочими группами'
    },
    {
      icon: DocumentTextIcon,
      title: 'Документооборот',
      description: 'Ведение актов, отчетов и согласований в одном месте'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Контроль качества',
      description: 'Систематический контроль качества выполняемых работ'
    }
  ];

  const solutions = [
    {
      title: 'Планирование работ',
      features: [
        'Создание детального календарного плана',
        'Распределение задач по бригадам',
        'Контроль загрузки специалистов',
        'Учет материалов и оборудования'
      ]
    },
    {
      title: 'Мобильное приложение',
      features: [
        'Получение задач прямо на объекте',
        'Фотоотчеты о выполненных работах',
        'Быстрая связь с прорабом',
        'Отметка о начале и завершении работ'
      ]
    },
    {
      title: 'Контроль качества',
      features: [
        'Чек-листы для проверки работ',
        'Фиксация замечаний и недостатков',
        'Планирование исправлений',
        'История всех проверок'
      ]
    },
    {
      title: 'Отчетность',
      features: [
        'Ежедневные отчеты о проделанной работе',
        'Автоматические сводки по объектам',
        'Учет расхода материалов',
        'Финансовые отчеты по проектам'
      ]
    }
  ];

  const benefits = [
    {
      metric: '35%',
      title: 'Сокращение времени',
      description: 'на планирование и координацию работ'
    },
    {
      metric: '50%',
      title: 'Уменьшение ошибок',
      description: 'благодаря четкому планированию'
    },
    {
      metric: '25%',
      title: 'Экономия бюджета',
      description: 'за счет оптимизации ресурсов'
    },
    {
      metric: '90%',
      title: 'Соблюдение сроков',
      description: 'выполнения работ'
    }
  ];

  return (
    <PageLayout 
      title="Решения для подрядчиков" 
      subtitle="Эффективные инструменты управления строительными работами"
    >
      <div className="mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {challenges.map((challenge, index) => {
            const IconComponent = challenge.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100 text-center">
                <div className="w-16 h-16 bg-construction-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-construction-600" />
                </div>
                <h3 className="text-lg font-bold text-steel-900 mb-2">{challenge.title}</h3>
                <p className="text-steel-600 text-sm">{challenge.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-steel-900 mb-4">Комплексное решение для подрядчиков</h2>
            <p className="text-xl text-steel-600">Все инструменты для эффективной работы в одной системе</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-concrete-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center">
                    <WrenchScrewdriverIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-steel-900">{solution.title}</h3>
                </div>
                <ul className="space-y-3">
                  {solution.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-construction-500 flex-shrink-0 mt-0.5" />
                      <span className="text-steel-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Результаты наших клиентов</h2>
            <p className="text-xl text-white/90">Реальные показатели улучшения эффективности</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{benefit.metric}</div>
                <div className="text-lg font-semibold text-white mb-1">{benefit.title}</div>
                <div className="text-white/80 text-sm">{benefit.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-steel-900 mb-4">Кейс: ООО "СтройМастер"</h2>
            <p className="text-xl text-steel-600">Как подрядчик оптимизировал работу на 15 объектах</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 font-bold text-lg">До</span>
              </div>
              <ul className="text-steel-600 text-sm space-y-2">
                <li>• Планирование на бумаге</li>
                <li>• Постоянные простои бригад</li>
                <li>• Превышение бюджета на 20%</li>
                <li>• Срывы сроков в 40% проектов</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-steel-900 font-semibold mb-2">Внедрение ProHelper</div>
              <ul className="text-steel-600 text-sm space-y-2">
                <li>• Обучение команды - 1 неделя</li>
                <li>• Настройка процессов - 2 недели</li>
                <li>• Полный переход - 1 месяц</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">После</span>
              </div>
              <ul className="text-steel-600 text-sm space-y-2">
                <li>• Цифровое планирование</li>
                <li>• Сокращение простоев на 60%</li>
                <li>• Экономия бюджета 15%</li>
                <li>• Сроки соблюдаются в 95% случаев</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold text-steel-900 mb-4">Готовы оптимизировать свои процессы?</h3>
          <p className="text-xl text-steel-600 mb-8">
            Получите персональную консультацию и демонстрацию системы
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-construction-600 text-white font-semibold rounded-lg hover:bg-construction-700 transition-colors">
              Заказать демо
            </button>
            <button className="px-8 py-3 border-2 border-construction-600 text-construction-600 font-semibold rounded-lg hover:bg-construction-50 transition-colors">
              Попробовать бесплатно
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ContractorsPage; 