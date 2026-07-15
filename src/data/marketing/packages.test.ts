import { describe, expect, it } from 'vitest';
import {
  commercialPackages,
  fullSuiteOffer,
  getCommercialSelection,
  marketingPackageCatalogSource,
} from './packages';

describe('коммерческий каталог пакетов', () => {
  it('точно отражает серверный каталог из десяти пакетов', () => {
    expect(marketingPackageCatalogSource).toBe(
      'Backend МОСТ: config/Packages/*.json, config/commercial_offers.php, config/module_packages.php',
    );
    expect(commercialPackages.map(({ slug, name, price }) => [slug, name, price])).toEqual([
      ['projects-processes', 'Проекты и процессы', 9_900],
      ['planning-schedules', 'Графики и планирование', 7_900],
      ['estimates-norms', 'Сметы и нормы', 12_900],
      ['quality-safety', 'Качество и безопасность', 9_900],
      ['pto-handover', 'ПТО и сдача', 11_900],
      ['supply-warehouse', 'Снабжение и склад', 11_900],
      ['finance-contracts', 'Финансы и договоры', 12_900],
      ['workforce-output', 'Персонал и выработка', 9_900],
      ['machinery', 'Техника и механизмы', 7_900],
      ['sales-contractors', 'Продажи и подрядчики', 7_900],
    ]);
  });

  it('зеркалит серверный состав бесплатной базы и модулей каждого пакета', () => {
    expect(commercialPackages[0].foundationModules).toEqual([
      'organizations',
      'users',
      'project-management',
      'contract-management',
      'catalog-management',
      'workflow-management',
      'act-reporting',
      'payments',
      'reports',
      'dashboard-widgets',
      'data-filters',
      'brigades',
    ]);
    expect(commercialPackages.map(({ slug, moduleSlugs }) => [slug, moduleSlugs])).toEqual([
      ['projects-processes', ['site-requests', 'file-management']],
      ['planning-schedules', ['schedule-management']],
      ['estimates-norms', ['budget-estimates', 'rate-management']],
      ['quality-safety', ['budget-estimates', 'file-management', 'quality-control', 'safety-management']],
      ['pto-handover', ['budget-estimates', 'file-management', 'quality-control', 'report-templates', 'executive-documentation', 'design-management', 'handover-acceptance']],
      ['supply-warehouse', ['site-requests', 'basic-warehouse', 'procurement', 'material-analytics']],
      ['finance-contracts', ['budget-estimates', 'budgeting', 'change-management', 'advance-accounting']],
      ['workforce-output', ['time-tracking', 'budget-estimates', 'workforce-management', 'production-labor']],
      ['machinery', ['budget-estimates', 'site-requests', 'machinery-operations']],
      ['sales-contractors', ['crm', 'commercial-proposals', 'contractor-portal']],
    ]);
  });

  it('фиксирует серверные описания, акценты и бизнес-результаты всех пакетов', () => {
    expect(commercialPackages.map((item) => ({
      slug: item.slug,
      description: item.description,
      highlights: item.highlights,
      outcomes: item.businessOutcomes,
    }))).toEqual([
      { slug: 'projects-processes', description: 'Управление объектами, рабочими процессами и заявками с площадки в едином контуре.', highlights: ['Заявки с объекта', 'Файлы и документы'], outcomes: ['Единый порядок работы по объектам', 'Связь офиса и строительной площадки'] },
      { slug: 'planning-schedules', description: 'Календарное и оперативное планирование работ по объектам.', highlights: ['Календарные графики', 'Оперативное планирование'], outcomes: ['Управляемые сроки и последовательность работ'] },
      { slug: 'estimates-norms', description: 'Сметы, расценки, нормы и связанные расчёты для строительных проектов.', highlights: ['Сметы', 'Расценки и нормы'], outcomes: ['Единая сметно-нормативная база', 'Контролируемые расчёты стоимости'] },
      { slug: 'quality-safety', description: 'Контроль качества работ, охрана труда и безопасность на строительной площадке.', highlights: ['Инспекции и дефекты', 'Инструктажи и безопасность'], outcomes: ['Системный контроль качества', 'Управляемая охрана труда'] },
      { slug: 'pto-handover', description: 'Исполнительная и проектная документация, контроль качества и приёмка результата.', highlights: ['Исполнительная документация', 'ПИР', 'Приёмка'], outcomes: ['Комплектная исполнительная документация', 'Прозрачная приёмка и сдача'] },
      { slug: 'supply-warehouse', description: 'Закупки, складской учёт и материальный контроль по объектам.', highlights: ['Заявки на снабжение', 'Закупки', 'Склад и материалы'], outcomes: ['Прозрачное снабжение', 'Контроль остатков и движения материалов'] },
      { slug: 'finance-contracts', description: 'Договоры, бюджетирование, акты и финансовый контроль строительных проектов.', highlights: ['Бюджетирование', 'Изменения и претензии', 'Подотчётные средства'], outcomes: ['Финансовый план-факт по объектам', 'Контроль договорных изменений'] },
      { slug: 'workforce-output', description: 'Рабочее время, персонал, наряды и фактическая выработка по объектам.', highlights: ['Учёт времени', 'Персонал', 'Наряды и выработка'], outcomes: ['Контроль трудозатрат', 'Проверяемая выработка по объектам'] },
      { slug: 'machinery', description: 'Эксплуатация техники, заявки, смены, простои и производственные показатели.', highlights: ['Заявки на технику', 'Сменные рапорты', 'Простои'], outcomes: ['Прозрачная загрузка техники', 'Контроль смен и простоев'] },
      { slug: 'sales-contractors', description: 'CRM, коммерческие предложения и совместная работа с подрядчиками.', highlights: ['CRM', 'Коммерческие предложения', 'Портал подрядчиков'], outcomes: ['Единая воронка продаж', 'Управляемая работа с подрядчиками'] },
    ]);
  });

  it('фиксирует цену и экономию полного комплекта', () => {
    const separateTotal = commercialPackages.reduce((sum, item) => sum + item.price, 0);

    expect(separateTotal).toBe(103_000);
    expect(fullSuiteOffer.price).toBe(79_900);
    expect(fullSuiteOffer.savings).toBe(23_100);
    expect(fullSuiteOffer.savingsPercent).toBe(22.43);
    expect(fullSuiteOffer.billingPeriodDays).toBe(30);
  });

  it('рекомендует полный комплект с восьми пакетов, но не меняет выбор', () => {
    const slugs = commercialPackages.slice(0, 8).map((item) => item.slug);
    const selection = getCommercialSelection(slugs);

    expect(selection.selectedSlugs).toEqual(slugs);
    expect(selection.total).toBe(87_200);
    expect(selection.recommendFullSuite).toBe(true);
    expect(selection.isFullSuite).toBe(false);
  });
});
