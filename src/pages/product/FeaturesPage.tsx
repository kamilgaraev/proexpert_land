import PageLayout from '../../components/shared/PageLayout';
import { 
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  DocumentCheckIcon,
  BellIcon,
  CloudIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const FeaturesPage = () => {
  const mainFeatures = [
    {
      icon: ClipboardDocumentListIcon,
      title: 'Учет материалов',
      description: 'Полный контроль над материалами на стройке: поступление, расход, остатки. QR-коды для быстрого учета.',
      benefits: ['Сканирование QR-кодов', 'Геопривязка складов', 'Автоматические списания', 'Контроль остатков']
    },
    {
      icon: ChartBarIcon,
      title: 'Управление проектами',
      description: 'Планирование, контроль выполнения и аналитика по всем строительным проектам в одном месте.',
      benefits: ['Диаграмма Ганта', 'Календарь задач', 'Контроль сроков', 'Отчеты по проектам']
    },
    {
      icon: UserGroupIcon,
      title: 'Координация команды',
      description: 'Управление ролями, задачами и коммуникацией между участниками строительного процесса.',
      benefits: ['Роли и права доступа', 'Чат в реальном времени', 'Назначение задач', 'Контроль активности']
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Финансовый контроль',
      description: 'Планирование и контроль бюджета, учет затрат, финансовая отчетность по проектам.',
      benefits: ['Планирование бюджета', 'Контроль затрат', 'Финансовые отчеты', 'Анализ рентабельности']
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Мобильное приложение',
      description: 'Работайте с системой прямо на объекте через мобильное приложение для прорабов.',
      benefits: ['Работа без интернета', 'Фото отчеты', 'GPS координаты', 'Синхронизация данных']
    },
    {
      icon: DocumentCheckIcon,
      title: 'Документооборот',
      description: 'Централизованное хранение и управление всеми документами по проектам.',
      benefits: ['Версионирование документов', 'Электронные подписи', 'Шаблоны документов', 'История изменений']
    }
  ];

  const additionalFeatures = [
    {
      icon: MapPinIcon,
      title: 'Геолокация',
      description: 'Контроль местоположения бригад и привязка действий к координатам объекта.'
    },
    {
      icon: BellIcon,
      title: 'Уведомления',
      description: 'Настраиваемые уведомления о важных событиях в Telegram, email, SMS.'
    },
    {
      icon: CloudIcon,
      title: 'Облачное хранение',
      description: 'Все данные надежно хранятся в облаке с автоматическим резервным копированием.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Безопасность',
      description: 'Двухфакторная аутентификация, шифрование данных, соответствие GDPR.'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Аналитика',
      description: 'Детальная аналитика эффективности: KPI, дашборды, прогнозирование.'
    },
    {
      icon: CogIcon,
      title: 'Интеграции',
      description: 'Подключение к 1С, AutoCAD, другим системам через API или готовые интеграции.'
    }
  ];

  const benefits = [
    {
      title: 'Экономия времени',
      description: 'До 40% сокращение времени на административные задачи',
      icon: '⏰'
    },
    {
      title: 'Контроль затрат',
      description: 'Снижение перерасхода материалов на 25-30%',
      icon: '💰'
    },
    {
      title: 'Прозрачность',
      description: 'Полная видимость всех процессов в реальном времени',
      icon: '👁️'
    },
    {
      title: 'Масштабируемость',
      description: 'От 1 до 1000+ объектов в одной системе',
      icon: '📈'
    }
  ];

  return (
    <PageLayout
      title="Возможности ProHelper"
      subtitle="Полный функционал для современного строительства"
      seoPage="features"
    >
      <div className="bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-construction-500/10 to-safety-500/10" />
          <div className="container-custom py-24 relative">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold text-slate-900 mb-6">
                Полный набор инструментов для <span className="text-construction-600">современного строительства</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                ProHelper объединяет все необходимые функции для эффективного управления строительными проектами в одной платформе
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-3">{benefit.icon}</div>
                    <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-slate-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-24 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Основные возможности
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Каждая функция разработана с учетом специфики строительной отрасли и потребностей реальных проектов
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              {mainFeatures.map((feature, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-start mb-6">
                    <div className="w-14 h-14 bg-construction-500 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-sm text-slate-700">
                        <div className="w-2 h-2 bg-construction-500 rounded-full mr-3" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-24 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Дополнительные возможности
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Расширенные функции для максимальной эффективности и безопасности ваших проектов
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {additionalFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-safety-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-24 bg-gradient-to-r from-construction-600 to-safety-600 text-white">
          <div className="container-custom">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">
                Интегрируется с вашими инструментами
              </h2>
              <p className="text-xl text-construction-100 mb-12">
                ProHelper легко подключается к существующим системам, не нарушая рабочие процессы
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">1C</span>
                  </div>
                  <h3 className="font-semibold mb-2">1С Предприятие</h3>
                  <p className="text-sm text-construction-100">Синхронизация финансовых данных</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📐</span>
                  </div>
                  <h3 className="font-semibold mb-2">AutoCAD</h3>
                  <p className="text-sm text-construction-100">Импорт проектной документации</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-semibold mb-2">Excel/Google Sheets</h3>
                  <p className="text-sm text-construction-100">Импорт и экспорт данных</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-semibold mb-2">API</h3>
                  <p className="text-sm text-construction-100">Кастомные интеграции</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Готовы испытать все возможности ProHelper?
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Начните бесплатный тест-драйв на 14 дней и оцените, как ProHelper изменит ваши проекты
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/register" 
                className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                Попробовать бесплатно
              </a>
              <a 
                href="/demo" 
                className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                Посмотреть демо
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default FeaturesPage; 