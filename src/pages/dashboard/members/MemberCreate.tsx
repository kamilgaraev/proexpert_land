import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '@utils/api';
import { useAuth } from '@hooks/useAuth';

interface FormData {
  name: string;
  email: string;
  role: string;
  password: string;
  password_confirmation: string;
}

type ErrorsType = Partial<Record<keyof FormData, string>> & { general?: string };

const MemberCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'member',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<ErrorsType>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку при изменении поля
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ErrorsType = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно для заполнения';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен для заполнения';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Используем новый метод API для создания нового участника
      const response = await userService.inviteUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        organization_id: user?.current_organization_id,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Ошибка при создании участника');
      }
      
      // После успешного создания перенаправляем на список участников
      navigate('/dashboard/members');
    } catch (error: any) {
      
      // Обработка ошибок валидации с сервера
      if (error.response?.status === 422 && error.response?.data?.data?.errors) {
        const serverErrors: Record<string, string[]> = error.response.data.data.errors;
        const formattedErrors: ErrorsType = {};
        
        // Преобразуем ошибки с сервера в формат, понятный нашей форме
        Object.entries(serverErrors).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            formattedErrors[key as keyof FormData] = messages[0];
          }
        });
        
        setErrors(formattedErrors);
      } else {
        setErrors((prev) => ({ 
          ...prev, 
          general: error.response?.data?.message || 'Произошла ошибка при создании участника' 
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Добавление нового участника</h1>
        <Link to="/dashboard/members" className="text-primary-600 hover:text-primary-800">
          Вернуться к списку
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Имя
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input w-full px-4 py-2 border rounded-md ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Введите имя участника"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input w-full px-4 py-2 border rounded-md ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Роль
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="admin">Администратор</option>
              <option value="manager">Менеджер</option>
              <option value="member">Помощник</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input w-full px-4 py-2 border rounded-md ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Минимум 8 символов"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Подтверждение пароля
            </label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={`form-input w-full px-4 py-2 border rounded-md ${
                errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Повторите пароль"
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-sm text-red-500">{errors.password_confirmation}</p>
            )}
          </div>
          
          <div className="flex justify-end">
            <Link
              to="/dashboard/members"
              className="btn btn-secondary mr-2"
            >
              Отмена
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberCreate; 