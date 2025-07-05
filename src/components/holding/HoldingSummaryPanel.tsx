import { useState } from 'react';
import { useHoldingSummary } from '@hooks/useMultiOrganization';
import { useTheme } from '@components/shared/ThemeProvider';

const HoldingSummaryPanel: React.FC = () => {
  const { summary, loading, error, fetchSummary } = useHoldingSummary();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
    is_approved: '',
    section: '' as '' | 'projects' | 'contracts' | 'acts' | 'completed_works',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    fetchSummary(params);
  };

  return (
    <section className="bg-white shadow rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Сводка по холдингу</h2>
      <form onSubmit={submit} className="flex flex-wrap gap-3 mb-6">
        <input type="date" name="date_from" value={filters.date_from} onChange={handleChange} className="input w-[140px]" />
        <input type="date" name="date_to" value={filters.date_to} onChange={handleChange} className="input w-[140px]" />
        <input type="text" name="status" placeholder="Статус" value={filters.status} onChange={handleChange} className="input w-[120px]" />
        <select name="is_approved" value={filters.is_approved} onChange={handleChange} className="input w-[140px]">
          <option value="">Утверждённость</option>
          <option value="true">Утверждён</option>
          <option value="false">Не утверждён</option>
        </select>
        <select name="section" value={filters.section} onChange={handleChange} className="input w-[180px]">
          <option value="">Все секции</option>
          <option value="projects">Проекты</option>
          <option value="contracts">Контракты</option>
          <option value="acts">Акты</option>
          <option value="completed_works">Выполненные работы</option>
        </select>
        <button type="submit" className="btn btn-primary">Показать</button>
      </form>

      {loading && <p className="text-gray-500">Загрузка…</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {summary && (
        <div className="grid gap-6">
          {/* Статистика */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-700">{summary?.stats?.projects?.count ?? 0}</div>
              <div className="text-sm text-primary-700 mt-1">Проектов</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-700">{summary?.stats?.contracts?.count ?? 0}</div>
              <div className="text-sm text-indigo-700 mt-1">Договоров</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">{summary?.stats?.acts?.count ?? 0}</div>
              <div className="text-sm text-green-700 mt-1">Актов</div>
            </div>
          </div>

          {/* Organizations List */}
          {summary.organizations?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Организации</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {summary.organizations.map((org: any) => (
                  <div key={org.id} className="border rounded-lg p-3 flex flex-col">
                    <span className="font-medium">{org.name}</span>
                    <span className="text-xs text-gray-500">ID: {org.id}</span>
                    <div className="text-xs mt-2 text-gray-600">Проекты: {org.projects_count} | Договоры: {org.contracts_count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default HoldingSummaryPanel; 