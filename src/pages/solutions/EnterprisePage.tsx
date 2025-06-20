import PageLayout from '../../components/shared/PageLayout';
import { 
  BuildingOffice2Icon,
  UsersIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const EnterprisePage = () => {
  const advantages = [
    {
      icon: UsersIcon,
      title: 'Неограниченное количество пользователей',
      description: 'Подключите всех сотрудников без дополнительной платы'
    },
    {
      icon: GlobeAltIcon,
      title: 'Мультирегиональность',
      description: 'Управляйте проектами в разных городах и странах'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Корпоративная безопасность',
      description: 'SOC 2, ISO 27001, локальное развертывание'
    },
    {
      icon: CogIcon,
      title: 'Кастомизация',
      description: 'Адаптируем систему под ваши бизнес-процессы'
    }
  ];

  const features = [
    {
      category: 'Масштабирование',
      icon: ArrowTrendingUpIcon,
      items: [
        'Неограниченное количество проектов',
        'Поддержка сложных организационных структур',
        'Распределенные команды по регионам',
        'Интеграция с корпоративными системами'
      ]
    },
    {
      category: 'Аналитика и отчетность',
      icon: ChartBarIcon,
      items: [
        'Бизнес-аналитика в реальном времени',
        'Кастомные дашборды для руководства',
        'Автоматические отчеты для акционеров',
        'Интеграция с BI-системами'
      ]
    },
    {
      category: 'Безопасность',
      icon: ShieldCheckIcon,
      items: [
        'Single Sign-On (SSO) интеграция',
        'Детальное управление правами доступа',
        'Аудит всех действий пользователей',
        'Соответствие международным стандартам'
      ]
    },
    {
      category: 'Интеграции',
      icon: CogIcon,
      items: [
        'API для интеграции с любыми системами',
        'Готовые коннекторы к ERP и CRM',
        'Синхронизация с HR-системами',
        'Интеграция с финансовыми системами'
      ]
    }
  ];

  const corporateClients = [
    {
      name: 'ПАО "Строительный Холдинг"',
      description: 'Крупнейший девелопер России',
      employees: '15,000+',
      projects: '200+',
      results: [
        'Сокращение времени согласования проектов на 45%',
        'Снижение затрат на управление на 35%',
        'Повышение прозрачности процессов на 80%'
      ]
    },
    {
      name: 'ООО "МегаСтрой"',
      description: 'Международная строительная корпорация',
      employees: '25,000+',
      projects: '500+',
      results: [
        'Унификация процессов в 12 странах',
        'Экономия на ИТ-инфраструктуре ₽50млн/год',
        'Увеличение скорости принятия решений в 3 раза'
      ]
    }
  ];

  const implementationSteps = [
    {
      step: 1,
      title: 'Анализ и планирование',
      description: 'Детальный анализ ваших процессов и составление плана внедрения',
      duration: '2-4 недели'
    },
    {
      step: 2,
      title: 'Пилотный проект',
      description: 'Запуск системы на ограниченном количестве проектов',
      duration: '4-6 недель'
    },
    {
      step: 3,
      title: 'Масштабирование',
      description: 'Постепенное подключение всех подразделений и проектов',
      duration: '8-12 недель'
    },
    {
      step: 4,
      title: 'Оптимизация',
      description: 'Настройка и оптимизация системы под ваши потребности',
      duration: 'Постоянно'
    }
  ];

  return (
    <PageLayout 
      title="Корпоративные решения" 
      subtitle="Масштабируемая платформа для крупных строительных компаний"
    >
      <div className="mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100">
                <div className="w-12 h-12 bg-construction-100 rounded-xl flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-construction-600" />
                </div>
                <h3 className="text-lg font-semibold text-steel-900 mb-2">{advantage.title}</h3>
                <p className="text-steel-600 text-sm">{advantage.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-steel-900 mb-4">Корпоративные возможности</h2>
            <p className="text-xl text-steel-600">Полный набор инструментов для управления крупными проектами</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-steel-900">{feature.category}</h3>
                  </div>
                  <ul className="space-y-3">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-construction-500 flex-shrink-0 mt-0.5" />
                        <span className="text-steel-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-steel-900 mb-4">Наши корпоративные клиенты</h2>
            <p className="text-xl text-steel-600">Компании, которые доверяют нам управление своими проектами</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {corporateClients.map((client, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-concrete-50 rounded-2xl p-8 shadow-lg border border-concrete-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-construction-100 rounded-xl flex items-center justify-center">
                    <BuildingOffice2Icon className="w-8 h-8 text-construction-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-steel-900">{client.name}</h3>
                    <p className="text-steel-600">{client.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-construction-600">{client.employees}</div>
                    <div className="text-sm text-steel-600">Сотрудников</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-safety-600">{client.projects}</div>
                    <div className="text-sm text-steel-600">Проектов в работе</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-steel-900 mb-3">Достигнутые результаты:</h4>
                  <ul className="space-y-2">
                    {client.results.map((result, resultIndex) => (
                      <li key={resultIndex} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-steel-600 text-sm">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-steel-900 mb-4">Процесс внедрения</h2>
            <p className="text-xl text-steel-600">Поэтапное внедрение с минимальными рисками</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {implementationSteps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100 text-center">
                <div className="w-12 h-12 bg-construction-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-construction-600 font-bold text-lg">{step.step}</span>
                </div>
                <h3 className="font-semibold text-steel-900 mb-2">{step.title}</h3>
                <p className="text-steel-600 text-sm mb-3">{step.description}</p>
                <div className="text-xs text-construction-600 font-medium">{step.duration}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Готовы к цифровой трансформации?</h3>
          <p className="text-xl mb-8 opacity-90">
            Получите персональную презентацию и расчет ROI для вашей компании
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-construction-600 font-semibold rounded-lg hover:shadow-lg transition-all text-lg">
              Заказать презентацию
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-construction-600 transition-all text-lg">
              Связаться с менеджером
            </button>
          </div>
          <p className="text-sm opacity-75 mt-4">
            Бесплатная консультация и расчет стоимости внедрения
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default EnterprisePage; 