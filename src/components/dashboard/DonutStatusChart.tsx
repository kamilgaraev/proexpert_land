import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartPieIcon } from '@heroicons/react/24/outline';

// Регистрируем компоненты локально
ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutStatusChartProps {
  data: Record<string, number>;
  title: string;
}

const COLORS = [
  '#3b82f6', // blue
  '#16a34a', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#6366f1', // indigo
  '#10b981', // emerald
];

const DonutStatusChart: React.FC<DonutStatusChartProps> = ({ data, title }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const hasData = values.some((v) => v > 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: COLORS.slice(0, values.length),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {title && <h3 className="mb-4 text-sm font-medium text-steel-600">{title}</h3>}
      {hasData ? (
        <div className="relative min-h-0 flex-1">
          <Doughnut data={chartData} options={options} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-steel-400">
          <ChartPieIcon className="mb-2 h-12 w-12" />
          <span className="text-sm">Нет данных</span>
        </div>
      )}
    </div>
  );
};

export default DonutStatusChart;
