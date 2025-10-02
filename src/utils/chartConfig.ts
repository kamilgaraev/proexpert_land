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

// Глобальная конфигурация Chart.js
ChartJS.defaults.font.family = 'Inter, system-ui, -apple-system, sans-serif';
ChartJS.defaults.color = '#64748b'; // steel-500
ChartJS.defaults.borderColor = '#e2e8f0'; // steel-200

// Предотвращаем конфликты с глобальными переменными
if (typeof window !== 'undefined') {
  // Если есть глобальная переменная $, сохраняем её
  const originalDollar = (window as any).$;
  
  // Устанавливаем защиту от конфликтов
  (window as any).jQuery = undefined;
  (window as any).$ = undefined;
  
  // Если была оригинальная функция $, восстанавливаем её после инициализации Chart.js
  if (originalDollar && typeof originalDollar === 'function') {
    setTimeout(() => {
      (window as any).$ = originalDollar;
    }, 0);
  }
}

export default ChartJS;
