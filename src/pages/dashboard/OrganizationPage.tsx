import { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { organizationService, Organization, OrganizationUpdateData } from '@utils/api';
import { useDaData } from '@hooks/useDaData';
import AutocompleteInput from '@components/shared/AutocompleteInput';
import VerificationRecommendations from '@components/dashboard/VerificationRecommendations';

const OrganizationPage = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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
      if (response.success && response.data.organization) {
        setOrganization(response.data.organization);
        setFormData({
          name: response.data.organization.name,
          legal_name: response.data.organization.legal_name || '',
          tax_number: response.data.organization.tax_number || '',
          registration_number: response.data.organization.registration_number || '',
          phone: response.data.organization.phone || '',
          email: response.data.organization.email || '',
          address: response.data.organization.address || '',
          city: response.data.organization.city || '',
          postal_code: response.data.organization.postal_code || '',
          country: response.data.organization.country || 'Россия',
          description: response.data.organization.description || ''
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных организации:', error);
      toast.error('Не удалось загрузить данные организации');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrganizationUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const response = await organizationService.update(formData);
      if (response.success && response.data.organization) {
        setOrganization(response.data.organization);
        setIsEditing(false);
        setRecommendationsKey(prev => prev + 1);
        toast.success('Данные организации обновлены');
      }
    } catch (error) {
      console.error('Ошибка обновления организации:', error);
      toast.error('Не удалось обновить данные организации');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerification = async () => {
    if (!organization) return;
    
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

  const handleAddressSearch = async (query: string) => {
    try {
      const results = await searchAddresses(query);
      return results.map(item => ({
        value: item.value,
        label: item.value,
        data: item.data
      }));
    } catch (error) {
      console.error('Ошибка поиска адресов:', error);
      return [];
    }
  };

  const handleAddressSelect = (value: string, data?: any) => {
    handleInputChange('address', value);
    if (data) {
      if (data.city) {
        handleInputChange('city', data.city);
      }
      if (data.postal_code) {
        handleInputChange('postal_code', data.postal_code);
      }
    }
  };

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'partially_verified':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'needs_review':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partially_verified':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'needs_review':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-construction-600"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Организация не найдена</h3>
        <p className="mt-1 text-sm text-gray-500">
          Не удалось загрузить данные вашей организации
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление организацией</h1>
          <p className="mt-2 text-gray-600">
            Просматривайте и редактируйте информацию о вашей организации
          </p>
        </div>
        <div className="flex space-x-3">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-construction-300 text-sm font-medium rounded-xl text-construction-700 bg-white hover:bg-construction-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-construction-500 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Редактировать
            </button>
          )}
          {organization.verification.can_be_verified && (
            <button
              onClick={handleVerification}
              disabled={isVerifying}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-construction-500 to-construction-600 text-white text-sm font-medium rounded-xl hover:shadow-construction transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              {isVerifying ? 'Проверяется...' : 'Запустить верификацию'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-2xl border border-gray-200">
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">{organization.name}</h2>
                <p className="text-sm text-gray-500">{organization.legal_name || 'Юридическое наименование не указано'}</p>
              </div>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getVerificationStatusColor(organization.verification.verification_status)}`}>
              {getVerificationStatusIcon(organization.verification.verification_status)}
              <span className="ml-2">{organization.verification.verification_status_text}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          {organization.verification.verification_score > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Рейтинг верификации</span>
                <span className="text-lg font-bold text-construction-600">{organization.verification.verification_score}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-construction-500 to-construction-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${organization.verification.verification_score}%` }}
                ></div>
              </div>
              {organization.verification.verification_notes && (
                <p className="mt-2 text-sm text-gray-600">{organization.verification.verification_notes}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название организации</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                    placeholder="Введите название организации"
                  />
                ) : (
                  <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{organization.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Юридическое наименование</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.legal_name || ''}
                    onChange={(e) => handleInputChange('legal_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                    placeholder="Полное юридическое наименование"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-900">{organization.legal_name || 'Не указано'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ИНН</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.tax_number || ''}
                    onChange={(e) => handleInputChange('tax_number', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                    placeholder="10 или 12 цифр"
                    maxLength={12}
                  />
                ) : (
                  <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl">
                    <IdentificationIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{organization.tax_number || 'Не указан'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ОГРН</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.registration_number || ''}
                    onChange={(e) => handleInputChange('registration_number', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                    placeholder="13 или 15 цифр"
                    maxLength={15}
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-900">{organization.registration_number || 'Не указан'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                    placeholder="+7(999)123-45-67"
                  />
                ) : (
                  <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{organization.phone || 'Не указан'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                    placeholder="company@example.com"
                  />
                ) : (
                  <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{organization.email || 'Не указан'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
                {isEditing ? (
                  <AutocompleteInput
                    value={formData.address || ''}
                    onChange={handleAddressSelect}
                    onSearch={handleAddressSearch}
                    placeholder="Начните вводить адрес"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                  />
                ) : (
                  <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{organization.address || 'Не указан'}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                      placeholder="Москва"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-900">{organization.city || 'Не указан'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Индекс</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.postal_code || ''}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                      placeholder="123456"
                      maxLength={6}
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-900">{organization.postal_code || 'Не указан'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание деятельности</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
                  placeholder="Краткое описание деятельности организации"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: organization.name,
                      legal_name: organization.legal_name || '',
                      tax_number: organization.tax_number || '',
                      registration_number: organization.registration_number || '',
                      phone: organization.phone || '',
                      email: organization.email || '',
                      address: organization.address || '',
                      city: organization.city || '',
                      postal_code: organization.postal_code || '',
                      country: organization.country || 'Россия',
                      description: organization.description || ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-construction-500 transition-colors"
                >
                  Отменить
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-gradient-to-r from-construction-500 to-construction-600 text-white text-sm font-medium rounded-xl hover:shadow-construction transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Рекомендации по верификации */}
      <VerificationRecommendations 
        key={recommendationsKey}
        organizationId={organization.id}
        onRecommendationsLoad={(recommendations) => {
          console.log('Рекомендации загружены:', recommendations);
        }}
      />
    </div>
  );
};

export default OrganizationPage; 