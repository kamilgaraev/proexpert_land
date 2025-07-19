import PageLayout from '../../components/shared/PageLayout';
import { 
  PlayCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  VideoCameraIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const WebinarsPage = () => {
  const upcomingWebinars = [
    {
      id: 1,
      title: 'Автоматизация учета материалов на стройке',
      description: 'Узнайте, как сократить время на учет материалов на 70% с помощью QR-кодов и мобильного приложения ProHelper.',
      date: '2024-01-25',
      time: '14:00',
      duration: '60 мин',
      speaker: 'Алексей Петров',
      speakerRole: 'Продакт-менеджер ProHelper',
      participants: 145,
      topics: [
        'Настройка QR-кодов для материалов',
        'Работа с мобильным приложением',
        'Автоматические списания',
        'Отчеты по расходу материалов'
      ]
    },
    {
      id: 2,
      title: 'Финансовый контроль строительных проектов',
      description: 'Планирование бюджета, контроль затрат и анализ рентабельности проектов в ProHelper.',
      date: '2024-02-08',
      time: '15:00',
      duration: '45 мин',
      speaker: 'Мария Сидорова',
      speakerRole: 'Финансовый аналитик',
      participants: 89,
      topics: [
        'Планирование бюджета проекта',
        'Контроль фактических затрат',
        'Анализ отклонений',
        'Прогнозирование рентабельности'
      ]
    }
  ];

  const pastWebinars = [
    {
      id: 1,
      title: 'Внедрение ProHelper: с чего начать',
      description: 'Пошаговое руководство по внедрению системы учета материалов в строительной компании.',
      date: '2024-01-10',
      duration: '55 мин',
      views: 342,
      rating: 4.8,
      videoUrl: '/webinars/getting-started'
    },
    {
      id: 2,
      title: 'Интеграция с 1С: настройка и возможности',
      description: 'Как настроить синхронизацию ProHelper с 1С Предприятие для автоматического обмена данными.',
      date: '2023-12-15',
      duration: '40 мин',
      views: 189,
      rating: 4.9,
      videoUrl: '/webinars/1c-integration'
    },
    {
      id: 3,
      title: 'Мобильное приложение для прорабов',
      description: 'Возможности мобильного приложения: учет материалов без интернета, фото-отчеты, геолокация.',
      date: '2023-11-28',
      duration: '35 мин',
      views: 267,
      rating: 4.7,
      videoUrl: '/webinars/mobile-app'
    }
  ];

  const webinarBenefits = [
    {
      title: 'Экспертные знания',
      description: 'Обучение от разработчиков и экспертов ProHelper',
      icon: '🎓'
    },
    {
      title: 'Практические кейсы',
      description: 'Реальные примеры внедрения и использования',
      icon: '💼'
    },
    {
      title: 'Живые демо',
      description: 'Показ функций системы в режиме реального времени',
      icon: '🖥️'
    },
    {
      title: 'Q&A сессии',
      description: 'Ответы на ваши вопросы от экспертов',
      icon: '❓'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <PageLayout
      title="Вебинары ProHelper"
      subtitle="Обучающие материалы и практические советы"
      seoPage="webinars"
    >
      <div className="bg-gradient-to-b from-slate-50 to-white">
        {/* Benefits Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {webinarBenefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Webinars */}
        <section className="py-24 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Ближайшие вебинары
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Присоединяйтесь к бесплатным обучающим вебинарам и узнайте, как эффективно использовать ProHelper
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {upcomingWebinars.map((webinar) => (
                <div key={webinar.id} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center text-sm text-construction-600 bg-construction-50 px-3 py-1 rounded-full">
                      <VideoCameraIcon className="w-4 h-4 mr-2" />
                      Скоро
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        {formatDate(webinar.date)}
                      </div>
                      <div className="flex items-center mt-1">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {webinar.time} ({webinar.duration})
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{webinar.title}</h3>
                  <p className="text-slate-600 mb-6">{webinar.description}</p>

                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-900 mb-3">Что узнаете:</h4>
                    <ul className="space-y-2">
                      {webinar.topics.map((topic, index) => (
                        <li key={index} className="flex items-start text-sm text-slate-600">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-construction-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {webinar.speaker.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{webinar.speaker}</div>
                        <div className="text-sm text-slate-600">{webinar.speakerRole}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-slate-600">
                        <UserGroupIcon className="w-4 h-4 mr-1" />
                        {webinar.participants} записались
                      </div>
                      <button className="mt-2 btn-primary text-sm px-4 py-2">
                        Записаться бесплатно
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Past Webinars */}
        <section className="py-24 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Записи вебинаров
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Смотрите записи прошедших вебинаров в удобное время
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastWebinars.map((webinar) => (
                <div key={webinar.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-construction-500 to-safety-500 flex items-center justify-center">
                    <PlayCircleIcon className="w-16 h-16 text-white" />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{webinar.title}</h3>
                    <p className="text-slate-600 mb-4">{webinar.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        {formatDate(webinar.date)}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {webinar.duration}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="text-sm text-slate-600">
                        <div>{webinar.views} просмотров</div>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{webinar.rating}</span>
                        </div>
                      </div>
                      <a 
                        href={webinar.videoUrl}
                        className="flex items-center text-construction-600 hover:text-construction-700 font-medium"
                      >
                        Смотреть
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-24 bg-gradient-to-r from-construction-600 to-safety-600 text-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">
                Не пропустите новые вебинары
              </h2>
              <p className="text-xl text-construction-100 mb-8">
                Подпишитесь на уведомления и первыми узнавайте о новых обучающих материалах
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Ваш email"
                  className="flex-1 px-4 py-3 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="px-6 py-3 bg-white text-construction-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  Подписаться
                </button>
              </div>
              
              <p className="text-sm text-construction-100 mt-4">
                Никакого спама. Только полезная информация о вебинарах и обновлениях ProHelper.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="container-custom text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Хотите индивидуальную консультацию?
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Закажите персональную демонстрацию ProHelper для вашей компании
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/demo" 
                className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                Заказать демо
              </a>
              <a 
                href="/contact" 
                className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                Связаться с экспертом
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default WebinarsPage; 