import { ChartPieIcon, DocumentTextIcon, UsersIcon } from '@heroicons/react/24/solid';
import { useAdminAuth } from '@hooks/useAdminAuth';

const stats = [
  {
    id: 1,
    name: 'Постов в блоге',
    value: '—',
    icon: DocumentTextIcon,
  },
  {
    id: 2,
    name: 'Открытых вакансий',
    value: '—',
    icon: UsersIcon,
  },
  {
    id: 3,
    name: 'Посещаемость (неделя)',
    value: '—',
    icon: ChartPieIcon,
  },
];

const ActionCard = ({ title, description, href }: { title: string; description: string; href: string }) => (
  <a
    href={href}
    className="rounded-2xl border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition-shadow group"
  >
    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </a>
);

const AdminDashboardPage: React.FC = () => {
  const { admin } = useAdminAuth();

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Привет, {admin?.name || 'Администратор'} 👋</h1>
          <p className="mt-1 text-gray-500">Это обзорная панель: быстродоступ к ключевым разделам и статистике.</p>
        </div>
      </header>

      {/* Stats */}
      <section>
        <h2 className="sr-only">Статистика</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200 p-6">
              <dt>
                <item.icon className="h-8 w-8 text-indigo-500" />
                <span className="ml-3 text-sm font-medium text-gray-500">{item.name}</span>
              </dt>
              <dd className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">{item.value}</dd>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
            </div>
          ))}
        </dl>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <ActionCard title="Создать пост" description="Опубликуйте новую запись блога" href="/admin/blog/new" />
          <ActionCard title="Добавить вакансию" description="Откройте новую позицию" href="/admin/vacancies/new" />
          <ActionCard title="Управление пользователями" description="Просмотрите список админ-пользователей" href="/admin/users" />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage; 