import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProjectCard } from '@/components/dashboard/projects/ProjectCard';
import api from '@/utils/api';
import { FolderIcon, PlusIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProjectOverview } from '@/types/projects-overview';
import { usePageTitle } from '@/hooks/useSEO';

export const MyProjectsPage = () => {
  usePageTitle('Проекты — МОСТ');
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '');
  const [activeTab, setActiveTab] = useState('my_projects');

  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchProjects = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        const response = await api.get('/my-projects');
        const responseData = response.data as { data?: ProjectOverview[] | { projects?: ProjectOverview[] } };
        const data = responseData.data;
        const projectsData = Array.isArray(data) ? data : data?.projects;
        if (!Array.isArray(projectsData)) throw new Error('Invalid projects response');
        if (active) setProjects(projectsData);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void fetchProjects();
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') ?? '');
  }, [searchParams]);

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);

    const nextSearchParams = new URLSearchParams(searchParams);
    const normalizedValue = value.trim();

    if (normalizedValue) {
      nextSearchParams.set('search', normalizedValue);
    } else {
      nextSearchParams.delete('search');
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

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
    window.location.href = `https://admin.1мост.рф/projects/${projectId}`;
  };

  return (
    <div className="most-workspace-projects">
      <div className="space-y-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Проекты</h1>
            <p className="mt-1.5 text-base text-slate-600">
              Управляйте своими строительными объектами
            </p>
          </div>
          <Button 
            className="h-11 rounded-md bg-primary px-5 font-semibold text-primary-foreground shadow-none hover:bg-primary/90"
            onClick={() => {
              window.location.href = 'https://admin.1мост.рф/projects/create';
            }}
          >
            <PlusIcon aria-hidden="true" className="mr-2 h-5 w-5" />
            Создать проект
          </Button>
        </div>

        <div className="flex flex-col gap-4 border-b border-border pb-5 xl:flex-row xl:items-center xl:justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid h-11 w-full grid-cols-2 rounded-md bg-muted p-1 md:flex md:w-auto">
              <TabsTrigger
                value="my_projects"
                className="h-full rounded px-5 font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Мои проекты
              </TabsTrigger>
              <TabsTrigger
                value="participating"
                className="h-full rounded px-5 font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Я участвую
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80">
            <Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Поиск проектов по названию или адресу"
              placeholder="Название или адрес"
              value={searchTerm}
              onChange={(e) => handleSearchTermChange(e.target.value)}
              className="h-11 rounded-md border-input bg-card pl-11 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[340px] animate-pulse rounded-lg border border-border bg-card" />
            ))}
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-lg border border-border bg-card p-6">
            <h2 className="most-workspace-heading">Не удалось загрузить проекты</h2>
            <p className="my-3 text-muted-foreground">Проверьте подключение и попробуйте ещё раз.</p>
            <Button variant="outline" onClick={() => setAttempt(value => value + 1)}>Повторить загрузку</Button>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-5 py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
              <FolderIcon className="h-10 w-10" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground">Проекты не найдены</h2>
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
