import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supportService } from '@/utils/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { CheckCircleIcon, ExclamationTriangleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export function ContactForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
      type: 'Общий вопрос',
    } as any);
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, type: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await supportService.submitSupportRequest({
        ...formData,
        name: user?.name ?? formData.name,
        email: user?.email ?? formData.email,
      });
      if (response.status < 200 || response.status >= 300 || response.data?.success === false) {
        setError(response.status === 422
          ? 'Проверьте заполненные поля. Тема должна быть не длиннее 255 символов, сообщение — 5000 символов.'
          : response.status === 429
            ? 'Слишком много обращений. Подождите немного и попробуйте снова.'
            : 'Не удалось отправить обращение. Текст сохранён в форме — попробуйте ещё раз.');
        return;
      }
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'Общий вопрос',
      });
    } catch {
      setError('Не удалось отправить обращение. Проверьте соединение и попробуйте ещё раз. Текст сохранён в форме.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl rounded-lg border-border shadow-none">
      <CardHeader>
        <h2 className="text-2xl font-semibold">Написать в поддержку</h2>
        <CardDescription>
          {user ? 'Опишите вопрос. Ответ придёт на почту вашего аккаунта.' : 'Опишите вопрос и укажите почту для ответа.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <div role="status" className="bg-secondary/50 border border-border p-4 mb-6 flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Сообщение отправлено</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ваше обращение принято. Ответ придёт на указанную почту.
              </p>
              <Button variant="link" className="p-0 h-auto mt-2" onClick={() => setSuccess(false)}>
                 Написать ещё одно сообщение
              </Button>
            </div>
          </div>
        )}
        
        {error && (
          <div role="alert" className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Ошибка отправки</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}
        
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Ваше имя</Label>
                <Input
                  id="name"
                  name="name"
                  value={user?.name ?? formData.name}
                  readOnly={Boolean(user)}
                  onChange={handleChange}
                  placeholder="Иван Иванов"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email для связи</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={user?.email ?? formData.email}
                  readOnly={Boolean(user)}
                  onChange={handleChange}
                  placeholder="ivan@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Тип обращения</Label>
              <Select value={formData.type} onValueChange={handleSelectChange}>
                <SelectTrigger id="type" className="min-h-11 text-base">
                  <SelectValue placeholder="Выберите тип вопроса" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Общий вопрос">Общий вопрос</SelectItem>
                  <SelectItem value="Сообщение об ошибке">Сообщение об ошибке</SelectItem>
                  <SelectItem value="Запрос функциональности">Запрос функциональности</SelectItem>
                  <SelectItem value="Вопрос по оплате">Вопрос по оплате</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Тема</Label>
              <Input
                id="subject"
                maxLength={255}
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Кратко опишите суть вопроса"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Сообщение</Label>
              <Textarea
                id="message"
                maxLength={5000}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Подробно опишите проблему или вопрос..."
                rows={6}
                required
                className="resize-y min-h-[120px]"
              />
            </div>
            
            <Button type="submit" className="w-full md:w-auto font-bold" disabled={isLoading}>
              {isLoading ? (
                'Отправка...'
              ) : (
                <>
                  <PaperAirplaneIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Отправить сообщение
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

