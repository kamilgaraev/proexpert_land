import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, FolderOpen, Search } from 'lucide-react';

import { useMyProjects, useProjectDetails } from '@/hooks/useMyProjects';
import { ProjectCard } from '@/components/dashboard/projects/ProjectCard';
import { ProjectDetailsModal } from '@/components/dashboard/projects/ProjectDetailsModal';
import type { ProjectOverview } from '@/types/projects-overview';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton';

export const MyProjectsPage = () => {
  const navigate = useNavigate();
  const { projects, grouped, totals, loading, fetchProjects } = useMyProjects();
  const { projectDetails, loading: detailsLoading, fetchProjectDetails, clearDetails } = useProjectDetails();

  const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'participant'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
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
      <div className="container mx-auto py-8 space-y-8">
         <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-[300px] rounded-xl" />
            ))}
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мои проекты</h1>
          <p className="text-muted-foreground">Управление строительными объектами и задачами</p>
        </div>
        <Button onClick={() => navigate('/dashboard/projects/create')}>
            <Plus className="mr-2 h-4 w-4" /> Создать проект
        </Button>
      </div>

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-xl p-4 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground mb-1">Всего проектов</div>
                <div className="text-2xl font-bold">{totals.all}</div>
            </div>
            <div className="bg-card border rounded-xl p-4 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground mb-1">Активных</div>
                <div className="text-2xl font-bold text-green-600">{totals.active}</div>
            </div>
            <div className="bg-card border rounded-xl p-4 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground mb-1">Мои (Владелец)</div>
                <div className="text-2xl font-bold text-primary">{totals.owned}</div>
            </div>
            <div className="bg-card border rounded-xl p-4 shadow-sm">
                <div className="text-sm font-medium text-muted-foreground mb-1">Участник</div>
                <div className="text-2xl font-bold text-blue-600">{totals.participant}</div>
            </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full md:w-auto">
            <TabsList>
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="owned">Мои</TabsTrigger>
                <TabsTrigger value="participant">Участник</TabsTrigger>
            </TabsList>
        </Tabs>

        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск проектов..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Статус</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
                        <DropdownMenuRadioItem value="all">Все</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="active">Активные</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="archived">Архив</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
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
        <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/25">
            <div className="bg-muted rounded-full p-4 mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Проекты не найдены</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
                {searchQuery ? 'Попробуйте изменить параметры поиска' : 'У вас пока нет активных проектов.'}
            </p>
            {!searchQuery && (
                <Button variant="outline" className="mt-6" onClick={() => navigate('/dashboard/projects/create')}>
                    Создать первый проект
                </Button>
            )}
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
  );
};
