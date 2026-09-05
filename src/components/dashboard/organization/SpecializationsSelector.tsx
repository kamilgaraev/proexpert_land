import { useId, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SpecializationsSelectorProps {
  selectedSpecializations: string[];
  onChange: (specializations: string[]) => void;
  disabled?: boolean;
}

const SPECIALIZATIONS = [
  { value: 'building_construction', label: 'Промышленное и гражданское строительство' },
  { value: 'road_construction', label: 'Дорожное строительство' },
  { value: 'bridge_construction', label: 'Мостовое строительство' },
  { value: 'electrical_works', label: 'Электромонтажные работы' },
  { value: 'plumbing_works', label: 'Сантехнические работы' },
  { value: 'hvac_systems', label: 'Системы отопления и вентиляции' },
  { value: 'roofing_works', label: 'Кровельные работы' },
  { value: 'facade_works', label: 'Фасадные работы' },
  { value: 'foundation_works', label: 'Фундаментные работы' },
  { value: 'interior_finishing', label: 'Внутренняя отделка' },
  { value: 'landscape_works', label: 'Благоустройство территории' },
  { value: 'demolition_works', label: 'Демонтажные работы' },
];

export const SpecializationsSelector = ({ selectedSpecializations, onChange, disabled = false }: SpecializationsSelectorProps) => {
  const searchId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const selected = selectedSpecializations || [];
  const toggle = (value: string) => {
    if (disabled) return;
    onChange(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  };
  const filtered = SPECIALIZATIONS.filter(item => item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={searchId}>Найти специализацию</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id={searchId} type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} disabled={disabled} className="pl-10" />
        </div>
      </div>
      <fieldset disabled={disabled} className="min-w-0">
        <legend className="sr-only">Специализации</legend>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map(item => (
            <label key={item.value} className={`flex min-w-0 items-start gap-3 rounded border p-3 ${selected.includes(item.value) ? 'border-foreground/40 bg-secondary/40' : 'border-border bg-background'} ${disabled ? 'opacity-60' : 'cursor-pointer hover:border-foreground/40'}`}>
              <input type="checkbox" checked={selected.includes(item.value)} onChange={() => toggle(item.value)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
              <span className="min-w-0 text-sm font-medium">{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {filtered.length === 0 && <p role="status" className="text-sm text-muted-foreground">Специализации не найдены</p>}
      {selected.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">Выбрано специализаций: {selected.length}</p>
          <div className="flex flex-wrap gap-2">
            {selected.map(value => {
              const item = SPECIALIZATIONS.find(option => option.value === value);
              return item ? (
                <Button key={value} type="button" variant="outline" size="sm" disabled={disabled}
                  aria-label={`Убрать специализацию «${item.label}»`} onClick={() => toggle(value)}
                  className="h-auto gap-2 whitespace-normal text-left">
                  <span className="min-w-0">{item.label}</span><X className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Button>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};