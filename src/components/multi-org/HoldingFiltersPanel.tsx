import { useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { OrganizationTreeSelect } from './OrganizationTreeSelect';
import type { FilterOptions, HoldingFilters } from '@/types/multi-organization-v2';

interface HoldingFiltersPanelProps {
  options: FilterOptions | null;
  selectedOrgIds: number[];
  onOrgIdsChange: (ids: number[]) => void;
  onFiltersChange: (filters: Partial<HoldingFilters>) => void;
  onReset: () => void;
  currentFilters: HoldingFilters;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'active', label: 'Активные' },
  { value: 'planning', label: 'Планирование' },
  { value: 'completed', label: 'Завершенные' },
  { value: 'suspended', label: 'Приостановленные' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'Все время' },
  { value: 'today', label: 'Сегодня' },
  { value: 'this_week', label: 'Текущая неделя' },
  { value: 'this_month', label: 'Текущий месяц' },
  { value: 'this_quarter', label: 'Текущий квартал' },
  { value: 'this_year', label: 'Текущий год' },
];

export const HoldingFiltersPanel = ({
  options,
  selectedOrgIds,
  onOrgIdsChange,
  onFiltersChange,
  onReset,
  currentFilters,
}: HoldingFiltersPanelProps) => {
  const [localStatus, setLocalStatus] = useState(currentFilters.status || '');
  const [localDateRange, setLocalDateRange] = useState('all');
  const [localSearchName, setLocalSearchName] = useState(currentFilters.name || '');

  const handleStatusChange = (status: string) => {
    setLocalStatus(status);
    onFiltersChange({ status: status || undefined });
  };

  const handleDateRangeChange = (range: string) => {
    setLocalDateRange(range);
    if (range === 'all') {
      onFiltersChange({ date_from: undefined, date_to: undefined });
    } else if (options?.date_ranges) {
      const dateRange = options.date_ranges[range as keyof typeof options.date_ranges];
      if (dateRange) {
        onFiltersChange({
          date_from: dateRange[0],
          date_to: dateRange[1],
        });
      }
    }
  };

  const handleSearchChange = (name: string) => {
    setLocalSearchName(name);
    onFiltersChange({ name: name || undefined });
  };

  const handleReset = () => {
    setLocalStatus('');
    setLocalDateRange('all');
    setLocalSearchName('');
    onReset();
  };

  const hasActiveFilters = 
    selectedOrgIds.length > 0 || 
    localStatus !== '' || 
    localDateRange !== 'all' || 
    localSearchName !== '';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Фильтры</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <XMarkIcon className="w-4 h-4" />
            Сбросить
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Организации
          </label>
          {options?.organizations && (
            <OrganizationTreeSelect
              tree={options.organizations}
              value={selectedOrgIds}
              onChange={onOrgIdsChange}
              multiSelect={true}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Период
          </label>
          <select
            value={localDateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DATE_RANGE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Статус
          </label>
          <select
            value={localStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Поиск по названию
          </label>
          <input
            type="text"
            value={localSearchName}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Введите название..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

