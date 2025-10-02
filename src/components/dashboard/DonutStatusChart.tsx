import { Doughnut } from 'react-chartjs-2';
import ChartJS from '@utils/chartConfig';
import { ChartPieIcon } from '@heroicons/react/24/outline';

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
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300">
      <h3 className="text-sm font-medium text-steel-600 mb-4">{title}</h3>
      {hasData ? (
        <Doughnut data={chartData} options={options} />
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-steel-400">
          <ChartPieIcon className="h-12 w-12 mb-2" />
          <span className="text-sm">Нет данных</span>
        </div>
      )}
    </div>
  );
};

export default DonutStatusChart; 