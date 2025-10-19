import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useHoldingProjects } from '@/hooks/useHoldingProjects';
import { useHoldingFilters } from '@/hooks/useHoldingFilters';
import { PageHeader } from './shared/PageHeader';
import { HoldingProjectFilters } from './HoldingProjectFilters';
import { HoldingProjectCard } from './HoldingProjectCard';
import { StatCard } from './shared/StatCard';
import { LoadingSpinner } from './shared/LoadingSpinner';
import type { ProjectWithOrganization } from '@/types/multi-organization-v2';

export const HoldingProjectsList = () => {
  const navigate = useNavigate();
  const [perPage, setPerPage] = useState(25);
  
  const {
    data: projectsData,
    loading: projectsLoading,
    error: projectsError,
    filters,
    currentPage,
    updateFilters,
    resetFilters,
    refetch,
    goToPage,
    changePerPage,
  } = useHoldingProjects();

  const {
    options: filterOptions,
    error: filtersError,
  } = useHoldingFilters();

  useEffect(() => {
    if (perPage !== 25) {
      changePerPage(perPage);
    }
  }, [perPage, changePerPage]);

  const handleProjectClick = (project: ProjectWithOrganization) => {
    navigate(`/holding/projects/${project.id}`);
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
  };

  const renderPagination = () => {
    if (!projectsData || projectsData.last_page <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(projectsData.last_page, currentPage + halfRange);

    if (currentPage <= halfRange) {
      endPage = Math.min(maxPagesToShow, projectsData.last_page);
    }

    if (currentPage > projectsData.last_page - halfRange) {
      startPage = Math.max(1, projectsData.last_page - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Показано <span className="font-semibold text-gray-900">{projectsData.data.length}</span> из{' '}
          <span className="font-semibold text-gray-900">{projectsData.total}</span> проектов
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1 || projectsLoading}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => goToPage(1)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-400">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              disabled={projectsLoading}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                page === currentPage
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < projectsData.last_page && (
            <>
              {endPage < projectsData.last_page - 1 && <span className="text-gray-400">...</span>}
              <button
                onClick={() => goToPage(projectsData.last_page)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                {projectsData.last_page}
              </button>
            </>
          )}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === projectsData.last_page || projectsLoading}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">На странице:</label>
          <select
            value={perPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!projectsData) return null;

    const activeProjects = projectsData.data.filter(p => p.status === 'active').length;
    const completedProjects = projectsData.data.filter(p => p.status === 'completed').length;
    const totalBudget = projectsData.data.reduce((sum, p) => sum + Number(p.budget_amount), 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Всего проектов"
          value={projectsData.total}
          colorScheme="orange"
          icon={<BuildingOffice2Icon className="w-6 h-6" />}
          subtitle={`На текущей странице: ${projectsData.data.length}`}
        />
        <StatCard
          title="Активные проекты"
          value={activeProjects}
          colorScheme="green"
          icon={<BuildingOffice2Icon className="w-6 h-6" />}
          subtitle="В работе"
        />
        <StatCard
          title="Общий бюджет"
          value={new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
          }).format(totalBudget)}
          colorScheme="blue"
          icon={<BuildingOffice2Icon className="w-6 h-6" />}
          subtitle={`Завершено: ${completedProjects}`}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader
        title="Проекты холдинга"
        subtitle="Управление проектами дочерних организаций"
        icon={<BuildingOffice2Icon className="w-7 h-7" />}
        actions={
          <button
            onClick={refetch}
            disabled={projectsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${projectsLoading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        }
      />

      {(projectsError || filtersError) && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
          <p className="font-medium">Ошибка загрузки данных</p>
          <p className="text-sm mt-1">{projectsError || filtersError}</p>
        </div>
      )}

      <HoldingProjectFilters
        filters={filters}
        onFiltersChange={updateFilters}
        organizations={filterOptions?.organizations?.children || []}
        loading={projectsLoading}
      />

      {renderStats()}

      {projectsLoading && !projectsData ? (
        <LoadingSpinner message="Загрузка проектов..." />
      ) : projectsData?.data.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <BuildingOffice2Icon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Проекты не найдены
          </h3>
          <p className="text-gray-600 mb-6">
            Попробуйте изменить параметры фильтрации или создайте новый проект
          </p>
          {(filters.organization_ids?.length || filters.status || filters.name) && (
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projectsData?.data.map((project, index) => (
              <HoldingProjectCard
                key={project.id}
                project={project}
                onClick={handleProjectClick}
                index={index}
              />
            ))}
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default HoldingProjectsList;

