import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import { 
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const CareersPage = () => {
  const benefits = [
    {
      icon: CurrencyDollarIcon,
      title: 'Конкурентная зарплата',
      description: 'Достойная оплата труда и регулярные пересмотры'
    },
    {
      icon: AcademicCapIcon,
      title: 'Обучение и развитие',
      description: 'Курсы, конференции, сертификации за счет компании'
    },
    {
      icon: HeartIcon,
      title: 'Медицинское страхование',
      description: 'ДМС для сотрудников и их семей'
    },
    {
      icon: ClockIcon,
      title: 'Гибкий график',
      description: 'Удаленная работа и гибкое расписание'
    }
  ];

  const openPositions = [
    {
      title: 'Senior Frontend Developer',
      department: 'Разработка',
      location: 'Москва / Удаленно',
      type: 'Полная занятость',
      experience: '3-5 лет',
      salary: '200,000 - 300,000 ₽',
      description: 'Разработка пользовательских интерфейсов на React/TypeScript'
    },
    {
      title: 'Backend Developer (Python)',
      department: 'Разработка',
      location: 'Москва / Удаленно',
      type: 'Полная занятость',
      experience: '2-4 года',
      salary: '180,000 - 250,000 ₽',
      description: 'Разработка серверной части системы на Python/Django'
    },
    {
      title: 'UX/UI Designer',
      department: 'Дизайн',
      location: 'Москва',
      type: 'Полная занятость',
      experience: '2-3 года',
      salary: '150,000 - 200,000 ₽',
      description: 'Проектирование пользовательского опыта для B2B продуктов'
    },
    {
      title: 'DevOps Engineer',
      department: 'Инфраструктура',
      location: 'Москва / Удаленно',
      type: 'Полная занятость',
      experience: '3-5 лет',
      salary: '220,000 - 280,000 ₽',
      description: 'Автоматизация развертывания и поддержка инфраструктуры'
    },
    {
      title: 'Product Manager',
      department: 'Продукт',
      location: 'Москва',
      type: 'Полная занятость',
      experience: '3-5 лет',
      salary: '180,000 - 250,000 ₽',
      description: 'Управление продуктом и развитие функциональности'
    },
    {
      title: 'Customer Success Manager',
      department: 'Клиентский сервис',
      location: 'Москва',
      type: 'Полная занятость',
      experience: '2-4 года',
      salary: '120,000 - 180,000 ₽',
      description: 'Работа с клиентами и обеспечение их успеха'
    }
  ];

  const values = [
    {
      title: 'Инновации',
      description: 'Мы постоянно ищем новые решения и не боимся экспериментировать'
    },
    {
      title: 'Команда',
      description: 'Поддерживаем друг друга и растем вместе'
    },
    {
      title: 'Качество',
      description: 'Делаем продукт, которым гордимся'
    },
    {
      title: 'Клиентоориентированность',
      description: 'Решаем реальные проблемы пользователей'
    }
  ];

  return (
    <PageLayout 
      title="Карьера в ProHelper" 
      subtitle="Присоединяйтесь к команде, которая меняет строительную отрасль"
    >
      <div className="mb-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-steel-900 mb-6">Почему ProHelper?</h2>
            <p className="text-xl text-steel-600 max-w-3xl mx-auto">
              Мы создаем инновационный продукт, который помогает тысячам строительных компаний 
              работать эффективнее. Присоединяйтесь к команде профессионалов, которые ценят 
              качество, инновации и развитие.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-construction-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-construction-600" />
                  </div>
                  <h3 className="text-lg font-bold text-steel-900 mb-2">{benefit.title}</h3>
                  <p className="text-steel-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-steel-900 mb-4">Наши ценности</h2>
            <p className="text-xl text-steel-600">Принципы, которые объединяют нашу команду</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100 text-center">
                <h3 className="text-lg font-bold text-steel-900 mb-3">{value.title}</h3>
                <p className="text-steel-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-steel-900 mb-4">Открытые вакансии</h2>
            <p className="text-xl text-steel-600">Найдите свою идеальную роль в нашей команде</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-steel-900 mb-2">{position.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-steel-600">
                      <div className="flex items-center gap-1">
                        <BriefcaseIcon className="w-4 h-4" />
                        {position.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        {position.location}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-construction-100 text-construction-800 rounded-full text-sm font-medium">
                    {position.type}
                  </span>
                </div>

                <p className="text-steel-600 mb-4">{position.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-xs text-steel-500 uppercase tracking-wide">Опыт работы</div>
                    <div className="font-medium text-steel-900">{position.experience}</div>
                  </div>
                  <div>
                    <div className="text-xs text-steel-500 uppercase tracking-wide">Зарплата</div>
                    <div className="font-medium text-steel-900">{position.salary}</div>
                  </div>
                </div>

                <button className="w-full bg-construction-600 text-white font-semibold py-3 rounded-lg hover:bg-construction-700 transition-colors">
                  Откликнуться
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Не нашли подходящую вакансию?</h3>
          <p className="text-xl mb-8 opacity-90">
            Отправьте нам свое резюме, и мы свяжемся с вами, когда появится подходящая позиция
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-construction-600 font-semibold rounded-lg hover:shadow-lg transition-all">
              Отправить резюме
            </button>
            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-construction-600 transition-all">
              Подписаться на уведомления
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CareersPage; 