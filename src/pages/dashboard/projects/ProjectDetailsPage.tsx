import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  MoreVertical,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  FileText,
  Users,
  ChevronRight,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ProjectDetails } from '@/types/projects-overview';
import api from '@/utils/api';

// Custom Circular Progress Component
const CircularProgress = ({ 
  value, 
  size = 120, 
  strokeWidth = 10, 
  health = 'healthy' 
}: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
  health?: 'healthy' | 'warning' | 'critical';
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const colorMap = {
    healthy: 'text-emerald-500',
    warning: 'text-amber-500',
    critical: 'text-red-500'
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-secondary"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-1000 ease-out", colorMap[health])}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold", colorMap[health])}>{Math.round(value)}%</span>
      </div>
    </div>
  );
};

const ProjectDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        // Using the standard axios instance from utils/api
        const response = await api.get(`/my-projects/${id}`);
        const responseData = response.data as any;
        setProject(responseData.data); // Assuming response structure matches ProjectDetailsResponse
      } catch (err) {
        console.error('Failed to fetch project details:', err);
        setError('Не удалось загрузить данные проекта');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      planned: 'bg-slate-100 text-slate-600 border-slate-200',
      completed: 'bg-slate-100 text-slate-500 border-slate-200',
      on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };
    
    const labels: Record<string, string> = {
      active: 'Активен',
      in_progress: 'В работе',
      planned: 'Запланирован',
      completed: 'Завершен',
      on_hold: 'На паузе',
      cancelled: 'Отменен'
    };

    return (
      <Badge variant="outline" className={cn("px-3 py-1 font-bold", styles[status] || styles.planned)}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Ошибка доступа</h2>
        <p className="text-muted-foreground max-w-md mb-8">{error || 'Проект не найден'}</p>
        <Button asChild>
          <Link to="/dashboard/projects">Вернуться к проектам</Link>
        </Button>
      </div>
    );
  }

  const roleLabel = typeof project.role === 'string' ? project.role : project.role?.label;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="mb-6">
            <Link to="/dashboard/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Назад к проектам
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{project.name}</h1>
                {getStatusBadge(project.status)}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {project.address && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-primary/70" />
                    {project.address}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-primary/70" />
                  {project.dates?.start ? formatDate(project.dates.start) : '—'} — {project.dates?.end ? formatDate(project.dates.end) : '...'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start">
              <div className="text-right hidden md:block">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ваша роль</p>
                <p className="font-bold text-foreground">{roleLabel}</p>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                 <Briefcase className="w-5 h-5" />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl ml-2">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Progress & Tasks */}
          <div className="space-y-8">
            {/* Progress Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 border border-border shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Прогресс</h3>
              </div>
              
              <div className="flex flex-col items-center mb-8">
                <CircularProgress 
                  value={project.progress.percent} 
                  health={project.progress.health} 
                  size={160} 
                  strokeWidth={12} 
                />
                <p className="text-sm text-muted-foreground font-medium mt-4">Общая готовность</p>
              </div>

              {project.progress.next_milestone && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                   <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-orange-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Ближайшая цель</p>
                        <p className="font-bold text-foreground leading-tight mb-1">{project.progress.next_milestone.title}</p>
                        <p className="text-sm text-orange-600 font-medium">{formatDate(project.progress.next_milestone.date)}</p>
                      </div>
                   </div>
                </div>
              )}
            </motion.div>

            {/* Tasks Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 border border-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Задачи</h3>
                </div>
                <Badge variant="secondary">{project.tasks_summary.total} всего</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-2xl font-bold text-slate-900">{project.tasks_summary.open}</p>
                   <p className="text-xs font-medium text-slate-500">В работе</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <p className="text-2xl font-bold text-emerald-700">{project.tasks_summary.completed}</p>
                   <p className="text-xs font-medium text-emerald-600">Завершено</p>
                </div>
              </div>

              {project.tasks_summary.overdue > 0 ? (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 animate-pulse">
                   <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                   <div>
                      <p className="text-sm font-bold text-red-700">Просрочено задач: {project.tasks_summary.overdue}</p>
                      <p className="text-xs text-red-600/80">Требует внимания</p>
                   </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 text-slate-500">
                   <CheckCircle2 className="w-5 h-5" />
                   <p className="text-sm font-medium">Нет просроченных задач</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Middle & Right Column: Finances & Team */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Finances Widget */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="bg-white rounded-3xl p-8 border border-border shadow-sm"
            >
              <div className="flex items-center gap-2 mb-8">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Финансы и Работы</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Contracts */}
                 <div className="relative group">
                    <div className="absolute inset-0 bg-blue-50 rounded-2xl transform rotate-1 transition-transform group-hover:rotate-2"></div>
                    <div className="relative bg-white border border-blue-100 p-6 rounded-2xl shadow-sm">
                       <div className="flex items-center justify-between mb-6">
                          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                             <FileText className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Контракты</span>
                       </div>
                       
                       <div className="space-y-4">
                          <div>
                             <p className="text-sm text-muted-foreground mb-1">Всего по проекту</p>
                             <p className="text-2xl font-bold text-foreground tracking-tight">
                                {formatCurrency(project.stats.contracts.total_amount)}
                             </p>
                          </div>
                          
                          {project.stats.contracts.my_amount > 0 && (
                            <div className="pt-4 border-t border-dashed border-blue-100">
                               <p className="text-sm text-blue-600 font-medium mb-1">Моя доля</p>
                               <p className="text-xl font-bold text-blue-700">
                                  {formatCurrency(project.stats.contracts.my_amount)}
                               </p>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Works */}
                 <div className="relative group">
                    <div className="absolute inset-0 bg-emerald-50 rounded-2xl transform -rotate-1 transition-transform group-hover:-rotate-2"></div>
                    <div className="relative bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
                       <div className="flex items-center justify-between mb-6">
                          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                             <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Выполнено</span>
                       </div>
                       
                       <div className="space-y-4">
                          <div>
                             <p className="text-sm text-muted-foreground mb-1">Всего по проекту</p>
                             <p className="text-2xl font-bold text-foreground tracking-tight">
                                {formatCurrency(project.stats.works.total_amount)}
                             </p>
                          </div>
                          
                          {project.stats.works.my_amount > 0 && (
                            <div className="pt-4 border-t border-dashed border-emerald-100">
                               <p className="text-sm text-emerald-600 font-medium mb-1">Моя доля</p>
                               <p className="text-xl font-bold text-emerald-700">
                                  {formatCurrency(project.stats.works.my_amount)}
                               </p>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>

            {/* Team Widget */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="bg-white rounded-3xl p-8 border border-border shadow-sm"
            >
               <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Команда</h3>
                </div>
                <Badge variant="secondary" className="rounded-lg">{project.participants.total} участников</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {project.participants.list.map((participant, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-colors bg-white">
                       {participant.logo ? (
                          <img src={participant.logo} alt={participant.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
                       ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                             <Building2 className="w-6 h-6" />
                          </div>
                       )}
                       <div className="min-w-0">
                          <p className="font-bold text-foreground text-sm truncate">{participant.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{participant.organization_name || participant.role_label}</p>
                          {participant.organization_name && (
                             <span className="inline-block mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">
                                {participant.role_label}
                             </span>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-border flex justify-center">
                 <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                    Все участники <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;

