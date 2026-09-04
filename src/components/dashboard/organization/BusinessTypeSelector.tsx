import { Briefcase } from 'lucide-react';
import type { OrganizationCapability } from '@/types/organization-profile';
import { filterBusinessTypeOptions } from '@/utils/organizationProfile';

interface BusinessTypeSelectorProps {
  selectedType: OrganizationCapability | null;
  onChange: (type: OrganizationCapability) => void;
  disabled?: boolean;
  availableTypes?: OrganizationCapability[];
}

export const BusinessTypeSelector = ({
  selectedType,
  onChange,
  disabled = false,
  availableTypes = [],
}: BusinessTypeSelectorProps) => {
  const businessTypes = filterBusinessTypeOptions(availableTypes);

  if (businessTypes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted px-6 py-8 text-sm text-muted-foreground">
        Сначала выберите направления деятельности организации, чтобы определить основной режим работы.
      </div>
    );
  }

  return (
    <fieldset className="min-w-0 space-y-4" disabled={disabled}>
      <legend className="sr-only">Основной режим работы</legend>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {businessTypes.map((type) => (
          <label
            key={type.value}
            className={`flex min-w-0 items-start gap-3 rounded-lg border p-4 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${selectedType === type.value ? 'border-primary bg-accent' : 'border-border bg-card hover:bg-muted'}`}
          >
            <input
              type="radio"
              name="primary-business-type"
              value={type.value}
              checked={selectedType === type.value}
              onChange={() => onChange(type.value)}
              className="mt-1 h-5 w-5 shrink-0 accent-primary focus-visible:!outline-none"
              aria-label={type.label}
            />
            <span className="min-w-0 flex-1 space-y-1">
              <span className="flex items-center gap-2 text-base font-semibold">
                <Briefcase className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                {type.label}
              </span>
              <span className="block text-sm text-muted-foreground">{type.description}</span>
            </span>
          </label>
        ))}
      </div>
      {!selectedType && businessTypes.length > 1 && (
        <p className="text-sm text-muted-foreground">
          Выберите основной режим работы, который должен открываться первым в личном кабинете.
        </p>
      )}
    </fieldset>
  );
};
