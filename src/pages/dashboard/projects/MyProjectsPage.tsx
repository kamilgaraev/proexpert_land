import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '@/components/dashboard/projects/ProjectCard';
import api from '@/utils/api';
import { PlusIcon, FolderIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectOverview } from '@/types/projects-overview';

export const MyProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('my_projects');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        // Assuming the new API returns { data: { projects: [...] } } or { data: [...] }
        // Adjusting to match likely response based on typical patterns or previous types
        const response = await api.get('/landing/my-projects'); 
        // Handling potential structure variations
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
    navigate(`/dashboard/projects/${projectId}`);
  };

  const handleGoToWork = (projectId: number) => {
    window.location.href = `/work/${projectId}`; // Assuming this is the work interface
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Проекты</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Управляйте своими строительными объектами
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl h-12 px-6 font-bold transition-all hover:scale-[1.02]"
            onClick={() => navigate('/dashboard/projects/create')}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Создать проект
          </Button>
        </div>

        {/* Filters & Tabs */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList className="bg-white border border-border p-1 h-12 rounded-xl w-full md:w-auto grid grid-cols-2 md:flex">
                    <TabsTrigger 
                        value="my_projects" 
                        className="rounded-lg font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-full px-6"
                    >
                        Мои проекты
                    </TabsTrigger>
                    <TabsTrigger 
                        value="participating" 
                        className="rounded-lg font-bold data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-full px-6"
                    >
                        Я участвую
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск проектов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-border bg-white focus-visible:ring-primary"
                />
            </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[300px] rounded-3xl bg-white/50 animate-pulse border border-border/50" />
                ))}
            </div>
        ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onViewDetails={handleViewDetails}
                        onGoToWork={handleGoToWork}
                    />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-border border-dashed">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
                    <FolderIcon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Проекты не найдены</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    {searchTerm 
                        ? "Попробуйте изменить параметры поиска" 
                        : activeTab === 'my_projects' 
                            ? "У вас пока нет созданных проектов" 
                            : "Вы пока не участвуете ни в одном проекте"
                    }
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default MyProjectsPage;
