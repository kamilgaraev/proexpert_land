import PageLayout from '../../components/shared/PageLayout';
import { 
  DocumentTextIcon,
  CalendarDaysIcon,
  UserIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const BlogPage = () => {
  const categories = [
    { name: 'Управление проектами', count: 15, color: 'construction' },
    { name: 'Технологии', count: 12, color: 'safety' },
    { name: 'Кейсы клиентов', count: 8, color: 'earth' },
    { name: 'Обновления', count: 6, color: 'steel' }
  ];

  const featuredPost = {
    title: 'Как цифровизация изменила строительную отрасль в 2024 году',
    excerpt: 'Обзор ключевых трендов и технологий, которые трансформируют способы управления строительными проектами',
    author: 'Алексей Петров',
    date: '15 января 2024',
    category: 'Управление проектами',
    readTime: '8 мин',
    image: '/api/placeholder/600/300'
  };

  const posts = [
    {
      title: '10 ошибок в управлении строительными проектами',
      excerpt: 'Разбираем самые частые ошибки и способы их избежать',
      author: 'Мария Сидорова',
      date: '12 января 2024',
      category: 'Управление проектами',
      readTime: '6 мин'
    },
    {
      title: 'Интеграция BIM с системами управления проектами',
      excerpt: 'Как совместить 3D моделирование с планированием работ',
      author: 'Дмитрий Козлов',
      date: '10 января 2024',
      category: 'Технологии',
      readTime: '12 мин'
    },
    {
      title: 'Кейс: Экономия 2.5 млн рублей на проекте ЖК "Северный"',
      excerpt: 'История успешного внедрения ProHelper в крупном жилом комплексе',
      author: 'Елена Волкова',
      date: '8 января 2024',
      category: 'Кейсы клиентов',
      readTime: '10 мин'
    },
    {
      title: 'Мобильное приложение ProHelper 2.0',
      excerpt: 'Обзор новых возможностей и улучшений в последней версии',
      author: 'Игорь Смирнов',
      date: '5 января 2024',
      category: 'Обновления',
      readTime: '4 мин'
    },
    {
      title: 'Безопасность данных в строительстве',
      excerpt: 'Как защитить конфиденциальную информацию проектов',
      author: 'Анна Николаева',
      date: '3 января 2024',
      category: 'Технологии',
      readTime: '7 мин'
    },
    {
      title: 'Автоматизация отчетности для прорабов',
      excerpt: 'Сокращаем время на бумажную работу в 3 раза',
      author: 'Петр Иванов',
      date: '1 января 2024',
      category: 'Управление проектами',
      readTime: '5 мин'
    }
  ];

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'construction': return 'bg-construction-100 text-construction-800';
      case 'safety': return 'bg-safety-100 text-safety-800';
      case 'earth': return 'bg-earth-100 text-earth-800';
      case 'steel': return 'bg-steel-100 text-steel-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout 
      title="Блог ProHelper" 
      subtitle="Экспертные статьи о строительстве и управлении проектами"
    >
      <div className="mb-16">
        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-concrete-100 mb-12">
              <div className="h-64 bg-gradient-to-r from-construction-500 to-safety-500 flex items-center justify-center">
                <DocumentTextIcon className="w-24 h-24 text-white opacity-50" />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-construction-100 text-construction-800 rounded-full text-sm font-medium">
                    {featuredPost.category}
                  </span>
                  <div className="flex items-center gap-2 text-steel-500 text-sm">
                    <CalendarDaysIcon className="w-4 h-4" />
                    {featuredPost.date}
                  </div>
                  <div className="text-steel-500 text-sm">{featuredPost.readTime}</div>
                </div>
                <h2 className="text-2xl font-bold text-steel-900 mb-4">{featuredPost.title}</h2>
                <p className="text-steel-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-steel-400" />
                    <span className="text-steel-600">{featuredPost.author}</span>
                  </div>
                  <button className="flex items-center gap-2 text-construction-600 hover:text-construction-700 font-medium">
                    Читать далее
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {posts.map((post, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-1 bg-steel-100 text-steel-800 rounded text-xs font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1 text-steel-500 text-xs">
                      <CalendarDaysIcon className="w-3 h-3" />
                      {post.date}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-steel-900 mb-3">{post.title}</h3>
                  <p className="text-steel-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-steel-500">
                      <UserIcon className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="text-xs text-steel-500">{post.readTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100 mb-8">
              <h3 className="text-lg font-bold text-steel-900 mb-6">Категории</h3>
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-steel-700">{category.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category.color)}`}>
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-construction-600 to-safety-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Подпишитесь на рассылку</h3>
              <p className="text-sm opacity-90 mb-4">
                Получайте свежие статьи и новости индустрии первыми
              </p>
              <div className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Ваш email"
                  className="w-full px-3 py-2 rounded-lg text-steel-900 text-sm"
                />
                <button className="w-full bg-white text-construction-600 font-semibold py-2 rounded-lg hover:shadow-lg transition-all text-sm">
                  Подписаться
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-concrete-100 mt-8">
              <h3 className="text-lg font-bold text-steel-900 mb-6">Популярные теги</h3>
              <div className="flex flex-wrap gap-2">
                {['BIM', 'Управление проектами', 'Цифровизация', 'Планирование', 'Контроль качества', 'Безопасность', 'ROI', 'Автоматизация'].map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-concrete-100 text-steel-700 rounded-full text-xs hover:bg-construction-100 hover:text-construction-800 cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button className="px-8 py-3 bg-construction-600 text-white font-semibold rounded-lg hover:bg-construction-700 transition-colors">
            Загрузить еще статьи
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default BlogPage; 