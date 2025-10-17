import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyProjects, useProjectDetails } from '@/hooks/useMyProjects';
import { ProjectCard } from '@/components/dashboard/projects/ProjectCard';
import { ProjectDetailsModal } from '@/components/dashboard/projects/ProjectDetailsModal';
import { ProjectsFilter } from '@/components/dashboard/projects/ProjectsFilter';
import type { ProjectOverview } from '@/types/projects-overview';

export const MyProjectsPage = () => {
  const navigate = useNavigate();
  const { projects, grouped, totals, loading, fetchProjects } = useMyProjects();
  const { projectDetails, loading: detailsLoading, fetchProjectDetails, clearDetails } = useProjectDetails();

  const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'participant'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleViewDetails = (projectId: number) => {
    fetchProjectDetails(projectId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearDetails();
  };

  const handleGoToWork = (projectId: number) => {
    localStorage.setItem('selected_project_id', projectId.toString());
    navigate(`/admin/projects/${projectId}`);
  };

  const getFilteredProjects = (): ProjectOverview[] => {
    let filtered = projects;

    if (activeTab === 'owned') {
      filtered = grouped?.owned || [];
    } else if (activeTab === 'participant') {
      filtered = grouped?.participant || [];
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => 
        selectedStatus === 'active' ? !p.is_archived : p.is_archived
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.address && p.address.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-construction-600 mb-4"></div>
          <p className="text-gray-600">Загрузка проектов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Мои проекты
            </h1>
            <p className="text-gray-600">
              Обзор всех проектов вашей организации
            </p>
          </div>
        </div>

        {totals && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-construction-600">
              <p className="text-sm text-gray-600 mb-1">Всего проектов</p>
              <p className="text-3xl font-bold text-gray-900">{totals.all}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
              <p className="text-sm text-gray-600 mb-1">Активных</p>
              <p className="text-3xl font-bold text-gray-900">{totals.active}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-600">
              <p className="text-sm text-gray-600 mb-1">Владелец</p>
              <p className="text-3xl font-bold text-gray-900">{totals.owned}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-600">
              <p className="text-sm text-gray-600 mb-1">Участник</p>
              <p className="text-3xl font-bold text-gray-900">{totals.participant}</p>
            </div>
          </div>
        )}

        <ProjectsFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-construction-600 text-construction-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Все проекты {totals && `(${totals.all})`}
              </button>
              <button
                onClick={() => setActiveTab('owned')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'owned'
                    ? 'border-construction-600 text-construction-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Владелец {totals && `(${totals.owned})`}
              </button>
              <button
                onClick={() => setActiveTab('participant')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'participant'
                    ? 'border-construction-600 text-construction-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Участник {totals && `(${totals.participant})`}
              </button>
            </nav>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={handleViewDetails}
                onGoToWork={handleGoToWork}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'Проекты не найдены' : 'Нет проектов'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'Попробуйте изменить параметры поиска'
                : 'У вас пока нет доступных проектов. Проекты создаются в админке, после чего появятся здесь.'
              }
            </p>
          </div>
        )}

        <ProjectDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          projectDetails={projectDetails}
          loading={detailsLoading}
          onGoToWork={handleGoToWork}
        />
      </div>
    </div>
  );
};

