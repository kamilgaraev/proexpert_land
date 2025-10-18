import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, icon, actions }: PageHeaderProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="bg-gradient-to-r from-orange-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <div className="text-white">{icon}</div>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

