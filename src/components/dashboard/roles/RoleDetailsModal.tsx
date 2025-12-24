import React from 'react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import { RoleComparison } from '@utils/api';
import { ComputerDesktopIcon, DevicePhoneMobileIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface RoleDetailsModalProps {
  isOpen: boolean;
  role: RoleComparison | null;
  onClose: () => void;
}

const RoleDetailsModal: React.FC<RoleDetailsModalProps> = ({ isOpen, role, onClose }) => {
  if (!isOpen || !role) return null;

  const getContextColor = (contextSlug: string) => {
    switch (contextSlug) {
      case 'system':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'organization':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'project':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInterfaceIcon = (slug: string) => {
    switch (slug) {
      case 'admin':
        return <ComputerDesktopIcon className="w-5 h-5" />;
      case 'lk':
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'mobile':
        return <DevicePhoneMobileIcon className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const formatTimeRestrictions = (restrictions: RoleComparison['time_restrictions']) => {
    if (!restrictions.has_restrictions) return null;
    const parts = [];
    if (restrictions.working_hours) parts.push(restrictions.working_hours);
    if (restrictions.working_days) parts.push(restrictions.working_days);
    return parts.join(', ') || null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{role.name}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Описание */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Описание</h4>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>

              {/* Основная информация */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Контекст</h4>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getContextColor(role.context_slug)}`}>
                    {role.context}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Slug</h4>
                  <p className="text-sm text-gray-600 font-mono">{role.slug}</p>
                </div>
              </div>

              {/* Интерфейсы */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Интерфейсы</h4>
                <div className="flex flex-wrap gap-2">
                  {role.interfaces_slugs.map((slug, idx) => (
                    <div key={slug} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                      {getInterfaceIcon(slug)}
                      <span className="text-sm">{role.interfaces[idx]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Биллинг */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Доступ к биллингу</h4>
                <div className="flex items-center gap-2">
                  {role.billing_access ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600">Да</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-gray-600">Нет</span>
                    </>
                  )}
                </div>
              </div>

              {/* Управление ролями */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Управление ролями</h4>
                {role.can_manage_roles.length > 0 ? (
                  <div>
                    {role.can_manage_roles.includes('Все роли') ? (
                      <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                        Все роли
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {role.can_manage_roles.map((roleName) => (
                          <span key={roleName} className="inline-flex px-3 py-1 bg-gray-100 rounded-lg text-sm">
                            {roleName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Не может управлять ролями</p>
                )}
                {role.cannot_manage_roles.length > 0 && (
                  <div className="mt-2">
                    <h5 className="text-xs font-semibold text-gray-600 mb-1">Не может управлять:</h5>
                    <div className="flex flex-wrap gap-2">
                      {role.cannot_manage_roles.map((roleName) => (
                        <span key={roleName} className="inline-flex px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                          {roleName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Временные ограничения */}
              {role.time_restrictions.has_restrictions && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Временные ограничения</h4>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {formatTimeRestrictions(role.time_restrictions)}
                    </span>
                  </div>
                </div>
              )}

              {/* Права */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Права доступа</h4>
                <div className="space-y-2">
                  {role.has_all_permissions ? (
                    <div className="flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-yellow-500" />
                      <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                        Все права
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Системные права: </span>
                        <span className="text-sm font-medium">{role.system_permissions_count}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Права модулей: </span>
                        <span className="text-sm font-medium">{role.module_permissions_count}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-600">Всего: </span>
                        <span className="text-sm font-bold">
                          {role.system_permissions_count + role.module_permissions_count}
                        </span>
                      </div>
                    </div>
                  )}
                  {role.has_all_modules && (
                    <div className="mt-2">
                      <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                        Все модули
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailsModal;





