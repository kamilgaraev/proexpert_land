import { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { SEOHead } from '@components/shared/SEOHead';

interface HoldingData {
  holding: {
    id: number;
    name: string;
    slug: string;
    description: string;
  };
  stats: {
    total_child_organizations: number;
    total_users: number;
    total_projects: number;
    total_contracts_value: number;
  };
}

const HoldingLandingPage = () => {
  const [holdingData, setHoldingData] = useState<HoldingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHoldingData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/');
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные холдинга');
        }
        const data = await response.json();
        if (data.success) {
          setHoldingData(data.data);
        } else {
          throw new Error(data.message || 'Ошибка загрузки данных');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldingData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных холдинга...</p>
        </div>
      </div>
    );
  }

  if (error || !holdingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Холдинг не найден</h1>
          <p className="text-gray-600">{error || 'Данные холдинга недоступны'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${holdingData.holding.name} - Холдинг`}
        description={holdingData.holding.description}
        keywords={`${holdingData.holding.name}, холдинг, строительство, организация`}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {holdingData.holding.name}
                  </h1>
                  <p className="text-sm text-gray-600">Холдинговая структура</p>
                </div>
              </div>
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Панель управления
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {holdingData.holding.name}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {holdingData.holding.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {holdingData.stats.total_child_organizations}
                </h3>
                <p className="text-gray-600">Компаний в холдинге</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                  <UsersIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {holdingData.stats.total_users}
                </h3>
                <p className="text-gray-600">Сотрудников</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                  <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {holdingData.stats.total_projects}
                </h3>
                <p className="text-gray-600">Проектов в работе</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
                  <BanknotesIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(holdingData.stats.total_contracts_value)}
                </h3>
                <p className="text-gray-600">Объем договоров</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  О нашем холдинге
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  {holdingData.holding.description}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <span className="text-gray-700">Современное управление проектами</span>
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="h-6 w-6 text-green-600 mr-3" />
                    <span className="text-gray-700">Квалифицированная команда специалистов</span>
                  </div>
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-6 w-6 text-purple-600 mr-3" />
                    <span className="text-gray-700">Полный цикл реализации проектов</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
                  <h4 className="text-2xl font-bold mb-4">Ключевые показатели</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-blue-100">Компаний</p>
                      <p className="text-3xl font-bold">{holdingData.stats.total_child_organizations}</p>
                    </div>
                    <div>
                      <p className="text-blue-100">Проектов</p>
                      <p className="text-3xl font-bold">{holdingData.stats.total_projects}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-400 mr-3" />
                  <span className="text-xl font-bold">{holdingData.holding.name}</span>
                </div>
                <p className="text-gray-400">
                  {holdingData.holding.description}
                </p>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold mb-4">Наши показатели</h5>
                <div className="space-y-2 text-gray-400">
                  <p>{holdingData.stats.total_child_organizations} компаний в холдинге</p>
                  <p>{holdingData.stats.total_users} квалифицированных сотрудников</p>
                  <p>{holdingData.stats.total_projects} проектов в работе</p>
                </div>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold mb-4">Управление</h5>
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Панель управления холдингом
                </a>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 {holdingData.holding.name}. Управляется через ProHelper.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HoldingLandingPage; 