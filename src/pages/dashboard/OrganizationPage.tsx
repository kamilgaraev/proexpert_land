import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  BuildingOfficeIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { organizationService, Organization, OrganizationUpdateData, VerificationRecommendations, UserMessage } from '@utils/api';
import { useDaData } from '@hooks/useDaData';
import AutocompleteInput from '@components/shared/AutocompleteInput';
import VerificationRecommendationsComponent from '@components/dashboard/VerificationRecommendations';

const OrganizationPage = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [recommendations, setRecommendations] = useState<VerificationRecommendations | null>(null);
  const [userMessage, setUserMessage] = useState<UserMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState<OrganizationUpdateData>({});
  const [recommendationsKey, setRecommendationsKey] = useState(0);

  const { searchAddresses } = useDaData();

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const response = await organizationService.getCurrent();
      if (response.success) {
        setOrganization(response.data.organization);
        setRecommendations(response.data.recommendations);
        setUserMessage(response.data.user_message);
        setFormData({
          name: response.data.organization.name || '',
          legal_name: response.data.organization.legal_name || '',
          tax_number: response.data.organization.tax_number || '',
          registration_number: response.data.organization.registration_number || '',
          phone: response.data.organization.phone || '',
          email: response.data.organization.email || '',
          address: response.data.organization.address || '',
          city: response.data.organization.city || '',
          postal_code: response.data.organization.postal_code || '',
          country: response.data.organization.country || 'Россия',
          description: response.data.organization.description || '',
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки организации:', error);
      toast.error('Не удалось загрузить данные организации');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await organizationService.update(formData);
      if (response.success) {
        setOrganization(response.data.organization);
        setRecommendations(response.data.recommendations);
        setUserMessage(response.data.user_message);
        setIsEditing(false);
        setRecommendationsKey(prev => prev + 1);
        toast.success('Данные организации обновлены');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerification = async () => {
    try {
      setIsVerifying(true);
      const response = await organizationService.requestVerification();
      if (response.success && response.data.organization) {
        toast.success('Верификация выполнена успешно');
        await loadOrganization();
        setRecommendationsKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Ошибка верификации:', error);
      toast.error('Не удалось выполнить верификацию');
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'partially_verified':
        return 'text-yellow-600 bg-yellow-100';
      case 'needs_review':
        return 'text-orange-600 bg-orange-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return '🟢';
      case 'partially_verified':
        return '🟡';
      case 'needs_review':
        return '🔴';
      case 'rejected':
        return '⚫';
      default:
        return '⚪';
    }
  };

  const getUserMessageIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getUserMessageColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'info':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const handleAddressSearch = async (query: string) => {
    const results = await searchAddresses(query);
    return results.map(item => ({
      value: item.value,
      label: item.value
    }));
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-construction-600"></div>
      </div>
    );
  }

  if (!organization || !recommendations) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Данные организации не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Сообщение для пользователя */}
      {userMessage && (
        <div className={`rounded-lg border p-4 ${getUserMessageColor(userMessage.type)}`}>
          <div className="flex items-start space-x-3">
            {getUserMessageIcon(userMessage.type)}
            <div className="flex-1">
              <h3 className="font-medium">{userMessage.title}</h3>
              <p className="text-sm mt-1">{userMessage.message}</p>
              {userMessage.action === 'verify' && (
                <button
                  onClick={handleVerification}
                  disabled={isVerifying}
                  className="mt-3 inline-flex items-center px-3 py-1.5 text-sm bg-construction-600 text-white rounded-lg hover:bg-construction-700 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Выполняется...
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-4 w-4 mr-2" />
                      Запустить верификацию
                    </>
                  )}
                </button>
              )}
              {userMessage.action === 'edit' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-3 inline-flex items-center px-3 py-1.5 text-sm bg-construction-600 text-white rounded-lg hover:bg-construction-700"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Редактировать данные
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Основная карточка */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Организация</h1>
                <p className="text-sm text-gray-500">Управление данными и верификация</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Статус:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(recommendations.status)}`}>
                    {getStatusIcon(recommendations.status)} {recommendations.status_text}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">Рейтинг:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-construction-500 to-construction-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${recommendations.current_score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-construction-600">
                      {recommendations.current_score}/{recommendations.max_score}
                    </span>
                  </div>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Редактировать
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название организации
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Полное юридическое наименование
                  </label>
                  <input
                    type="text"
                    value={formData.legal_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, legal_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ИНН
                  </label>
                  <input
                    type="text"
                    value={formData.tax_number || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ОГРН
                  </label>
                  <input
                    type="text"
                    value={formData.registration_number || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес
                  </label>
                  <AutocompleteInput
                    value={formData.address || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                    onSearch={handleAddressSearch}
                    placeholder="Введите адрес организации"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Город
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Почтовый индекс
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание деятельности
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Отменить
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-construction-600 border border-transparent rounded-lg hover:bg-construction-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Сохранить
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Название</label>
                <p className="text-gray-900">{organization.name || 'Не указано'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Юридическое наименование</label>
                <p className="text-gray-900">{organization.legal_name || 'Не указано'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ИНН</label>
                <p className="text-gray-900">{organization.tax_number || 'Не указан'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ОГРН</label>
                <p className="text-gray-900">{organization.registration_number || 'Не указан'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Телефон</label>
                <p className="text-gray-900">{organization.phone || 'Не указан'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{organization.email || 'Не указан'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Адрес</label>
                <p className="text-gray-900">{organization.address || 'Не указан'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Город</label>
                <p className="text-gray-900">{organization.city || 'Не указан'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Почтовый индекс</label>
                <p className="text-gray-900">{organization.postal_code || 'Не указан'}</p>
              </div>
              {organization.description && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Описание деятельности</label>
                  <p className="text-gray-900">{organization.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Рекомендации по верификации */}
      <VerificationRecommendationsComponent 
        key={recommendationsKey}
        organizationId={organization.id}
        onRecommendationsLoad={(recommendations: any) => {
          console.log('Рекомендации загружены:', recommendations);
        }}
        onVerificationRequest={handleVerification}
        isVerifying={isVerifying}
      />
    </div>
  );
};

export default OrganizationPage; 