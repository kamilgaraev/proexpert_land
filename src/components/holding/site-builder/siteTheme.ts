import type { CSSProperties } from 'react';
import type { ButtonShape, SitePalette, ThemeConfig } from '@/types/holding-site-builder';

const corporatePalette: SitePalette = {
  page: '#f4f1e9',
  surface: '#fcfaf4',
  text: '#182724',
  primary: '#182724',
  accent: '#efc46a',
};

const solidColor = (value: unknown, fallback: string): string =>
  typeof value === 'string' && /^#[\da-f]{6}$/i.test(value) ? value : fallback;

const contrastText = (background: string) => {
  const channel = (start: number) => {
    const value = parseInt(background.slice(start, start + 2), 16) / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  };
  const luminance = .2126 * channel(1) + .7152 * channel(3) + .0722 * channel(5);
  return luminance > .179 ? '#000000' : '#ffffff';
};

const buttonRadii: Record<ButtonShape, string> = { square: '0px', rounded: '10px', pill: '999px' };

export const getSitePalette = (theme: ThemeConfig): SitePalette => {
  const defaults = theme.surface_style === 'corporate' ? corporatePalette : {
    page: solidColor(theme.background_color, '#ffffff'),
    surface: '#ffffff',
    text: solidColor(theme.text_color, '#111827'),
    primary: solidColor(theme.primary_color, '#2563eb'),
    accent: solidColor(theme.accent_color, '#f59e0b'),
  };
  const custom = theme.palette;
  return {
    page: solidColor(custom?.page, defaults.page),
    surface: solidColor(custom?.surface, defaults.surface),
    text: solidColor(custom?.text, defaults.text),
    primary: solidColor(custom?.primary, defaults.primary),
    accent: solidColor(custom?.accent, defaults.accent),
  };
};

export const hasSitePalette = (theme: ThemeConfig) => theme.surface_style === 'corporate'
  || Object.values(theme.palette ?? {}).some(color => solidColor(color, '') !== '');

export const getSiteThemeStyle = (theme: ThemeConfig): CSSProperties => {
  const palette = getSitePalette(theme);
  const onPrimary = contrastText(palette.primary);

  return {
    '--holding-page': palette.page,
    '--holding-surface': palette.surface,
    '--holding-text': palette.text,
    '--holding-primary': palette.primary,
    '--holding-on-primary': onPrimary,
    '--holding-primary-scheme': onPrimary === '#ffffff' ? 'dark' : 'light',
    '--holding-accent': palette.accent,
    '--holding-on-accent': contrastText(palette.accent),
    '--site-button-radius': (theme.button_shape && buttonRadii[theme.button_shape])
      || (theme.surface_style === 'corporate' ? '4px' : '999px'),
  } as CSSProperties;
};
