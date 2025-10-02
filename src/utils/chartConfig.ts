/**
 * Конфигурация Chart.js для предотвращения конфликтов с jQuery
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Предотвращаем конфликты с глобальными переменными ПЕРЕД импортом Chart.js
if (typeof window !== 'undefined') {
  // Сохраняем оригинальные значения
  const originalDollar = (window as any).$;
  const originalJQuery = (window as any).jQuery;
  
  // Создаем безопасную реализацию $.map для Chart.js
  const safeDollar = {
    map: function(array: any[], callback: (value: any, index: number, array: any[]) => any) {
      if (!Array.isArray(array)) return [];
      return array.map(callback);
    },
    each: function(array: any[], callback: (value: any, index: number, array: any[]) => void) {
      if (Array.isArray(array)) {
        array.forEach(callback);
      }
    },
    extend: function(...objects: any[]) {
      const target = objects[0] || {};
      for (let i = 1; i < objects.length; i++) {
        const source = objects[i];
        if (source) {
          Object.assign(target, source);
        }
      }
      return target;
    }
  };
  
  // Временно заменяем $ и jQuery на безопасную реализацию
  (window as any).$ = safeDollar;
  (window as any).jQuery = safeDollar;
  
  // Регистрируем все необходимые компоненты Chart.js
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler
  );
  
  // Восстанавливаем оригинальные значения после инициализации
  setTimeout(() => {
    if (originalDollar !== undefined) {
      (window as any).$ = originalDollar;
    }
    if (originalJQuery !== undefined) {
      (window as any).jQuery = originalJQuery;
    }
  }, 0);
} else {
  // На сервере просто регистрируем компоненты
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler
  );
}

// Глобальная конфигурация Chart.js
ChartJS.defaults.font.family = 'Inter, system-ui, -apple-system, sans-serif';
ChartJS.defaults.color = '#64748b'; // steel-500
ChartJS.defaults.borderColor = '#e2e8f0'; // steel-200

export default ChartJS;
