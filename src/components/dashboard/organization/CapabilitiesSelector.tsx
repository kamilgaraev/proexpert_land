import { Button } from '@/components/ui/button';
import type { OrganizationCapability, CapabilityInfo } from '@/types/organization-profile';
import type { CommercialPackageSlug } from '@/data/marketing/packages';
import { getRecommendedPackages } from '@/utils/recommendedPackages';

interface CapabilitiesSelectorProps {
  selectedCapabilities: OrganizationCapability[];
  availableCapabilities: CapabilityInfo[];
  onChange: (capabilities: OrganizationCapability[]) => void;
  onPackageClick: (packageSlug: CommercialPackageSlug) => void;
  showRecommendations?: boolean;
  disabled?: boolean;
}

const CAPABILITY_LABELS: Record<OrganizationCapability, string> = {
  general_contracting: 'Генеральный подряд',
  subcontracting: 'Субподрядные работы',
  design: 'Проектирование',
  construction_supervision: 'Строительный контроль',
  equipment_rental: 'Аренда техники',
  materials_supply: 'Поставка материалов',
  consulting: 'Консалтинг',
  facility_management: 'Эксплуатация объектов',
};

const capabilities = Object.keys(CAPABILITY_LABELS) as OrganizationCapability[];

export const CapabilitiesSelector = ({
  selectedCapabilities,
  availableCapabilities,
  onChange,
  onPackageClick,
  showRecommendations = false,
  disabled = false,
}: CapabilitiesSelectorProps) => {
  const selected = selectedCapabilities || [];
  const available = availableCapabilities || [];
  const recommendedPackages = getRecommendedPackages(selected.flatMap(capability =>
    available.find(item => item.value === capability)?.recommended_modules || [],
  ));

  const toggle = (capability: OrganizationCapability) => {
    if (disabled) return;
    onChange(selected.includes(capability)
      ? selected.filter(item => item !== capability)
      : [...selected, capability]);
  };

  return (
    <div className="space-y-5">
      <fieldset disabled={disabled} className="min-w-0">
        <legend className="sr-only">Направления деятельности</legend>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {capabilities.map(capability => {
            const isSelected = selected.includes(capability);
            const info = available.find(item => item.value === capability);
            return (
              <label key={capability} className={`flex min-w-0 items-start gap-3 rounded border p-4 ${isSelected ? 'border-foreground/40 bg-secondary/40' : 'border-border bg-background'} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-foreground/40'}`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(capability)}
                  aria-label={CAPABILITY_LABELS[capability]}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{CAPABILITY_LABELS[capability]}</span>
                  {info && <span className="mt-1 block text-sm text-muted-foreground">{info.description}</span>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {showRecommendations && selected.length > 0 && recommendedPackages.length > 0 && (
        <section className="space-y-3 border-t border-border pt-4" aria-label="Рекомендуемые пакеты">
          <h4 className="text-sm font-semibold">Рекомендуемые пакеты</h4>
          <div className="flex flex-wrap gap-2">
            {recommendedPackages.map(item => (
              <Button key={item.slug} type="button" variant="outline" size="sm"
                onClick={() => onPackageClick(item.slug)} className="h-auto whitespace-normal text-left">
                {item.name}
              </Button>
            ))}
          </div>
        </section>
      )}
      {selected.length === 0 && (
        <p className="text-sm text-muted-foreground">Выберите хотя бы одно направление деятельности.</p>
      )}
    </div>
  );
};