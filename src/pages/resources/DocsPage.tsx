import { useState } from 'react';
import PageLayout from '../../components/shared/PageLayout';
import { 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
  PlayCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const DocsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      title: 'Быстрый старт',
      icon: PlayCircleIcon,
      description: 'Начните работу с ProHelper за 5 минут',
      items: [
        'Регистрация и первый вход',
        'Создание первого проекта',
        'Добавление участников команды',
        'Настройка уведомлений'
      ]
    },
    {
      title: 'Руководство пользователя',
      icon: BookOpenIcon,
      description: 'Полное руководство по всем функциям системы',
      items: [
        'Управление проектами',
        'Планирование задач',
        'Контроль бюджета',
        'Отчетность и аналитика',
        'Управление документами',
        'Работа с командой'
      ]
    },
    {
      title: 'API документация',
      icon: CodeBracketIcon,
      description: 'Техническая документация для разработчиков',
      items: [
        'Аутентификация',
        'Endpoints справочник',
        'Примеры запросов',
        'SDK и библиотеки',
        'Webhooks',
        'Rate limiting'
      ]
    },
    {
      title: 'Интеграции',
      icon: WrenchScrewdriverIcon,
      description: 'Подключение к внешним системам',
      items: [
        'Интеграция с 1C',
        'Подключение к AutoCAD',
        'Синхронизация с Google Drive',
        'Настройка Telegram Bot',
        'Webhooks для CRM',
        'Пользовательские интеграции'
      ]
    },
    {
      title: 'FAQ',
      icon: QuestionMarkCircleIcon,
      description: 'Ответы на часто задаваемые вопросы',
      items: [
        'Общие вопросы',
        'Тарифы и оплата',
        'Техническая поддержка',
        'Безопасность данных',
        'Мобильное приложение',
        'Импорт/экспорт данных'
      ]
    }
  ];

  const quickLinks = [
    { title: 'Создание проекта', href: '/docs/projects/create' },
    { title: 'Добавление задач', href: '/docs/tasks/add' },
    { title: 'Настройка ролей', href: '/docs/users/roles' },
    { title: 'Генерация отчетов', href: '/docs/reports/generate' },
    { title: 'API ключи', href: '/docs/api/keys' },
    { title: 'Мобильное приложение', href: '/docs/mobile/setup' }
  ];

  return (
    <PageLayout 
      title="Документация" 
      subtitle="Полная база знаний по работе с ProHelper"
    >
      <div className="mb-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100 mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative mb-8">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-steel-400" />
              <input
                type="text"
                placeholder="Поиск по документации..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-concrete-200 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-transparent"
              />
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-steel-900 mb-4">Что вы хотите узнать?</h2>
              <p className="text-steel-600">Найдите ответы на ваши вопросы в нашей базе знаний</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-construction-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-construction-600" />
                      </div>
                      <h3 className="text-xl font-bold text-steel-900">{section.title}</h3>
                    </div>
                    <p className="text-steel-600 mb-6">{section.description}</p>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2 text-steel-700 hover:text-construction-600 cursor-pointer transition-colors">
                          <ChevronRightIcon className="w-4 h-4 text-steel-400" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100 mb-8">
              <h3 className="text-lg font-bold text-steel-900 mb-4">Быстрые ссылки</h3>
              <div className="space-y-3">
                {quickLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.href}
                    className="flex items-center justify-between text-steel-700 hover:text-construction-600 transition-colors"
                  >
                    <span className="text-sm">{link.title}</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-construction-600 to-safety-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Нужна помощь?</h3>
              <p className="text-sm opacity-90 mb-4">
                Не нашли ответ на свой вопрос? Обратитесь к нашей службе поддержки
              </p>
              <div className="space-y-2">
                <button className="w-full bg-white text-construction-600 font-semibold py-2 rounded-lg hover:shadow-lg transition-all text-sm">
                  Связаться с поддержкой
                </button>
                <button className="w-full border-2 border-white text-white font-semibold py-2 rounded-lg hover:bg-white hover:text-construction-600 transition-all text-sm">
                  Запросить звонок
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100 mt-8">
              <h3 className="text-lg font-bold text-steel-900 mb-4">Обучающие материалы</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-construction-100 rounded-lg flex items-center justify-center">
                    <PlayCircleIcon className="w-4 h-4 text-construction-600" />
                  </div>
                  <div>
                    <div className="font-medium text-steel-900 text-sm">Видеоуроки</div>
                    <div className="text-xs text-steel-500">15 уроков</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-safety-100 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4 text-safety-600" />
                  </div>
                  <div>
                    <div className="font-medium text-steel-900 text-sm">PDF-руководства</div>
                    <div className="text-xs text-steel-500">8 документов</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-earth-100 rounded-lg flex items-center justify-center">
                    <CodeBracketIcon className="w-4 h-4 text-earth-600" />
                  </div>
                  <div>
                    <div className="font-medium text-steel-900 text-sm">Примеры кода</div>
                    <div className="text-xs text-steel-500">25 примеров</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-steel-900 mb-4">Популярные статьи</h2>
            <p className="text-steel-600">Самые востребованные материалы нашей документации</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Создание и управление проектами', category: 'Руководство', readTime: '5 мин' },
              { title: 'Настройка интеграции с 1C', category: 'Интеграции', readTime: '10 мин' },
              { title: 'Работа с API ProHelper', category: 'Разработчикам', readTime: '15 мин' },
              { title: 'Мобильное приложение: первые шаги', category: 'Мобильное', readTime: '7 мин' },
              { title: 'Настройка ролей и прав доступа', category: 'Администрирование', readTime: '8 мин' },
              { title: 'Генерация отчетов и аналитика', category: 'Отчетность', readTime: '12 мин' }
            ].map((article, index) => (
              <div key={index} className="border border-concrete-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-1 bg-construction-100 text-construction-800 rounded text-xs font-medium">
                    {article.category}
                  </span>
                  <span className="text-xs text-steel-500">{article.readTime}</span>
                </div>
                <h3 className="font-semibold text-steel-900 text-sm">{article.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DocsPage; 