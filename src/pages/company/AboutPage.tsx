import PageLayout from '../../components/shared/PageLayout';
import { 
  BuildingOfficeIcon,
  UsersIcon,
  TrophyIcon,
  GlobeAltIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const AboutPage = () => {
  const stats = [
    { value: '2019', label: 'Год основания', icon: BuildingOfficeIcon },
    { value: '5000+', label: 'Активных пользователей', icon: UsersIcon },
    { value: '500+', label: 'Реализованных проектов', icon: TrophyIcon },
    { value: '15', label: 'Городов присутствия', icon: GlobeAltIcon }
  ];

  const values = [
    {
      icon: HeartIcon,
      title: 'Клиентоориентированность',
      description: 'Мы создаем продукт, который действительно решает проблемы наших клиентов'
    },
    {
      icon: LightBulbIcon,
      title: 'Инновации',
      description: 'Используем передовые технологии для создания лучших решений'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Надежность',
      description: 'Гарантируем безопасность данных и стабильность работы системы'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Развитие',
      description: 'Постоянно улучшаем продукт на основе обратной связи пользователей'
    }
  ];

  const timeline = [
    {
      year: '2019',
      title: 'Основание компании',
      description: 'Команда опытных разработчиков и строителей объединилась для создания ProHelper'
    },
    {
      year: '2020',
      title: 'Первые клиенты',
      description: 'Запуск MVP и привлечение первых 100 пользователей из строительной отрасли'
    },
    {
      year: '2021',
      title: 'Расширение функционала',
      description: 'Добавление модулей финансового учета и управления документооборотом'
    },
    {
      year: '2022',
      title: 'Мобильное приложение',
      description: 'Запуск мобильных приложений для iOS и Android'
    },
    {
      year: '2023',
      title: 'Корпоративные клиенты',
      description: 'Привлечение крупных застройщиков и строительных холдингов'
    },
    {
      year: '2024',
      title: 'Международная экспансия',
      description: 'Выход на рынки СНГ и планы расширения в Европу'
    }
  ];

  const team = [
    {
      name: 'Алексей Петров',
      position: 'Генеральный директор',
      experience: '15 лет в строительстве',
      description: 'Бывший директор крупной строительной компании, эксперт в области управления проектами'
    },
    {
      name: 'Мария Сидорова',
      position: 'Технический директор',
      experience: '12 лет в разработке',
      description: 'Ведущий архитектор в крупных ИТ-компаниях, эксперт по корпоративным системам'
    },
    {
      name: 'Дмитрий Козлов',
      position: 'Директор по продукту',
      experience: '10 лет в продуктовой разработке',
      description: 'Опыт создания B2B SaaS продуктов для различных отраслей'
    },
    {
      name: 'Елена Волкова',
      position: 'Директор по развитию',
      experience: '8 лет в продажах',
      description: 'Эксперт по работе с корпоративными клиентами в строительной отрасли'
    }
  ];

  return (
    <PageLayout 
      title="О компании ProHelper" 
      subtitle="Мы создаем будущее управления строительными проектами"
    >
      <div className="mb-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-steel-900 mb-6">Наша миссия</h2>
            <p className="text-xl text-steel-600 leading-relaxed mb-8">
              Мы стремимся революционизировать строительную отрасль, предоставляя инновационные 
              цифровые решения, которые делают управление проектами простым, эффективным и прозрачным. 
              Наша цель — помочь строительным компаниям любого размера достигать лучших результатов 
              при меньших затратах времени и ресурсов.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-construction-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-construction-600" />
                    </div>
                    <div className="text-3xl font-bold text-construction-600 mb-2">{stat.value}</div>
                    <div className="text-steel-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-steel-900 mb-4">Наши ценности</h2>
            <p className="text-xl text-steel-600">Принципы, которые определяют нашу работу</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-concrete-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-construction-100 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-construction-600" />
                    </div>
                    <h3 className="text-xl font-bold text-steel-900">{value.title}</h3>
                  </div>
                  <p className="text-steel-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-steel-900 mb-4">История развития</h2>
            <p className="text-xl text-steel-600">Путь от идеи до лидера рынка</p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 h-full w-0.5 bg-construction-200"></div>
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative flex items-start gap-8">
                  <div className="w-16 h-16 bg-construction-500 rounded-full flex items-center justify-center text-white font-bold text-lg z-10">
                    {item.year}
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-concrete-100">
                    <h3 className="text-xl font-bold text-steel-900 mb-2">{item.title}</h3>
                    <p className="text-steel-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-steel-900 mb-4">Команда ProHelper</h2>
            <p className="text-xl text-steel-600">Профессионалы, которые создают будущее</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-construction-100 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-8 h-8 text-construction-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-steel-900">{member.name}</h3>
                    <div className="text-construction-600 font-medium mb-1">{member.position}</div>
                    <div className="text-sm text-steel-500 mb-3">{member.experience}</div>
                    <p className="text-steel-600 text-sm">{member.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Присоединяйтесь к нам</h3>
          <p className="text-xl mb-8 opacity-90">
            Станьте частью революции в строительной отрасли
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-construction-600 font-semibold rounded-lg hover:shadow-lg transition-all">
              Открытые вакансии
            </button>
            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-construction-600 transition-all">
              Связаться с нами
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutPage; 