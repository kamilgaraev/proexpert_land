import { ArrowUpRight } from 'lucide-react';
import type { CommercialPackage, CommercialPackageSlug } from '@/data/marketing/packages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RecommendedPackagesCardProps {
  packages: CommercialPackage[];
  onPackageClick: (packageSlug: CommercialPackageSlug) => void;
  showTitle?: boolean;
}

export const RecommendedPackagesCard = ({
  packages,
  onPackageClick,
  showTitle = true,
}: RecommendedPackagesCardProps) => {
  if (packages.length === 0) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Заполните профиль организации, чтобы получить рекомендации по пакетам.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {showTitle && (
        <div>
          <h3 className="text-lg font-semibold">Рекомендуемые пакеты</h3>
          <p className="mt-1 text-sm text-muted-foreground">На основе профиля вашей организации</p>
        </div>
      )}
      <div className="divide-y divide-border border-y border-border">
        {packages.map(item => (
          <Button key={item.slug} type="button" variant="ghost"
            onClick={() => onPackageClick(item.slug)}
            className="h-auto w-full items-start justify-start gap-3 whitespace-normal rounded-none px-1 py-4 text-left">
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{item.name}</span>
              <span className="mt-1 block text-sm font-normal text-muted-foreground">{item.description}</span>
            </span>
            <ArrowUpRight className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Состав можно изменить в разделе «Пакеты и оплата».</p>
    </div>
  );
};