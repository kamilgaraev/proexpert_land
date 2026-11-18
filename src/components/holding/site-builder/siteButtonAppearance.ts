export const buttonShapes = ['square', 'rounded', 'pill'] as const;

export type SiteButtonAction = 'link' | 'upload' | 'submit';
export type ButtonShape = (typeof buttonShapes)[number];

export interface SiteButtonAppearance {
  background?: string;
  foreground?: string;
  border?: string;
  shape?: ButtonShape;
  width?: number | 'auto';
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const hexColor = (value: unknown) => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value) ? value : undefined;

export const readButtonAppearance = (style: Record<string, unknown> | undefined, action: SiteButtonAction): SiteButtonAppearance => {
  const buttons = style?.buttons;
  const value = isRecord(buttons) ? buttons[action] : undefined;
  if (!isRecord(value)) return {};

  const { background, foreground, border, shape, width } = value;
  return {
    background: hexColor(background),
    foreground: hexColor(foreground),
    border: hexColor(border),
    shape: shape === 'square' || shape === 'rounded' || shape === 'pill' ? shape : undefined,
    width: width === 'auto' ? width : typeof width === 'number' && Number.isFinite(width)
      ? Math.min(100, Math.max(25, Math.round(width)))
      : undefined,
  };
};

export const writeButtonAppearance = (style: Record<string, unknown> | undefined, action: SiteButtonAction, appearance: SiteButtonAppearance) => ({
  buttons: { ...(isRecord(style?.buttons) ? style.buttons : {}), [action]: appearance },
});

export const getButtonHref = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const href = value.trim();

  try {
    const { protocol } = new URL(href, 'https://site.invalid');
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(protocol) ? href : undefined;
  } catch {
    return undefined;
  }
};
