import { describe, expect, it } from 'vitest';
import {
  commercialPackages,
  fullSuiteOffer,
  getCommercialSelection,
  marketingPackageCatalogSource,
} from './packages';

describe('коммерческий каталог пакетов', () => {
  it('точно отражает серверный каталог из рабочего входа и шести контуров', () => {
    expect(marketingPackageCatalogSource).toBe(
      'Backend МОСТ: config/Packages/*.json, config/commercial_offers.php, config/module_packages.php',
    );
    expect(commercialPackages.map(({ slug, name, price }) => [slug, name, price])).toEqual([
      ['working-entry', 'Рабочий вход', 39_900],
      ['supply-warehouse', 'Снабжение и склад', 9_900],
      ['finance-contracts', 'Финансы и договоры', 9_900],
      ['quality-safety', 'Качество и безопасность', 6_900],
      ['workforce-output', 'Персонал и выработка', 7_900],
      ['machinery', 'Техника и механизмы', 5_900],
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
      ['working-entry', ['site-requests', 'file-management', 'ai-assistant', 'data-export', 'schedule-management', 'budget-estimates', 'rate-management', 'ai-estimates', 'quality-control', 'report-templates', 'executive-documentation', 'design-management', 'handover-acceptance']],
      ['supply-warehouse', ['site-requests', 'basic-warehouse', 'procurement', 'material-analytics']],
      ['finance-contracts', ['budget-estimates', 'budgeting', 'change-management', 'advance-accounting', 'one-c-basic-exchange']],
      ['quality-safety', ['budget-estimates', 'file-management', 'quality-control', 'safety-management', 'video-monitoring', 'access_recertification']],
      ['workforce-output', ['time-tracking', 'budget-estimates', 'workforce-management', 'production-labor']],
      ['machinery', ['budget-estimates', 'site-requests', 'machinery-operations']],
      ['sales-contractors', ['crm', 'commercial-proposals', 'contractor-portal', 'file-management', 'tenders']],
    ]);
  });

  it('фиксирует серверные описания, акценты и бизнес-результаты всех пакетов', () => {
    expect(commercialPackages.map((item) => ({
      slug: item.slug,
      description: item.description,
      highlights: item.highlights,
      outcomes: item.businessOutcomes,
    }))).toEqual([
      { slug: 'working-entry', description: 'Объекты, заявки, графики, сметы и сдача объекта в одном платном минимуме.', highlights: ['Заявки с объекта', 'Графики', 'Сметы и нормы', 'ПТО и сдача', 'Помощник'], outcomes: ['Единый порядок работы по объектам', 'Управляемые сроки', 'Единая сметно-нормативная база', 'Комплектная исполнительная документация'] },
      { slug: 'supply-warehouse', description: 'Закупки, складской учёт и материальный контроль по объектам.', highlights: ['Заявки на снабжение', 'Закупки', 'Склад и материалы'], outcomes: ['Прозрачное снабжение', 'Контроль остатков и движения материалов'] },
      { slug: 'finance-contracts', description: 'Договоры, бюджетирование, акты и финансовый контроль строительных проектов.', highlights: ['Бюджетирование', 'Изменения и претензии', 'Подотчётные средства'], outcomes: ['Финансовый план-факт по объектам', 'Контроль договорных изменений'] },
      { slug: 'quality-safety', description: 'Контроль качества работ, охрана труда и безопасность на строительной площадке.', highlights: ['Инспекции и дефекты', 'Инструктажи и безопасность'], outcomes: ['Системный контроль качества', 'Управляемая охрана труда'] },
      { slug: 'workforce-output', description: 'Рабочее время, персонал, наряды и фактическая выработка по объектам.', highlights: ['Учёт времени', 'Персонал', 'Наряды и выработка'], outcomes: ['Контроль трудозатрат', 'Проверяемая выработка по объектам'] },
      { slug: 'machinery', description: 'Эксплуатация техники, заявки, смены, простои и производственные показатели.', highlights: ['Заявки на технику', 'Сменные рапорты', 'Простои'], outcomes: ['Прозрачная загрузка техники', 'Контроль смен и простоев'] },
      { slug: 'sales-contractors', description: 'CRM, коммерческие предложения и совместная работа с подрядчиками.', highlights: ['CRM', 'Коммерческие предложения', 'Портал подрядчиков'], outcomes: ['Единая воронка продаж', 'Управляемая работа с подрядчиками'] },
    ]);
  });

  it('фиксирует цену и экономию полного комплекта', () => {
    const separateTotal = commercialPackages.reduce((sum, item) => sum + item.price, 0);

    expect(separateTotal).toBe(88_300);
    expect(fullSuiteOffer.price).toBe(79_900);
    expect(fullSuiteOffer.savings).toBe(8_400);
    expect(fullSuiteOffer.savingsPercent).toBe(9.51);
    expect(fullSuiteOffer.billingPeriodDays).toBe(30);
  });

  it('сам добавляет рабочий вход к контуру и рекомендует комплект от 64 000 ₽', () => {
    const below = getCommercialSelection(['working-entry', 'machinery', 'quality-safety']);
    const above = getCommercialSelection(['machinery']);

    expect(below.total).toBe(52_700);
    expect(below.recommendFullSuite).toBe(false);
    expect(above.selectedSlugs).toEqual(['working-entry', 'machinery']);
    expect(above.total).toBe(45_800);
    expect(above.recommendFullSuite).toBe(false);
    expect(getCommercialSelection(['working-entry', 'supply-warehouse', 'finance-contracts', 'workforce-output']).recommendFullSuite).toBe(true);
    expect(getCommercialSelection([], true).isFullSuite).toBe(true);
    expect(getCommercialSelection([], true).total).toBe(79_900);
  });
});
