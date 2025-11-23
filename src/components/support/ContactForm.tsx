import { useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircleIcon, ExclamationTriangleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export function ContactForm() {
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await supportService.submitSupportRequest(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'Общий вопрос',
      });
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при отправке запроса');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-sm max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Написать в поддержку</CardTitle>
        <CardDescription>
          Заполните форму ниже, и мы ответим вам в течение 24 часов
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-800">Сообщение отправлено</p>
              <p className="text-sm text-emerald-600 mt-1">
                Мы получили ваш запрос и уже работаем над ним. Ответ придет на указанную почту.
              </p>
              <Button variant="link" className="text-emerald-700 p-0 h-auto mt-2" onClick={() => setSuccess(false)}>
                 Отправить еще одно сообщение
              </Button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-start gap-3">
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
                  value={formData.name}
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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ivan@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Тип обращения</Label>
              <Select value={formData.type} onValueChange={handleSelectChange}>
                <SelectTrigger>
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
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
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

