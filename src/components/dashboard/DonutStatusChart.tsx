import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutStatusChartProps {
  data: Record<string, number>;
  title: string;
}

const COLORS = ['#ae4612', '#426354', '#967027', '#9d4343', '#626378', '#4b7376'];

const DonutStatusChart: React.FC<DonutStatusChartProps> = ({ data, title }) => {
  const entries = Object.entries(data).filter(([, value]) => Number.isFinite(value) && value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const chartData = {
    labels: entries.map(([label]) => label),
    datasets: [{
      data: entries.map(([, value]) => value),
      backgroundColor: entries.map((_, index) => COLORS[index % COLORS.length]),
      borderWidth: 2,
      borderColor: '#ffffff',
    }],
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col items-center gap-3">
      {title && <h3 className="self-start text-sm font-medium text-foreground">{title}</h3>}
      {total > 0 ? (
        <>
          <div className="relative h-40 w-40 max-w-full shrink-0">
            <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, animation: false, cutout: '65%', plugins: { legend: { display: false } } }} aria-hidden="true" />
          </div>
          <ul aria-label={title || 'Распределение по статусам'} className="grid min-h-0 w-full gap-2 overflow-y-auto text-sm">
            {entries.map(([label, value], index) => (
              <li key={label} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="min-w-0 flex-1 break-words">{label}</span>
                <span className="shrink-0 tabular-nums">{value.toLocaleString('ru-RU')} · {Math.round(value / total * 100)}%</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="my-auto text-center text-sm text-muted-foreground">Нет данных для распределения</p>
      )}
    </div>
  );
};

export default DonutStatusChart;
