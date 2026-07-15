import { CheckCircle } from 'lucide-react';
import type { CommercialPackage, CommercialPackageSlug } from '@/data/marketing/packages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">
            Заполните профиль организации, чтобы получить рекомендации по пакетам
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle ? (
        <div>
          <h3 className="mb-1 text-lg font-semibold text-gray-900">Рекомендуемые пакеты</h3>
          <p className="text-sm text-gray-600">На основе профиля вашей организации</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {packages.map((item) => (
          <button
            key={item.slug}
            type="button"
            className="group rounded-xl text-left"
            onClick={() => onPackageClick(item.slug)}
          >
            <Card className="h-full transition-all duration-200 group-hover:border-construction-300 group-hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base transition-colors group-hover:text-construction-600">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">{item.description}</CardDescription>
                  </div>
                  <CheckCircle className="ml-2 h-5 w-5 flex-shrink-0 text-construction-500" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full text-construction-600 group-hover:bg-construction-50"
                >
                  <span>Выбрать пакет →</span>
                </Button>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-construction-200 bg-construction-50 p-4">
        <p className="text-sm text-construction-800">
          Состав можно изменить в разделе «Пакеты и оплата».
        </p>
      </div>
    </div>
  );
};
