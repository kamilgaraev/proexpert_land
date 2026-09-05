import { useId, useState } from 'react';
import { FileCheck2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CertificationsListProps {
  certifications: string[];
  onChange: (certifications: string[]) => void;
  disabled?: boolean;
}

export const CertificationsList = ({ certifications, onChange, disabled = false }: CertificationsListProps) => {
  const inputId = useId();
  const [newCertification, setNewCertification] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const items = certifications || [];
  const value = newCertification.trim();
  const duplicate = value !== '' && items.includes(value);
  const cancel = () => { setIsAdding(false); setNewCertification(''); };
  const add = () => {
    if (disabled || !value || duplicate) return;
    onChange([...items, value]);
    cancel();
  };

  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        <ul className="divide-y divide-border border-y border-border">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex min-w-0 items-start gap-3 py-3">
              <FileCheck2 className="mt-2 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 break-words py-2 text-sm">{item}</span>
              {!disabled && (
                <Button type="button" variant="ghost" size="icon" aria-label={`Удалить сертификат «${item}»`}
                  onClick={() => onChange(items.filter(cert => cert !== item))}>
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-muted-foreground">Сертификаты не добавлены</p>}
      {!disabled && (isAdding ? (
        <div className="space-y-3">
          <Label htmlFor={inputId}>Название сертификата</Label>
          <Input id={inputId} value={newCertification} onChange={event => setNewCertification(event.target.value)}
            placeholder="Например, ISO 9001" autoFocus aria-invalid={duplicate} aria-describedby={duplicate ? `${inputId}-error` : undefined}
            onKeyDown={event => {
              if (event.key === 'Enter') { event.preventDefault(); add(); }
              if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancel(); }
            }} />
          {duplicate && <p id={`${inputId}-error`} role="status" className="text-sm text-muted-foreground">Этот сертификат уже добавлен.</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={add} disabled={!value || duplicate}>Добавить</Button>
            <Button type="button" variant="outline" onClick={cancel}>Отмена</Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="h-5 w-5" aria-hidden="true" />Добавить сертификат
        </Button>
      ))}
      {items.length > 0 && <p className="text-sm text-muted-foreground">Добавлено сертификатов: {items.length}</p>}
    </div>
  );
};