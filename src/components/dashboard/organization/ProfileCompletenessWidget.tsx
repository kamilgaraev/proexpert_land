import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileCompletenessWidgetProps {
  completeness: number;
  missingFields?: string[];
  onComplete?: () => void;
  className?: string;
}

const FIELD_LABELS: Record<string, string> = {
  capabilities: 'Направления деятельности',
  primary_business_type: 'Основной режим работы',
  specializations: 'Специализации',
  certifications: 'Сертификаты и допуски',
  description: 'Описание организации',
  contacts: 'Контактная информация',
};

export const ProfileCompletenessWidget = ({
  completeness,
  missingFields = [],
  onComplete,
  className = '',
}: ProfileCompletenessWidgetProps) => {
  const progress = Number.isFinite(completeness) ? Math.min(100, Math.max(0, completeness)) : 0;

  return (
    <Card className={`min-w-0 ${className}`}>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold">Полнота профиля</h3>
          <span className="text-2xl font-semibold tabular-nums">{progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Полнота профиля"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full rounded-full bg-foreground" style={{ width: `${progress}%` }} />
        </div>
        {missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Осталось заполнить:</p>
            <ul className="space-y-2 text-sm">
              {missingFields.map((field) => (
                <li key={field}>{FIELD_LABELS[field] || 'Данные организации'}</li>
              ))}
            </ul>
          </div>
        )}
        {progress >= 100 ? (
          <p className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            Профиль полностью заполнен
          </p>
        ) : onComplete ? (
          <Button variant="outline" onClick={onComplete} className="h-auto min-h-11 w-full gap-2 whitespace-normal py-3 text-left">
            <span className="min-w-0 flex-1">Завершить настройку профиля</span>
            <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};