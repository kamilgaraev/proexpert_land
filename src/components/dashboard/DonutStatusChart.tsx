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
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300">
      <h3 className="text-sm font-medium text-steel-600 mb-4">{title}</h3>
      {hasData ? (
        <div className="h-64">
          <Doughnut data={chartData} options={options} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-steel-400">
          <ChartPieIcon className="h-12 w-12 mb-2" />
          <span className="text-sm">Нет данных</span>
        </div>
      )}
    </div>
  );
};

export default DonutStatusChart;