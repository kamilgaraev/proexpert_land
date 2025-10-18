import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { multiOrgApiV2 } from '@/utils/multiOrganizationApiV2';
import type { ProjectDetailV2 } from '@/types/multi-organization-v2';
import { 
  ArrowLeftIcon, 
  BuildingOfficeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { PageLoading } from '@components/common/PageLoading';
import { getErrorMessage } from '@/utils/multiOrgErrorHandler';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  planning: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  suspended: 'bg-yellow-100 text-yellow-800',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Активен',
  planning: 'Планирование',
  completed: 'Завершен',
  suspended: 'Приостановлен',
};

export const HoldingProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectDetailV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject(parseInt(projectId));
    }
  }, [projectId]);

  const fetchProject = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await multiOrgApiV2.getProject(id);
      setProject(response.data);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/landing/multi-organization/projects"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
          >
            Назад к списку проектов
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Проект не найден</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/landing/multi-organization/projects"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Назад к списку проектов
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-gray-600">
                <BuildingOfficeIcon className="w-5 h-5" />
                <span>{project.organization.name}</span>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {STATUS_LABELS[project.status] || project.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <BanknotesIcon className="w-6 h-6 text-green-600" />
            <span className="text-sm text-gray-500">Бюджет проекта</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(project.budget_amount)}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <DocumentTextIcon className="w-6 h-6 text-purple-600" />
            <span className="text-sm text-gray-500">Контракты</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {project.contracts?.length || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-500">Дата создания</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatDate(project.created_at)}
          </div>
        </div>
      </div>

      {project.contracts && project.contracts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Контракты</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {project.contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      Контракт № {contract.number}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Подрядчик: {contract.contractor.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(contract.total_amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {project.organizations && project.organizations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Участвующие организации</h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {project.organizations.map((org) => (
                <div
                  key={org.organization_id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">Организация #{org.organization_id}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">{org.role_label}</span>
                    {org.is_active && (
                      <span className="ml-2 text-xs text-green-600">(активна)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

