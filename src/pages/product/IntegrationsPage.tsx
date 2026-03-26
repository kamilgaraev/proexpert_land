import PageLayout from '../../components/shared/PageLayout';
import {
  BuildingOfficeIcon,
  CloudIcon,
  CogIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

type IntegrationStatus = 'Базовый контур' | 'Базовый этап' | 'По запросу';

interface IntegrationItem {
  name: string;
  description: string;
  status: IntegrationStatus;
}

interface IntegrationCategory {
  category: string;
  icon: typeof BuildingOfficeIcon;
  items: IntegrationItem[];
}

const integrationCategories: IntegrationCategory[] = [
  {
    category: 'Обмен данными',
    icon: BuildingOfficeIcon,
    items: [
      {
        name: 'API и webhooks',
        description: 'Обсуждаем обмен событиями и данными по согласованному сценарию.',
        status: 'По запросу',
      },
      {
        name: 'Выгрузки и загрузки',
        description: 'CSV, Excel и другие форматы для операционного обмена данными.',
        status: 'По запросу',
      },
      {
        name: 'Проектный контур',
        description: 'Подбираем маршрут обмена под ваш процесс и набор систем.',
        status: 'По запросу',
      },
    ],
  },
  {
    category: 'Документы и файлы',
    icon: CogIcon,
    items: [
      {
        name: 'Чертежи и вложения',
        description: 'Работаем с файлами в контексте проекта, а не через разрозненные переписки.',
        status: 'Базовый контур',
      },
      {
        name: 'Версионирование',
        description: 'Фиксируем актуальность документов и маршрут их согласования.',
        status: 'Базовый контур',
      },
      {
        name: 'Подключение внешних источников',
        description: 'Если нужен обмен со сторонним архивом или хранилищем, проектируем его отдельно.',
        status: 'По запросу',
      },
    ],
  },
  {
    category: 'Уведомления и внешние сценарии',
    icon: CloudIcon,
    items: [
      {
        name: 'Почта и нотификации',
        description: 'Сценарии оповещений и служебных уведомлений обсуждаем на этапе настройки.',
        status: 'По запросу',
      },
      {
        name: 'Мессенджеры и боты',
        description: 'Если нужен отдельный канал оповещений, оцениваем его как пилотное расширение.',
        status: 'По запросу',
      },
      {
        name: 'Проектные автоматизации',
        description: 'Не публикуем каталог готовых коннекторов: расширения делаем под реальный запрос команды.',
        status: 'По запросу',
      },
    ],
  },
  {
    category: 'Проектное внедрение',
    icon: DevicePhoneMobileIcon,
    items: [
      {
        name: 'Оценка текущего процесса',
        description: 'На старте сверяем, где нужен реальный обмен, а где достаточно внутреннего контура ProHelper.',
        status: 'Базовый этап',
      },
      {
        name: 'Пилот для расширений',
        description: 'Если нужен нетиповой сценарий, выносим его в отдельный пилот.',
        status: 'По запросу',
      },
      {
        name: 'Корпоративное расширение',
        description: 'Для сложной схемы обмена договариваемся об объеме и ответственном сценарии внедрения.',
        status: 'По запросу',
      },
    ],
  },
];

const getStatusColor = (status: IntegrationStatus) => {
  switch (status) {
    case 'Базовый контур':
      return 'bg-green-100 text-green-800';
    case 'Базовый этап':
      return 'bg-blue-100 text-blue-800';
    case 'По запросу':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const IntegrationsPage = () => {
  return (
    <PageLayout
      title="Интеграции и расширения"
      subtitle="Не обещаем каталог несуществующих коннекторов: обсуждаем только реальный сценарий обмена."
      seoPage="integrations"
      showFooter={false}
    >
      <div className="mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100">
            <div className="w-12 h-12 bg-construction-100 rounded-xl flex items-center justify-center mb-6">
              <CogIcon className="w-6 h-6 text-construction-600" />
            </div>
            <h3 className="text-xl font-bold text-steel-900 mb-4">Честный контур</h3>
            <p className="text-steel-600">
              Публично не заявляем интеграции, которых у нас нет в продукте или в подтвержденном плане.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100">
            <div className="w-12 h-12 bg-safety-100 rounded-xl flex items-center justify-center mb-6">
              <CloudIcon className="w-6 h-6 text-safety-600" />
            </div>
            <h3 className="text-xl font-bold text-steel-900 mb-4">Проектная проработка</h3>
            <p className="text-steel-600">
              Сначала сверяем бизнес-сценарий, потом выбираем формат обмена или пилотного расширения.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100">
            <div className="w-12 h-12 bg-earth-100 rounded-xl flex items-center justify-center mb-6">
              <BuildingOfficeIcon className="w-6 h-6 text-earth-600" />
            </div>
            <h3 className="text-xl font-bold text-steel-900 mb-4">Запуск без мусора</h3>
            <p className="text-steel-600">
              Не натягиваем на продукт все внешние системы сразу: оставляем только то, что дает пользу процессу.
            </p>
          </div>
        </div>

        {integrationCategories.map((category) => {
          const IconComponent = category.icon;

          return (
            <div key={category.category} className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-steel-900">{category.category}</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {category.items.map((item) => (
                  <div
                    key={`${category.category}-${item.name}`}
                    className="bg-white rounded-xl p-6 shadow-md border border-concrete-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <h3 className="text-lg font-semibold text-steel-900">{item.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-steel-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="bg-gradient-to-r from-construction-600 to-safety-600 rounded-2xl p-8 text-center text-white mt-16">
          <h3 className="text-2xl font-bold mb-4">Нужен нетиповой сценарий?</h3>
          <p className="text-lg mb-6 opacity-90">
            Разберем текущий процесс, честно скажем, что можно запустить сейчас, а что требует отдельной проработки.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-8 py-3 bg-white text-construction-600 font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Обсудить сценарий
            </a>
            <a
              href="/security"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-construction-600 transition-all"
            >
              Безопасность и доступ
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default IntegrationsPage;
