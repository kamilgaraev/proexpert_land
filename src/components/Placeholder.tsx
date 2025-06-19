import React from 'react';

interface PlaceholderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, description, icon }) => {
  return (
    <div className="p-6 text-center bg-white rounded-lg shadow-sm border border-gray-100 h-full">
      <div className="p-5 flex flex-col items-center justify-center min-h-[300px]">
        {icon && <div className="mb-4 text-primary-500">{icon}</div>}
        <h2 className="text-2xl font-bold text-secondary-800 mb-2">{title}</h2>
        {description && (
          <p className="text-secondary-500 max-w-md mx-auto">
            {description}
          </p>
        )}
        <div className="mt-6 p-4 bg-secondary-50 rounded-md w-full max-w-md">
          <p className="text-sm text-secondary-400">
            Эта страница находится в разработке. Скоро здесь появится полный функционал.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Placeholder; 