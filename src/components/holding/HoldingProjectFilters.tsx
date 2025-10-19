import { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import type { HoldingFilters, OrganizationNode } from '@/types/multi-organization-v2';

interface HoldingProjectFiltersProps {
  filters: HoldingFilters;
  onFiltersChange: (filters: HoldingFilters) => void;
  organizations?: OrganizationNode[];
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Черновик' },
  { value: 'active', label: 'Активный' },
  { value: 'on_hold', label: 'Приостановлен' },
  { value: 'completed', label: 'Завершен' },
  { value: 'cancelled', label: 'Отменен' },
];

const DATE_PRESETS = [
  { value: 'today', label: 'Сегодня' },
  { value: 'this_week', label: 'Эта неделя' },
  { value: 'this_month', label: 'Этот месяц' },
  { value: 'this_quarter', label: 'Этот квартал' },
  { value: 'this_year', label: 'Этот год' },
];

export const HoldingProjectFilters = ({
  filters,
  onFiltersChange,
  organizations = [],
  loading = false,
}: HoldingProjectFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.name || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(() => {
      onFiltersChange({ ...filters, name: value || undefined });
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleOrganizationToggle = (orgId: number) => {
    const currentOrgs = filters.organization_ids || [];
    const newOrgs = currentOrgs.includes(orgId)
      ? currentOrgs.filter(id => id !== orgId)
      : [...currentOrgs, orgId];
    
    onFiltersChange({
      ...filters,
      organization_ids: newOrgs.length > 0 ? newOrgs : undefined,
    });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === filters.status ? undefined : status,
    });
  };

  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let dateFrom = '';
    let dateTo = today.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        dateFrom = dateTo;
        break;
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        dateFrom = startOfWeek.toISOString().split('T')[0];
        break;
      case 'this_month':
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'this_quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        dateFrom = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        break;
      case 'this_year':
        dateFrom = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
    }

    onFiltersChange({ ...filters, date_from: dateFrom, date_to: dateTo });
  };

  const handleDateChange = (field: 'date_from' | 'date_to', value: string) => {
    onFiltersChange({ ...filters, [field]: value || undefined });
  };

  const handleReset = () => {
    setSearchQuery('');
    onFiltersChange({});
  };

  const activeFiltersCount = [
    filters.organization_ids?.length,
    filters.status,
    filters.date_from,
    filters.date_to,
    filters.name,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-700 p-2 rounded-lg">
            <FunnelIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-slate-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
            >
              <XMarkIcon className="w-4 h-4" />
              Сбросить
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-slate-700 font-medium hover:text-slate-900 transition-colors"
          >
            {isExpanded ? 'Свернуть' : 'Развернуть'}
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Поиск проектов по названию..."
          disabled={loading}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {organizations.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Дочерние организации
                </label>
                <div className="flex flex-wrap gap-2">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleOrganizationToggle(org.id)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                        filters.organization_ids?.includes(org.id)
                          ? 'bg-slate-700 text-white shadow-md'
                          : 'bg-slate-50 text-gray-700 hover:bg-slate-100 border border-gray-200'
                      }`}
                    >
                      {org.name}
                      <span className="ml-2 text-xs opacity-75">({org.projects_count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Статус проекта
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                      filters.status === status.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Период
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handleDatePreset(preset.value)}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all disabled:opacity-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Дата начала</label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleDateChange('date_from', e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Дата окончания</label>
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => handleDateChange('date_to', e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.include_archived || false}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, include_archived: e.target.checked })
                  }
                  disabled={loading}
                  className="w-4 h-4 text-slate-700 border-gray-300 rounded focus:ring-slate-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 font-medium">
                  Показать архивные проекты
                </span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

