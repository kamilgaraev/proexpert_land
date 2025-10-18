import { useState } from 'react';
import { useHoldingSummary } from '@hooks/useMultiOrganization';
import { 
  FunnelIcon, 
  ChartBarIcon, 
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const HoldingSummaryPanel: React.FC = () => {
  const { summary, loading, error, fetchSummary } = useHoldingSummary();

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
    <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-blue-600 p-3 rounded-xl">
          <ChartBarIcon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Сводка по холдингу</h2>
      </div>

      <form onSubmit={submit} className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Фильтры:</span>
          </div>
          
          <input
            type="date"
            name="date_from"
            value={filters.date_from}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          
          <input
            type="date"
            name="date_to"
            value={filters.date_to}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          
          <input
            type="text"
            name="status"
            placeholder="Статус"
            value={filters.status}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          
          <select
            name="is_approved"
            value={filters.is_approved}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            <option value="">Утверждённость</option>
            <option value="true">Утверждён</option>
            <option value="false">Не утверждён</option>
          </select>
          
          <select
            name="section"
            value={filters.section}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            <option value="">Все секции</option>
            <option value="projects">Проекты</option>
            <option value="contracts">Контракты</option>
            <option value="acts">Акты</option>
            <option value="completed_works">Выполненные работы</option>
          </select>
          
          <button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Применить
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mx-auto mb-2"></div>
          <p className="text-gray-500">Загрузка данных...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-4">
          {error}
        </div>
      )}

      {summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <BuildingOfficeIcon className="w-8 h-8 opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Проекты</span>
              </div>
              <div className="text-4xl font-bold mb-1">{summary?.stats?.projects?.count ?? 0}</div>
              <div className="text-sm opacity-90">Всего проектов</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <DocumentTextIcon className="w-8 h-8 opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Договоры</span>
              </div>
              <div className="text-4xl font-bold mb-1">{summary?.stats?.contracts?.count ?? 0}</div>
              <div className="text-sm opacity-90">Всего договоров</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <ClipboardDocumentCheckIcon className="w-8 h-8 opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Акты</span>
              </div>
              <div className="text-4xl font-bold mb-1">{summary?.stats?.acts?.count ?? 0}</div>
              <div className="text-sm opacity-90">Всего актов</div>
            </div>
          </div>

          {summary.organizations?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-orange-600" />
                Организации
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.organizations.map((org: any) => (
                  <div key={org.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="font-semibold text-gray-900 mb-1">{org.name}</div>
                    <div className="text-xs text-gray-500 mb-3">ID: {org.id}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Проекты: <strong>{org.projects_count}</strong></span>
                      <span className="text-gray-600">Договоры: <strong>{org.contracts_count}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.projects?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-orange-600" />
                Проекты
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.projects.map((project: any) => (
                  <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all">
                    <div className="font-semibold text-gray-900 mb-1">{project.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{project.organization?.name || project.organization_name}</div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Статус:</span>
                        <span className="font-medium text-orange-600">{getStatusLabel(project.status)}</span>
                      </div>
                      {project.start_date && (
                        <div className="text-xs">Начало: {project.start_date}</div>
                      )}
                      {project.budget !== null && (
                        <div className="text-xs">Бюджет: {project.budget}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.contracts?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                Договоры
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.contracts.map((contract: any) => (
                  <div key={contract.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="font-semibold text-gray-900 mb-1">{contract.number}</div>
                    <div className="text-xs text-gray-500 mb-2">{contract.organization?.name || contract.organization_name}</div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Сумма:</span>
                        <span className="font-bold text-green-600">{contract.total_amount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Статус:</span>
                        <span className="font-medium text-blue-600">{getStatusLabel(contract.status)}</span>
                      </div>
                      {contract.date && (
                        <div className="text-xs">Дата: {contract.date}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.acts?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-600" />
                Акты
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.acts.map((act: any) => (
                  <div key={act.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all">
                    <div className="font-semibold text-gray-900 mb-1">Акт #{act.id}</div>
                    <div className="text-xs text-gray-500 mb-2">{act.organization?.name || act.organization_name}</div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {act.act_document_number && (
                        <div>№: <strong>{act.act_document_number}</strong></div>
                      )}
                      {act.amount !== undefined && (
                        <div className="flex items-center justify-between">
                          <span>Сумма:</span>
                          <span className="font-bold text-green-600">{act.amount}</span>
                        </div>
                      )}
                      {typeof act.is_approved === 'boolean' && (
                        <div>
                          Утверждён: <span className={act.is_approved ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {act.is_approved ? 'Да' : 'Нет'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.completed_works?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-5 h-5 text-purple-600" />
                Выполненные работы
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.completed_works.map((work: any) => (
                  <div key={work.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all">
                    <div className="font-semibold text-gray-900 mb-1">
                      {work.work_type?.name || work.name || work.title || work.project?.name || `Работа #${work.id}`}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{work.organization?.name || work.organization_name}</div>
                    <div className="space-y-1 text-xs text-gray-600">
                      {work.project?.name && (
                        <div>Проект: {work.project.name}</div>
                      )}
                      {work.quantity !== undefined && (
                        <div>Кол-во: <strong>{work.quantity}</strong></div>
                      )}
                      {work.total_amount !== undefined && (
                        <div className="flex items-center justify-between">
                          <span>Сумма:</span>
                          <span className="font-bold text-purple-600">{work.total_amount}</span>
                        </div>
                      )}
                      {work.status && (
                        <div>Статус: <span className="font-medium">{getStatusLabel(work.status)}</span></div>
                      )}
                    </div>
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
