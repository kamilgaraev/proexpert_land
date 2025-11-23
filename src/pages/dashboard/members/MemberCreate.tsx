import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '@utils/api';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
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
      
      navigate('/dashboard/members');
    } catch (error: any) {
      if (error.response?.status === 422 && error.response?.data?.data?.errors) {
        const serverErrors: Record<string, string[]> = error.response.data.data.errors;
        const formattedErrors: ErrorsType = {};
        
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
            <Link to="/dashboard/members">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к списку
            </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Добавление нового участника</CardTitle>
            <CardDescription>Заполните форму для создания нового пользователя организации</CardDescription>
        </CardHeader>
        <CardContent>
            {errors.general && (
                <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 items-start text-destructive">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium">Ошибка</p>
                        <p className="opacity-90">{errors.general}</p>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Имя</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Введите имя участника"
                        className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="role">Роль</Label>
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите роль" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Администратор</SelectItem>
                            <SelectItem value="manager">Менеджер</SelectItem>
                            <SelectItem value="member">Помощник</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Минимум 8 символов"
                            className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Подтверждение пароля</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            placeholder="Повторите пароль"
                            className={errors.password_confirmation ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {errors.password_confirmation && <p className="text-xs text-destructive">{errors.password_confirmation}</p>}
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" type="button" asChild>
                        <Link to="/dashboard/members">Отмена</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Сохранение...
                            </>
                        ) : 'Сохранить'}
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberCreate;
