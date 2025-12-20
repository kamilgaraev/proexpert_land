import { CheckCircle } from 'lucide-react';
import type { ModuleInfo } from '@/types/organization-profile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RecommendedModulesCardProps {
  modules: ModuleInfo[];
  onModuleClick: (moduleId: string) => void;
  showTitle?: boolean;
}

const MODULE_LABELS: Record<string, string> = {
  'project-management': 'Управление проектами',
  'contract-management': 'Управление договорами',
  'basic-warehouse': 'Базовый склад',
  'schedule-management': 'Управление графиками',
  'advanced-dashboard': 'Расширенная аналитика',
  'time-tracking': 'Учет времени',
  'workflow-management': 'Управление процессами',
  'catalog-management': 'Управление каталогом',
  'document-management': 'Управление документами',
  'financial-management': 'Финансовое управление',
  'hr-management': 'Управление персоналом',
  'equipment-management': 'Управление техникой'
};

const MODULE_DESCRIPTIONS: Record<string, string> = {
  'project-management': 'Планирование, контроль и координация строительных проектов',
  'contract-management': 'Управление договорами с подрядчиками и поставщиками',
  'basic-warehouse': 'Учет материалов и складских остатков',
  'schedule-management': 'Планирование графиков работ и контроль сроков',
  'advanced-dashboard': 'Детальная аналитика и отчетность по проектам',
  'time-tracking': 'Учет рабочего времени сотрудников и подрядчиков',
  'workflow-management': 'Автоматизация бизнес-процессов',
  'catalog-management': 'Каталог материалов и оборудования',
  'document-management': 'Хранение и управление проектной документацией',
  'financial-management': 'Финансовый учет и планирование бюджета',
  'hr-management': 'Управление персоналом и кадрами',
  'equipment-management': 'Учет и планирование использования техники'
};

const getModuleId = (module: ModuleInfo): string => {
  if (typeof module === 'string') return module;
  return module.value;
};

const getModuleLabel = (module: ModuleInfo): string => {
  if (typeof module === 'string') {
    return MODULE_LABELS[module] || module;
  }
  return module.label || MODULE_LABELS[module.value] || module.value;
};

export const RecommendedModulesCard = ({
  modules,
  onModuleClick,
  showTitle = true
}: RecommendedModulesCardProps) => {
  if (!modules || modules.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">
            Заполните профиль организации, чтобы получить рекомендации по модулям
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Рекомендуемые модули
          </h3>
          <p className="text-sm text-gray-600">
            На основе профиля вашей организации
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => {
          const moduleId = getModuleId(module);
          const moduleLabel = getModuleLabel(module);
          const moduleDescription = MODULE_DESCRIPTIONS[moduleId];

          return (
            <Card 
              key={moduleId}
              className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-construction-300"
              onClick={() => onModuleClick(moduleId)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base group-hover:text-construction-600 transition-colors">
                      {moduleLabel}
                    </CardTitle>
                    {moduleDescription && (
                      <CardDescription className="text-sm mt-1">
                        {moduleDescription}
                      </CardDescription>
                    )}
                  </div>
                  <CheckCircle className="w-5 h-5 text-construction-500 flex-shrink-0 ml-2" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-construction-600 hover:bg-construction-50 group-hover:bg-construction-50"
                >
                  Подключить модуль →
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-construction-50 border border-construction-200 rounded-lg">
        <p className="text-sm text-construction-800">
          <strong>💡 Совет:</strong> Эти модули автоматически подобраны на основе возможностей и специализаций вашей организации. Вы можете подключить их в разделе "Модули".
        </p>
      </div>
    </div>
  );
};

