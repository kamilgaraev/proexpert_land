import type { ButtonShape } from '@/types/holding-site-builder';
import type { SiteButtonAppearance } from './siteButtonAppearance';
import { buttonShapes } from './siteButtonAppearance';

const shapeLabels: Record<ButtonShape, string> = {
  square: 'Прямые углы',
  rounded: 'Скруглённые углы',
  pill: 'Капсула',
};

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900';
const colorFields = [
  { key: 'background', label: 'Фон', fallback: '#0f172a' },
  { key: 'foreground', label: 'Текст', fallback: '#ffffff' },
  { key: 'border', label: 'Обводка', fallback: '#94a3b8' },
] as const;

export default function SiteButtonStyleEditor({
  appearance, disabled, label, onChange, selectRef,
}: {
  appearance: SiteButtonAppearance;
  disabled: boolean;
  label: string;
  onChange: (patch: Partial<SiteButtonAppearance> | null) => void;
  selectRef?: (element: HTMLSelectElement | null) => void;
}) {
  const width = appearance.width;

  return (
    <fieldset className="grid gap-3 rounded-xl border border-slate-200 p-4" disabled={disabled}>
      <legend className="px-1 text-sm font-semibold text-slate-950">{label}</legend>
      <label className="grid gap-1 text-sm">
        Форма
        <select
          className={fieldClass}
          ref={selectRef}
          value={appearance.shape ?? ''}
          onChange={event => onChange({ shape: buttonShapes.find(shape => shape === event.target.value) })}
        >
          <option value="">По теме</option>
          {buttonShapes.map(shape => <option key={shape} value={shape}>{shapeLabels[shape]}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Ширина
        <select
          className={fieldClass}
          value={typeof width === 'number' ? 'percent' : width ?? ''}
          onChange={event => onChange({ width: event.target.value === 'percent' ? 100 : event.target.value === 'auto' ? 'auto' : undefined })}
        >
          <option value="">По теме</option>
          <option value="auto">По тексту</option>
          <option value="percent">Задать в процентах</option>
        </select>
      </label>
      {typeof width === 'number' && (
        <label className="grid gap-1 text-sm">
          <span>Ширина в процентах <strong>{width}%</strong></span>
          <input type="range" min={25} max={100} value={width} onChange={event => onChange({ width: event.target.valueAsNumber })} />
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {colorFields.map(({ key, label: colorLabel, fallback }) => (
          <div className="min-w-0" key={key}>
            <label className="grid gap-1 text-xs">
              {colorLabel}
              <input
                className="h-9 w-full rounded-lg border border-slate-200 bg-white"
                type="color"
                value={appearance[key] ?? fallback}
                onInput={event => onChange({ [key]: event.currentTarget.value })}
              />
            </label>
            {appearance[key] && (
              <button className="mt-1 text-xs text-slate-700 underline" type="button" onClick={() => onChange({ [key]: undefined })}>
                По теме
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="justify-self-start text-sm font-medium text-slate-700 underline" type="button" onClick={() => onChange(null)}>
        Сбросить оформление
      </button>
    </fieldset>
  );
}
