export function getOpenGraphLocale(lang = 'ru'): string {
  try {
    const locale = new Intl.Locale(lang.replace(/_/g, '-')).maximize();
    return locale.region ? `${locale.language}_${locale.region}` : 'en_US';
  } catch {
    return 'ru_RU';
  }
}
