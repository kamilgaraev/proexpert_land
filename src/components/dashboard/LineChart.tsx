import { Line } from 'react-chartjs-2';
import ChartJS from '@utils/chartConfig';

interface LineChartProps {
  labels: string[];
  values: number[];
  title: string;
}

const LineChart: React.FC<LineChartProps> = ({ labels, values, title }) => {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any, index: any, values: any) {
            if (typeof value === 'number') {
              return value.toLocaleString('ru-RU');
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300">
      <h3 className="text-sm font-medium text-steel-600 mb-4">{title}</h3>
      <div className="h-64">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default LineChart; 