import React from 'react';
import { Link } from 'react-router-dom';

const HelpPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-secondary-800 mb-6">Справка</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Техническая поддержка</h2>
          <p className="text-gray-600 mb-4">
            Если у вас возникли проблемы с использованием системы или вы хотите оставить отзыв,
            воспользуйтесь формой обращения в техническую поддержку.
          </p>
          <Link 
            to="/dashboard/support" 
            className="inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
          >
            Обратиться в поддержку
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Часто задаваемые вопросы</h2>
          <p className="text-gray-600 mb-4">
            Ознакомьтесь с ответами на часто задаваемые вопросы перед обращением в поддержку.
          </p>
          <a 
            href="#" 
            className="inline-block px-4 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700 transition"
          >
            Открыть FAQ
          </a>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Руководство пользователя</h2>
        <p className="text-gray-600 mb-4">
          Подробное руководство по использованию всех функций системы.
        </p>
        <div className="mt-4">
          <a 
            href="#" 
            className="inline-block px-4 py-2 border border-primary-600 text-primary-600 rounded hover:bg-primary-50 transition mr-4"
          >
            Скачать PDF
          </a>
          <a 
            href="#" 
            className="inline-block px-4 py-2 border border-primary-600 text-primary-600 rounded hover:bg-primary-50 transition"
          >
            Открыть онлайн
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 