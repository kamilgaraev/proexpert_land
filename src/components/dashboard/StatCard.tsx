import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  colorClasses: {
    bg: string;
    text: string;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClasses }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-steel-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-steel-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard; 