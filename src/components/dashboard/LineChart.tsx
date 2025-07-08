import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

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
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (v: any) => v.toLocaleString('ru-RU'),
        },
      },
    },
  } as const;

  return <Line options={options} data={data} />;
};

export default LineChart; 