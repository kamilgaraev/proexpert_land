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

  const statusLabels: Record<string, string> = {
    pending: 'Ожидает',
    in_review: 'На проверке',
    approved: 'Утверждён',
    rejected: 'Отклонён',
    active: 'Активен',
    completed: 'Завершён',
    paused: 'Приостановлен',
    draft: 'Черновик',
  };
  const getStatusLabel = (status: string | undefined) => {
    if (!status) return '';
    return statusLabels[status] || status;
  };

  return (
    <section className={`bg-white rounded-xl px-6 py-4 mt-8 mb-10 border ${theme.border} shadow-lg`}>
      <h2 className="text-lg font-semibold mb-4">Сводка по холдингу</h2>
      <form onSubmit={submit} className="flex flex-wrap items-center gap-4 mb-4">
        <input type="date" name="date_from" value={filters.date_from} onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-[140px] focus:ring-primary-500 focus:border-primary-500" />
        <input type="date" name="date_to" value={filters.date_to} onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-[140px] focus:ring-primary-500 focus:border-primary-500" />
        <input type="text" name="status" placeholder="Статус" value={filters.status} onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-[120px] focus:ring-primary-500 focus:border-primary-500" />
        <select name="is_approved" value={filters.is_approved} onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-[150px] focus:ring-primary-500 focus:border-primary-500">
          <option value="">Утверждённость</option>
          <option value="true">Утверждён</option>
          <option value="false">Не утверждён</option>
        </select>
        <select name="section" value={filters.section} onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-[170px] focus:ring-primary-500 focus:border-primary-500">
          <option value="">Все секции</option>
          <option value="projects">Проекты</option>
          <option value="contracts">Контракты</option>
          <option value="acts">Акты</option>
          <option value="completed_works">Выполненные работы</option>
        </select>
        <button type="submit" className={`${theme.primary} ${theme.hover} text-white px-6 py-2 rounded-lg font-semibold`}>
          Показать
        </button>
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

          {/* Projects List */}
          {summary.projects?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 mt-6">Проекты</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {summary.projects.map((project: any) => (
                  <div key={project.id} className="border rounded-lg p-3 flex flex-col">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-xs text-gray-500">ID: {project.id}</span>
                    <span className="text-xs text-gray-500">Орг: {project.organization?.name || project.organization_name}</span>
                    <div className="text-xs mt-2 text-gray-600">Статус: {getStatusLabel(project.status)}</div>
                    <div className="text-xs text-gray-600">Дата начала: {project.start_date}</div>
                    <div className="text-xs text-gray-600">Дата окончания: {project.end_date}</div>
                    {project.budget !== null && (
                      <div className="text-xs text-gray-600">Бюджет: {project.budget}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contracts List */}
          {summary.contracts?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 mt-6">Договоры</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {summary.contracts.map((contract: any) => (
                  <div key={contract.id} className="border rounded-lg p-3 flex flex-col">
                    <span className="font-medium">{contract.number}</span>
                    <span className="text-xs text-gray-500">ID: {contract.id}</span>
                    <span className="text-xs text-gray-500">Орг: {contract.organization?.name || contract.organization_name}</span>
                    <div className="text-xs mt-2 text-gray-600">Дата: {contract.date}</div>
                    <div className="text-xs text-gray-600">Сумма: {contract.total_amount}</div>
                    <div className="text-xs text-gray-600">Статус: {getStatusLabel(contract.status)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acts List */}
          {summary.acts?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 mt-6">Акты</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {summary.acts.map((act: any) => (
                  <div key={act.id} className="border rounded-lg p-3 flex flex-col">
                    <span className="font-medium">Акт #{act.id}</span>
                    <span className="text-xs text-gray-500">Орг: {act.organization?.name || act.organization_name}</span>
                    {act.act_document_number && (
                      <span className="text-xs text-gray-500">№: {act.act_document_number}</span>
                    )}
                    {act.contract_id && (
                      <span className="text-xs text-gray-500">Договор ID: {act.contract_id}</span>
                    )}
                    {act.act_date && (
                      <div className="text-xs text-gray-600">Дата: {act.act_date}</div>
                    )}
                    {act.amount !== undefined && (
                      <div className="text-xs text-gray-600">Сумма: {act.amount}</div>
                    )}
                    {typeof act.is_approved === 'boolean' && (
                      <div className="text-xs text-gray-600">Утверждён: {act.is_approved ? 'Да' : 'Нет'}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Works List */}
          {summary.completed_works?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 mt-6">Выполненные работы</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {summary.completed_works.map((work: any) => (
                  <div key={work.id} className="border rounded-lg p-3 flex flex-col">
                    <span className="font-medium">{work.work_type?.name || work.name || work.title || work.project?.name || `Работа #${work.id}`}</span>
                    <span className="text-xs text-gray-500">ID: {work.id}</span>
                    <span className="text-xs text-gray-500">Орг: {work.organization?.name || work.organization_name}</span>
                    {work.project?.name && (
                      <span className="text-xs text-gray-500">Проект: {work.project.name}</span>
                    )}
                    {work.contract?.number && (
                      <span className="text-xs text-gray-500">Договор: {work.contract.number}</span>
                    )}
                    {work.completion_date && (
                      <div className="text-xs text-gray-600">Дата: {work.completion_date}</div>
                    )}
                    {work.quantity !== undefined && (
                      <div className="text-xs text-gray-600">Кол-во: {work.quantity}</div>
                    )}
                    {work.price !== undefined && (
                      <div className="text-xs text-gray-600">Цена: {work.price}</div>
                    )}
                    {work.total_amount !== undefined && (
                      <div className="text-xs text-gray-600">Сумма: {work.total_amount}</div>
                    )}
                    {work.status && (
                      <div className="text-xs text-gray-600">Статус: {getStatusLabel(work.status)}</div>
                    )}
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