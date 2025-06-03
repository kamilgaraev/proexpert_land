import React, { useState } from 'react';
import { FunnelIcon, ArrowPathIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { getOperationLogs } from '@utils/api';

// Пример структуры фильтров и отчёта (заменить на реальные данные/сервисы)
const initialFilters = {
  project: '',
  material: '',
  user: '',
  operationType: '',
  dateFrom: '',
  dateTo: '',
};

const mockReportData = [
  { id: 1, project: 'Объект 1', material: 'Бетон', user: 'Иванов', amount: 10, date: '2024-06-01' },
  { id: 2, project: 'Объект 2', material: 'Арматура', user: 'Петров', amount: 5, date: '2024-06-02' },
];

const ReportsPage: React.FC = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await getOperationLogs(filters);
      if (response.success && Array.isArray(response.data)) {
        setReport(response.data);
      } else {
        setReport([]);
        setError(response.message || 'Не удалось получить отчёт.');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при получении отчёта');
      setReport([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: 'csv' | 'xlsx' | 'json') => {
    // Здесь логика экспорта (можно использовать библиотеки file-saver/xlsx)
    alert(`Экспорт в ${type.toUpperCase()} (заглушка)`);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setReport([]);
    setError(null);
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Отчёты</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Проект</label>
            <input name="project" value={filters.project} onChange={handleChange} className="form-input w-full" placeholder="Выберите проект" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Материал</label>
            <input name="material" value={filters.material} onChange={handleChange} className="form-input w-full" placeholder="Выберите материал" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пользователь</label>
            <input name="user" value={filters.user} onChange={handleChange} className="form-input w-full" placeholder="Выберите пользователя" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип операции</label>
            <input name="operationType" value={filters.operationType} onChange={handleChange} className="form-input w-full" placeholder="Тип операции" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата с</label>
            <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата по</label>
            <input type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} className="form-input w-full" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button type="submit" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md font-medium shadow hover:bg-indigo-700 transition">
            <FunnelIcon className="h-5 w-5 mr-2" />Сформировать отчёт
          </button>
          <button type="button" onClick={handleClear} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium shadow hover:bg-gray-50 transition">
            <ArrowPathIcon className="h-5 w-5 mr-2" />Очистить фильтры
          </button>
          <button type="button" onClick={() => handleExport('csv')} className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium hover:bg-blue-100 transition">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />Экспорт в CSV
          </button>
          <button type="button" onClick={() => handleExport('xlsx')} className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md font-medium hover:bg-green-100 transition">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />Экспорт в XLSX
          </button>
          <button type="button" onClick={() => handleExport('json')} className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-md font-medium hover:bg-gray-100 transition">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />Экспорт в JSON
          </button>
        </div>
      </form>
      {loading && (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-4 text-center font-medium">
          {error}
        </div>
      )}
      {report.length > 0 && !loading && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Результаты отчёта</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Проект</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Материал</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Операция</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Количество</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.project_name || row.project || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.material_name || row.material || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.user_name || row.user || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.operation_type || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.amount ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date || row.created_at ? new Date(row.date || row.created_at).toLocaleDateString('ru-RU') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage; 