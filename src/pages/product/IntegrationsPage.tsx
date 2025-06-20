import PageLayout from '../../components/shared/PageLayout';
import { 
  CogIcon, 
  CloudIcon, 
  DevicePhoneMobileIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const IntegrationsPage = () => {
  const integrations = [
    {
      category: 'ERP системы',
      icon: BuildingOfficeIcon,
      items: [
        { name: '1C:Предприятие', description: 'Синхронизация финансовых данных и отчетности', status: 'Доступно' },
        { name: 'SAP', description: 'Интеграция с корпоративными системами', status: 'Доступно' },
        { name: 'Oracle ERP', description: 'Управление ресурсами предприятия', status: 'В разработке' },
        { name: 'Microsoft Dynamics', description: 'Комплексное управление бизнесом', status: 'Планируется' }
      ]
    },
    {
      category: 'CAD системы',
      icon: CogIcon,
      items: [
        { name: 'AutoCAD', description: 'Импорт чертежей и 3D моделей', status: 'Доступно' },
        { name: 'Revit', description: 'BIM интеграция для полного цикла', status: 'Доступно' },
        { name: 'ArchiCAD', description: 'Архитектурное проектирование', status: 'Доступно' },
        { name: 'SketchUp', description: '3D моделирование объектов', status: 'В разработке' }
      ]
    },
    {
      category: 'Облачные сервисы',
      icon: CloudIcon,
      items: [
        { name: 'Google Drive', description: 'Хранение документов и фотоотчетов', status: 'Доступно' },
        { name: 'Dropbox Business', description: 'Корпоративное файловое хранилище', status: 'Доступно' },
        { name: 'OneDrive', description: 'Интеграция с Microsoft 365', status: 'Доступно' },
        { name: 'Яндекс.Диск', description: 'Российское облачное хранилище', status: 'Доступно' }
      ]
    },
    {
      category: 'Мобильные приложения',
      icon: DevicePhoneMobileIcon,
      items: [
        { name: 'WhatsApp Business', description: 'Уведомления и быстрая связь', status: 'Доступно' },
        { name: 'Telegram Bot', description: 'Автоматические отчеты в Telegram', status: 'Доступно' },
        { name: 'SMS-рассылка', description: 'Уведомления по SMS', status: 'Доступно' },
        { name: 'Push-уведомления', description: 'Мгновенные уведомления в приложении', status: 'Доступно' }
      ]
    },
    {
      category: 'Аналитика',
      icon: ChartBarIcon,
      items: [
        { name: 'Google Analytics', description: 'Аналитика использования системы', status: 'Доступно' },
        { name: 'Яндекс.Метрика', description: 'Российская система аналитики', status: 'Доступно' },
        { name: 'Power BI', description: 'Продвинутая бизнес-аналитика', status: 'В разработке' },
        { name: 'Tableau', description: 'Визуализация данных проектов', status: 'Планируется' }
      ]
    },
    {
      category: 'Документооборот',
      icon: DocumentTextIcon,
      items: [
        { name: 'DocuSign', description: 'Электронная подпись документов', status: 'Доступно' },
        { name: 'Контур.Диадок', description: 'Российский ЭДО', status: 'Доступно' },
        { name: 'СБИС', description: 'Электронный документооборот', status: 'В разработке' },
        { name: 'Директум', description: 'Система управления документами', status: 'Планируется' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Доступно': return 'bg-green-100 text-green-800';
      case 'В разработке': return 'bg-yellow-100 text-yellow-800';
      case 'Планируется': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout 
      title="Интеграции" 
      subtitle="Подключите ProHelper к вашим любимым инструментам"
      seoPage="integrations"
    >
      <div className="mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100">
            <div className="w-12 h-12 bg-construction-100 rounded-xl flex items-center justify-center mb-6">
              <CogIcon className="w-6 h-6 text-construction-600" />
            </div>
            <h3 className="text-xl font-bold text-steel-900 mb-4">200+ интеграций</h3>
            <p className="text-steel-600">Подключайтесь к популярным системам одним кликом</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100">
            <div className="w-12 h-12 bg-safety-100 rounded-xl flex items-center justify-center mb-6">
              <CloudIcon className="w-6 h-6 text-safety-600" />
            </div>
            <h3 className="text-xl font-bold text-steel-900 mb-4">API первого класса</h3>
            <p className="text-steel-600">Создавайте собственные интеграции с нашим REST API</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-concrete-100">
            <div className="w-12 h-12 bg-earth-100 rounded-xl flex items-center justify-center mb-6">
              <BuildingOfficeIcon className="w-6 h-6 text-earth-600" />
            </div>
            <h3 className="text-xl font-bold text-steel-900 mb-4">Безопасность</h3>
            <p className="text-steel-600">Все данные передаются по защищенным каналам связи</p>
          </div>
        </div>

        {integrations.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <div key={index} className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-steel-900">{category.category}</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-white rounded-xl p-6 shadow-md border border-concrete-100 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
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
          <h3 className="text-2xl font-bold mb-4">Не нашли нужную интеграцию?</h3>
          <p className="text-lg mb-6 opacity-90">
            Свяжитесь с нами, и мы рассмотрим возможность добавления интеграции с вашей системой
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-construction-600 font-semibold rounded-lg hover:shadow-lg transition-all">
              Запросить интеграцию
            </button>
            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-construction-600 transition-all">
              Посмотреть API
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default IntegrationsPage; 