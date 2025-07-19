import { 
  ChartPieIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  EyeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAdminAuth } from '@hooks/useAdminAuth';

const stats = [
  {
    id: 1,
    name: 'Записи в блоге',
    value: '24',
    change: '+12%',
    changeType: 'increase',
    icon: DocumentTextIcon,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  {
    id: 2,
    name: 'Активные вакансии',
    value: '8',
    change: '+4%',
    changeType: 'increase',
    icon: BriefcaseIcon,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600'
  },
  {
    id: 3,
    name: 'Зарегистрированных пользователей',
    value: '1,247',
    change: '+18%',
    changeType: 'increase',
    icon: UsersIcon,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  {
    id: 4,
    name: 'Просмотры за неделю',
    value: '12,459',
    change: '-2%',
    changeType: 'decrease',
    icon: EyeIcon,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
];

const quickActions = [
  {
    title: 'Создать пост',
    description: 'Опубликуйте новую запись в блоге',
    href: '/admin/blog/new',
    icon: DocumentTextIcon,
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700'
  },
  {
    title: 'Добавить вакансию',
    description: 'Откройте новую позицию для найма',
    href: '/admin/vacancies/new',
    icon: BriefcaseIcon,
    color: 'from-emerald-500 to-emerald-600',
    hoverColor: 'hover:from-emerald-600 hover:to-emerald-700'
  },
  {
    title: 'Управление пользователями',
    description: 'Просмотрите список админ-пользователей',
    href: '/admin/users',
    icon: UsersIcon,
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'hover:from-purple-600 hover:to-purple-700'
  },
  {
    title: 'Управление проектами',
    description: 'Контроль и мониторинг проектов',
    href: '/admin/projects',
    icon: BuildingOfficeIcon,
    color: 'from-indigo-500 to-indigo-600',
    hoverColor: 'hover:from-indigo-600 hover:to-indigo-700'
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'blog',
    title: 'Новый пост "Автоматизация строительных процессов"',
    time: '2 часа назад',
    status: 'published',
    icon: DocumentTextIcon
  },
  {
    id: 2,
    type: 'user',
    title: 'Зарегистрирован новый пользователь: ООО "СтройИнвест"',
    time: '4 часа назад',
    status: 'active',
    icon: UsersIcon
  },
  {
    id: 3,
    type: 'vacancy',
    title: 'Опубликована вакансия "Senior React Developer"',
    time: '1 день назад',
    status: 'pending',
    icon: BriefcaseIcon
  },
  {
    id: 4,
    type: 'project',
    title: 'Проект "Жилой комплекс Москва-Сити" обновлен',
    time: '2 дня назад',
    status: 'updated',
    icon: BuildingOfficeIcon
  }
];

const ActionCard = ({ title, description, href, icon: Icon, color, hoverColor }: any) => (
  <a
    href={href}
    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 text-white shadow-lg transition-all duration-300 ${hoverColor} hover:shadow-xl hover:scale-105`}
  >
    <div className="absolute top-4 right-4 opacity-20">
      <Icon className="h-12 w-12" />
    </div>
    <div className="relative">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/80 leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center text-sm font-medium">
        <span>Перейти</span>
        <PlusIcon className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
      </div>
    </div>
  </a>
);

const AdminDashboardPage: React.FC = () => {
  const { admin } = useAdminAuth();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'updated':
        return <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Добро пожаловать, {admin?.name || 'Администратор'}! 👋
            </h1>
            <p className="text-indigo-200 text-lg">
              Обзор системы и быстрый доступ к основным функциям
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <ChartPieIcon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center`}>
                <item.icon className={`h-6 w-6 ${item.textColor}`} />
              </div>
              <div className="flex items-center text-sm">
                {item.changeType === 'increase' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={item.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'}>
                  {item.change}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Быстрые действия</h2>
            <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <ActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Последняя активность</h2>
            <ClockIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-5">
                      {activity.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {getStatusIcon(activity.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <a 
              href="/admin/activity" 
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              Посмотреть всю активность
              <ArrowTrendingUpIcon className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Статус системы</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-emerald-50 rounded-xl">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-emerald-900">API сервис</p>
              <p className="text-xs text-emerald-600">Работает стабильно</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-emerald-50 rounded-xl">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-emerald-900">База данных</p>
              <p className="text-xs text-emerald-600">Подключена</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-yellow-50 rounded-xl">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-yellow-900">Резервное копирование</p>
              <p className="text-xs text-yellow-600">Выполняется</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 