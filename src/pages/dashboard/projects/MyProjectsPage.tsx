import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/dashboard/projects/ProjectCard';
import api from '@/utils/api';
import { FolderIcon, PlusIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProjectOverview } from '@/types/projects-overview';

export const MyProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('my_projects');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/my-projects');
        const responseData = response.data as any;
        const projectsData = responseData.data?.projects || responseData.data || [];
        setProjects(projectsData);
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.address && project.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (activeTab === 'my_projects') {
      return project.is_owner;
    } else {
      return !project.is_owner;
    }
  });

  const handleViewDetails = (projectId: number) => {
    window.location.href = `https://admin.prohelper.pro/projects/${projectId}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 md:p-8">
      <div className="mx-auto max-w-6xl space-y-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Проекты</h1>
            <p className="mt-1.5 text-base text-slate-600">
              Управляйте своими строительными объектами
            </p>
          </div>
          <Button 
            className="h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-[0_12px_28px_rgba(249,115,22,0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_16px_34px_rgba(249,115,22,0.28)]"
            onClick={() => {
              window.location.href = 'https://admin.prohelper.pro/projects/create';
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Создать проект
          </Button>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-slate-100 p-1 md:flex md:w-auto">
              <TabsTrigger
                value="my_projects"
                className="h-full rounded-lg px-5 font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                Мои проекты
              </TabsTrigger>
              <TabsTrigger
                value="participating"
                className="h-full rounded-lg px-5 font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                Я участвую
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Поиск проектов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-sm focus-visible:ring-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[340px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
              <FolderIcon className="h-10 w-10" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">Проекты не найдены</h3>
            <p className="mx-auto max-w-sm text-muted-foreground">
              {searchTerm
                ? 'Попробуйте изменить параметры поиска'
                : activeTab === 'my_projects'
                  ? 'У вас пока нет созданных проектов'
                  : 'Вы пока не участвуете ни в одном проекте'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjectsPage;
