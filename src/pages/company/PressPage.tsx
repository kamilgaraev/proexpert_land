import PageLayout from '../../components/shared/PageLayout';
import { 
  NewspaperIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  CameraIcon,
  DocumentArrowDownIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline';

const PressPage = () => {
  const newsItems = [
    {
      id: 1,
      title: 'МОСТ привлек $2.5M инвестиций для развития ИИ в строительстве',
      excerpt: 'Российский стартап МОСТ привлек инвестиции от ведущих венчурных фондов для развития искусственного интеллекта в управлении строительными проектами.',
      date: '2024-01-15',
      category: 'Инвестиции',
      image: '/images/press/funding-round.jpg',
      readTime: '3 мин'
    },
    {
      id: 2,
      title: 'МОСТ запустил интеграцию с ChatGPT для автоматической отчетности',
      excerpt: 'Новая функция позволяет прорабам создавать детальные отчеты по проектам с помощью искусственного интеллекта, экономя до 2 часов ежедневно.',
      date: '2024-01-08',
      category: 'Продукт',
      image: '/images/press/ai-integration.jpg',
      readTime: '4 мин'
    },
    {
      id: 3,
      title: 'Исследование: цифровизация строительства выросла на 340% за год',
      excerpt: 'Совместное исследование МОСТ и Строительной ассоциации показало резкий рост внедрения цифровых технологий в строительных компаниях.',
      date: '2023-12-20',
      category: 'Исследования',
      image: '/images/press/research.jpg',
      readTime: '6 мин'
    }
  ];

  const pressKits = [
    {
      title: 'Фирменный стиль и логотипы',
      description: 'Логотипы МОСТ в различных форматах и цветовых вариациях',
      format: 'ZIP (12 MB)',
      lastUpdated: '2024-01-01',
      downloadUrl: '/press/brand-kit.zip'
    },
    {
      title: 'Факты и цифры о компании',
      description: 'Ключевые метрики, статистика роста и достижения МОСТ',
      format: 'PDF (2 MB)',
      lastUpdated: '2024-01-10',
      downloadUrl: '/press/company-facts.pdf'
    },
    {
      title: 'Фотографии продукта',
      description: 'Скриншоты интерфейса, мобильного приложения в высоком разрешении',
      format: 'ZIP (25 MB)',
      lastUpdated: '2023-12-15',
      downloadUrl: '/press/product-photos.zip'
    },
    {
      title: 'Фотографии команды',
      description: 'Портреты основателей и ключевых участников команды',
      format: 'ZIP (18 MB)',
      lastUpdated: '2023-11-20',
      downloadUrl: '/press/team-photos.zip'
    }
  ];

  const mediaContacts = [
    {
      name: 'Алексей Петров',
      role: 'Руководитель по связям с общественностью',
      email: 'press@1мост.рф',
      phone: '+7 (999) 123-45-67',
      telegram: '@alex_prohelper'
    },
    {
      name: 'Мария Сидорова',
      role: 'Маркетинг-директор',
      email: 'marketing@1мост.рф',
      phone: '+7 (999) 234-56-78',
      telegram: '@maria_prohelper'
    }
  ];

  const awards = [
    {
      year: '2024',
      title: 'Лучший B2B стартап года',
      organization: 'TechCrunch Russia',
      description: 'Признание за инновации в строительных технологиях'
    },
    {
      year: '2023',
      title: 'Премия "Цифровая трансформация"',
      organization: 'РБК',
      description: 'За вклад в цифровизацию строительной отрасли'
    },
    {
      year: '2023',
      title: 'Топ-10 PropTech стартапов',
      organization: 'Forbes',
      description: 'Включение в рейтинг перспективных стартапов недвижимости'
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
      title="Пресс-центр МОСТ"
      subtitle="Новости, материалы для СМИ и медиа-ресурсы"
      seoPage="press"
    >
      <div className="bg-gradient-to-b from-slate-50 to-white">
        {/* Latest News */}
        <section className="py-24 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Последние новости
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Актуальная информация о развитии МОСТ, новых продуктах и достижениях компании
              </p>
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {newsItems.map((news) => (
                <article key={news.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-construction-500 to-safety-500 flex items-center justify-center">
                    <CameraIcon className="w-12 h-12 text-white" />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-construction-50 text-construction-600 text-sm font-medium rounded-full">
                        {news.category}
                      </span>
                      <div className="flex items-center text-sm text-slate-500">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        {formatDate(news.date)}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {news.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{news.readTime}</span>
                      <a 
                        href={`/press/news/${news.id}`}
                        className="text-construction-600 hover:text-construction-700 font-medium flex items-center"
                      >
                        Читать полностью
                        <LinkIcon className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Press Kits */}
        <section className="py-24 bg-slate-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Медиа-материалы
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Скачайте логотипы, фотографии и другие материалы для публикаций
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {pressKits.map((kit, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-construction-50 rounded-lg flex items-center justify-center">
                      <DocumentArrowDownIcon className="w-6 h-6 text-construction-600" />
                    </div>
                    <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {kit.format}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {kit.title}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {kit.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-sm text-slate-500">
                      Обновлено: {formatDate(kit.lastUpdated)}
                    </span>
                    <a 
                      href={kit.downloadUrl}
                      className="flex items-center text-construction-600 hover:text-construction-700 font-medium"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                      Скачать
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards & Recognition */}
        <section className="py-24 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Награды и признание
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                МОСТ получил признание экспертов и ведущих медиа за инновации в строительных технологиях
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {awards.map((award, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div className="text-lg font-bold text-construction-600 mb-2">{award.year}</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{award.title}</h3>
                  <p className="text-slate-600 mb-2">{award.organization}</p>
                  <p className="text-sm text-slate-500">{award.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Contacts */}
        <section className="py-24 bg-gradient-to-r from-construction-600 to-safety-600 text-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Контакты для СМИ
              </h2>
              <p className="text-xl text-construction-100 max-w-3xl mx-auto">
                Для получения комментариев, интервью и дополнительной информации
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {mediaContacts.map((contact, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <MegaphoneIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{contact.name}</h3>
                      <p className="text-construction-100">{contact.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-construction-100 w-16">Email:</span>
                      <a href={`mailto:${contact.email}`} className="text-white hover:text-construction-200">
                        {contact.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <span className="text-construction-100 w-16">Телефон:</span>
                      <a href={`tel:${contact.phone}`} className="text-white hover:text-construction-200">
                        {contact.phone}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <span className="text-construction-100 w-16">Telegram:</span>
                      <a href={`https://t.me/${contact.telegram.slice(1)}`} className="text-white hover:text-construction-200">
                        {contact.telegram}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-construction-100 mb-4">
                Время ответа на запросы СМИ: до 24 часов
              </p>
              <a 
                href="mailto:press@1мост.рф"
                className="inline-flex items-center px-6 py-3 bg-white text-construction-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Написать в пресс-службу
              </a>
            </div>
          </div>
        </section>

        {/* Newsletter for Journalists */}
        <section className="py-24 bg-slate-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <NewspaperIcon className="w-16 h-16 text-construction-600 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Подписка для журналистов
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Получайте важные новости МОСТ и эксклюзивные материалы первыми
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Email для пресс-релизов"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-construction-500 focus:border-transparent"
                />
                <button className="px-6 py-3 bg-construction-600 text-white font-semibold rounded-xl hover:bg-construction-700 transition-colors">
                  Подписаться
                </button>
              </div>
              
              <p className="text-sm text-slate-500 mt-4">
                Только важные новости, никакого спама. Отписаться можно в любой момент.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default PressPage; 