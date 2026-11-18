import type { SitePalette, ThemeConfig } from '@/types/holding-site-builder';
import { buttonShapes } from './siteButtonAppearance';
import { getSitePalette } from './siteTheme';

const colors: Array<{ key: keyof SitePalette; label: string }> = [
  { key: 'primary', label: 'Основной цвет' },
  { key: 'accent', label: 'Акцент и кнопки' },
  { key: 'page', label: 'Фон страницы' },
  { key: 'surface', label: 'Фон шапки и карточек' },
  { key: 'text', label: 'Текст на фоне страницы и карточек' },
];
const shapeLabels = { square: 'Прямые углы', rounded: 'Скруглённые углы', pill: 'Капсула' };

export default function SiteThemeEditor({ theme, disabled, onChange }: {
  theme: ThemeConfig;
  disabled: boolean;
  onChange: (update: (current: ThemeConfig) => Partial<ThemeConfig>) => void;
}) {
  const effective = getSitePalette(theme);

  return (
    <fieldset className="grid gap-3 rounded-xl border border-slate-200 p-4" disabled={disabled}>
      <legend className="px-1 text-sm font-semibold text-slate-950">Палитра сайта</legend>
      <p className="text-xs text-slate-600">Основной цвет используется в меню, знаке сайта и выделенных секциях.</p>
      {colors.map(({ key, label }) => (
        <label className="flex items-center justify-between gap-3 text-sm" key={key}>
          {label}
          <input
            className="h-9 w-12 shrink-0 rounded-lg border border-slate-200 bg-white"
            type="color"
            value={effective[key]}
            onChange={event => {
              const value = event.currentTarget.value;
              onChange(current => ({ palette: { ...current.palette, [key]: value } }));
            }}
          />
        </label>
      ))}
      <label className="grid gap-1 text-sm">
        Форма кнопок по умолчанию
        <select
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          value={theme.button_shape ?? ''}
          onChange={event => {
            const shape = buttonShapes.find(item => item === event.currentTarget.value) ?? null;
            onChange(() => ({ button_shape: shape }));
          }}
        >
          <option value="">По теме</option>
          {buttonShapes.map(shape => <option key={shape} value={shape}>{shapeLabels[shape]}</option>)}
        </select>
      </label>
      <button className="justify-self-start text-sm font-medium text-slate-700 underline" type="button" onClick={() => onChange(() => ({ palette: null, button_shape: null }))}>
        Вернуть оформление темы
      </button>
    </fieldset>
  );
}
