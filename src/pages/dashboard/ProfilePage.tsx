import { useState } from 'react';
import { useAuth } from '@hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Здесь будет логика обновления профиля пользователя
    console.log('Обновление профиля:', { name, email });
    
    // Переключаем режим редактирования
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-secondary-900">Профиль пользователя</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Здесь вы можете просмотреть и обновить свои данные
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-secondary-900">Личная информация</h3>
            <p className="mt-1 max-w-2xl text-sm text-secondary-500">Основные данные вашего профиля</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline"
            >
              Редактировать
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="border-t border-secondary-200">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                    Имя
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setName(user.name);
                    setEmail(user.email);
                    setIsEditing(false);
                  }}
                  className="btn btn-outline"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="border-t border-secondary-200">
            <dl>
              <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-secondary-500">Имя</dt>
                <dd className="mt-1 text-sm text-secondary-900 sm:col-span-2 sm:mt-0">{user.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-secondary-500">Email</dt>
                <dd className="mt-1 text-sm text-secondary-900 sm:col-span-2 sm:mt-0">{user.email}</dd>
              </div>
              <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-secondary-500">ID организации</dt>
                <dd className="mt-1 text-sm text-secondary-900 sm:col-span-2 sm:mt-0">{user.current_organization_id}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-secondary-500">Дата регистрации</dt>
                <dd className="mt-1 text-sm text-secondary-900 sm:col-span-2 sm:mt-0">
                  {new Date(user.created_at).toLocaleDateString('ru-RU')} {new Date(user.created_at).toLocaleTimeString('ru-RU')}
                </dd>
              </div>
              <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-secondary-500">Статус верификации email</dt>
                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                  {user.email_verified_at ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Подтвержден
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Не подтвержден
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 