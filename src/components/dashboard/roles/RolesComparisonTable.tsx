import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { rolesComparisonService, RoleComparison } from '@utils/api';
import { toast } from 'react-toastify';
import RoleDetailsModal from './RoleDetailsModal';

interface RolesComparisonTableProps {
  onRoleClick?: (role: RoleComparison) => void;
}

const RolesComparisonTable: React.FC<RolesComparisonTableProps> = ({ onRoleClick }) => {
  const [roles, setRoles] = useState<RoleComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleComparison | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Фильтры и поиск
  const [searchTerm, setSearchTerm] = useState('');
  const [contextFilter, setContextFilter] = useState<'all' | 'system' | 'organization' | 'project'>('all');
  const [interfaceFilters, setInterfaceFilters] = useState<string[]>([]);
  const [billingFilter, setBillingFilter] = useState<'all' | 'yes' | 'no'>('all');
  
  // Кеширование
  const CACHE_KEY = 'roles_comparison_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    // Проверяем кеш
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setRoles(data.roles || []);
          setLastUpdated(data.last_updated || null);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Игнорируем ошибки кеша
      }
    }

    setLoading(true);
    setError(null);
    try {
      const response = await rolesComparisonService.getRolesComparison();
      if (response.data.success && response.data.data) {
        const rolesData = response.data.data.roles || [];
        setRoles(rolesData);
        setLastUpdated(response.data.data.last_updated || null);
        
        // Сохраняем в кеш
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: response.data.data,
          timestamp: Date.now()
        }));
      } else {
        throw new Error('Не удалось загрузить данные');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка загрузки данных';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  const getContextLabel = (contextSlug: string) => {
    switch (contextSlug) {
      case 'system':
        return 'Системные роли';
      case 'organization':
        return 'Роли организации';
      case 'project':
        return 'Роли проекта';
      default:
        return contextSlug;
    }
  };

  const getInterfaceIcon = (slug: string) => {
    switch (slug) {
      case 'admin':
        return <ComputerDesktopIcon className="w-4 h-4" />;
      case 'lk':
        return <BuildingOfficeIcon className="w-4 h-4" />;
      case 'mobile':
        return <DevicePhoneMobileIcon className="w-4 h-4" />;
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

  const filteredAndGroupedRoles = useMemo(() => {
    let filtered = roles;

    // Поиск по названию
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(term) ||
        role.description.toLowerCase().includes(term) ||
        role.slug.toLowerCase().includes(term)
      );
    }

    // Фильтр по контексту
    if (contextFilter !== 'all') {
      filtered = filtered.filter(role => role.context_slug === contextFilter);
    }

    // Фильтр по интерфейсам
    if (interfaceFilters.length > 0) {
      filtered = filtered.filter(role => 
        interfaceFilters.some(iface => role.interfaces_slugs.includes(iface))
      );
    }

    // Фильтр по биллингу
    if (billingFilter !== 'all') {
      filtered = filtered.filter(role => 
        billingFilter === 'yes' ? role.billing_access : !role.billing_access
      );
    }

    // Группировка по контексту
    const grouped: Record<string, RoleComparison[]> = {
      system: [],
      organization: [],
      project: []
    };

    filtered.forEach(role => {
      if (grouped[role.context_slug]) {
        grouped[role.context_slug].push(role);
      }
    });

    // Сортировка внутри групп
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    });

    return grouped;
  }, [roles, searchTerm, contextFilter, interfaceFilters, billingFilter]);

  const availableInterfaces = useMemo(() => {
    const interfaces = new Set<string>();
    roles.forEach(role => {
      role.interfaces_slugs.forEach(slug => interfaces.add(slug));
    });
    return Array.from(interfaces);
  }, [roles]);

  const toggleInterfaceFilter = (iface: string) => {
    setInterfaceFilters(prev => 
      prev.includes(iface) 
        ? prev.filter(i => i !== iface)
        : [...prev, iface]
    );
  };

  const handleRoleClick = (role: RoleComparison) => {
    setSelectedRole(role);
    setIsModalOpen(true);
    onRoleClick?.(role);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-medium mb-2">Ошибка загрузки данных</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={loadRoles}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Заголовок и фильтры */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Сравнение ролей</h2>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground mt-1">
                Обновлено: {new Date(lastUpdated).toLocaleString('ru-RU')}
              </p>
            )}
          </div>
        </div>

        {/* Поиск */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по названию роли..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Фильтры */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Фильтры:</span>
          </div>

          {/* Фильтр по контексту */}
          <select
            value={contextFilter}
            onChange={(e) => setContextFilter(e.target.value as any)}
            className="px-3 py-1.5 border rounded-lg text-sm bg-background"
          >
            <option value="all">Все контексты</option>
            <option value="system">Система</option>
            <option value="organization">Организация</option>
            <option value="project">Проект</option>
          </select>

          {/* Фильтр по интерфейсам */}
          <div className="flex flex-wrap gap-2">
            {availableInterfaces.map(iface => (
              <label key={iface} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={interfaceFilters.includes(iface)}
                  onChange={() => toggleInterfaceFilter(iface)}
                  className="rounded"
                />
                <span className="text-sm">{iface === 'admin' ? 'Админ' : iface === 'lk' ? 'ЛК' : 'Моб'}</span>
              </label>
            ))}
          </div>

          {/* Фильтр по биллингу */}
          <select
            value={billingFilter}
            onChange={(e) => setBillingFilter(e.target.value as any)}
            className="px-3 py-1.5 border rounded-lg text-sm bg-background"
          >
            <option value="all">Все</option>
            <option value="yes">С биллингом</option>
            <option value="no">Без биллинга</option>
          </select>
        </div>
      </div>

      {/* Таблица (десктоп) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border bg-background rounded-lg shadow">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Описание</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Контекст</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Интерфейсы</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Биллинг</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Управление ролями</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ограничения</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Права</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.entries(filteredAndGroupedRoles).map(([contextSlug, contextRoles]) => {
              if (contextRoles.length === 0) return null;
              
              return (
                <React.Fragment key={contextSlug}>
                  <tr className="bg-muted/50">
                    <td colSpan={8} className="px-6 py-3">
                      <h3 className="font-bold text-foreground">{getContextLabel(contextSlug)}</h3>
                    </td>
                  </tr>
                  {contextRoles.map((role) => (
                    <tr 
                      key={role.slug} 
                      className="hover:bg-secondary/50 cursor-pointer"
                      onClick={() => handleRoleClick(role)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{role.name}</span>
                          {role.has_all_permissions && (
                            <StarIcon className="w-4 h-4 text-yellow-500" title="Все права" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground line-clamp-2">{role.description}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getContextColor(role.context_slug)}`}>
                          {role.context}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {role.interfaces_slugs.map((slug, idx) => (
                            <span key={slug} className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-xs">
                              {getInterfaceIcon(slug)}
                              <span>{role.interfaces[idx]}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {role.billing_access ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-600" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {role.can_manage_roles.length > 0 ? (
                            role.can_manage_roles.includes('Все роли') ? (
                              <span className="inline-flex px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                Все роли
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                {role.can_manage_roles.slice(0, 2).join(', ')}
                                {role.can_manage_roles.length > 2 && '...'}
                              </span>
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatTimeRestrictions(role.time_restrictions) ? (
                          <div className="flex items-center gap-1" title={formatTimeRestrictions(role.time_restrictions) || ''}>
                            <ClockIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatTimeRestrictions(role.time_restrictions)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {role.has_all_permissions ? (
                            <span className="inline-flex px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              Все права
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {role.system_permissions_count + role.module_permissions_count}
                            </span>
                          )}
                          {role.has_all_modules && (
                            <span className="ml-2 inline-flex px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              Все модули
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Карточки (мобильные) */}
      <div className="md:hidden space-y-4">
        {Object.entries(filteredAndGroupedRoles).map(([contextSlug, contextRoles]) => {
          if (contextRoles.length === 0) return null;
          
          return (
            <div key={contextSlug} className="space-y-3">
              <h3 className="font-bold text-foreground text-lg">{getContextLabel(contextSlug)}</h3>
              {contextRoles.map((role) => (
                <div
                  key={role.slug}
                  className="bg-card border border-border rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleRoleClick(role)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{role.name}</h4>
                    {role.has_all_permissions && (
                      <StarIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getContextColor(role.context_slug)}`}>
                        {role.context}
                      </span>
                      <div className="flex gap-1">
                        {role.interfaces_slugs.map((slug, idx) => (
                          <span key={slug} className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-xs">
                            {getInterfaceIcon(slug)}
                            <span>{role.interfaces[idx]}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Биллинг:</span>
                        {role.billing_access ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      {formatTimeRestrictions(role.time_restrictions) && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTimeRestrictions(role.time_restrictions)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {role.can_manage_roles.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Управление: </span>
                        {role.can_manage_roles.includes('Все роли') ? (
                          <span className="inline-flex px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            Все роли
                          </span>
                        ) : (
                          <span className="text-foreground">{role.can_manage_roles.join(', ')}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="text-sm">
                      <span className="text-muted-foreground">Права: </span>
                      {role.has_all_permissions ? (
                        <span className="inline-flex px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          Все права
                        </span>
                      ) : (
                        <span className="text-foreground">
                          {role.system_permissions_count + role.module_permissions_count}
                        </span>
                      )}
                      {role.has_all_modules && (
                        <span className="ml-2 inline-flex px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          Все модули
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {Object.values(filteredAndGroupedRoles).every(roles => roles.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Роли не найдены</p>
        </div>
      )}

      <RoleDetailsModal
        isOpen={isModalOpen}
        role={selectedRole}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRole(null);
        }}
      />
    </div>
  );
};

export default RolesComparisonTable;

