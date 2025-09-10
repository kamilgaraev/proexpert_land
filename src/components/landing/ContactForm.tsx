import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import NotificationService from '@components/shared/NotificationService';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  subject: string;
}

interface ContactFormProps {
  variant?: 'full' | 'compact';
  className?: string;
}

const ContactForm = ({ variant = 'full', className = '' }: ContactFormProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    subject: 'consultation'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const subjects = [
    { value: 'consultation', label: 'Консультация по продукту' },
    { value: 'demo', label: 'Заказать демонстрацию' },
    { value: 'pricing', label: 'Вопросы по тарифам' },
    { value: 'integration', label: 'Интеграция с 1С/ERP' },
    { value: 'support', label: 'Техническая поддержка' },
    { value: 'partnership', label: 'Партнерство' },
    { value: 'other', label: 'Другое' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Простая валидация
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка',
        message: 'Пожалуйста, заполните все обязательные поля'
      });
      setIsSubmitting(false);
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка',
        message: 'Пожалуйста, введите корректный email'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Заменить на реальный API вызов
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Отправлены данные формы:', formData);
      
      setIsSubmitted(true);
      NotificationService.show({
        type: 'success',
        title: 'Спасибо за обращение!',
        message: 'Мы свяжемся с вами в течение рабочего дня'
      });

      // Сброс формы
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        subject: 'consultation'
      });

      // Убираем состояние "отправлено" через 3 секунды
      setTimeout(() => setIsSubmitted(false), 3000);
      
    } catch (error) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка отправки',
        message: 'Попробуйте еще раз или свяжитесь с нами по телефону'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={`bg-white/90 border-2 border-construction-200 rounded-xl p-6 backdrop-blur-sm shadow-construction ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-construction-500 to-construction-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-steel-900 mb-2">Остались вопросы?</h3>
          <p className="text-steel-600">Оставьте заявку и мы свяжемся с вами</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ваше имя *"
              className="w-full px-4 py-3 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email *"
              className="w-full px-4 py-3 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
              required
            />
          </div>

          <div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Ваш вопрос *"
              rows={3}
              className="w-full px-4 py-3 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors resize-vertical"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isSubmitted}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isSubmitted
                ? 'bg-green-500 text-white cursor-default'
                : isSubmitting
                ? 'bg-steel-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-construction-600 to-construction-500 text-white hover:shadow-construction transform hover:scale-105'
            }`}
          >
            {isSubmitted ? (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Отправлено!
              </>
            ) : isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Отправляем...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-5 h-5" />
                Отправить
              </>
            )}
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-white/90 border-2 border-construction-200 rounded-2xl p-8 backdrop-blur-sm shadow-construction ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center mx-auto mb-6">
          <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-steel-900 mb-4">Свяжитесь с нами</h2>
        <p className="text-steel-600 text-lg">
          Получите персональную консультацию и ответы на все вопросы о ProHelper
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-steel-700 font-medium mb-2">
              <UserIcon className="w-4 h-4 inline mr-2" />
              Имя *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Введите ваше имя"
              className="w-full px-4 py-3 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-steel-700 font-medium mb-2">
              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-steel-700 font-medium mb-2">
              <PhoneIcon className="w-4 h-4 inline mr-2" />
              Телефон
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+7 (___) ___-__-__"
              className="w-full px-4 py-3 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-steel-700 font-medium mb-2">
              Компания
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Название компании"
              className="w-full px-4 py-3 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-steel-700 font-medium mb-2">
            Тема обращения
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
          >
            {subjects.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-steel-700 font-medium mb-2">
            Сообщение *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Расскажите подробнее о ваших потребностях и вопросах..."
            rows={5}
            className="w-full px-4 py-3 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors resize-vertical"
            required
          />
        </div>

        <div className="bg-steel-50 rounded-lg p-4 border border-steel-200">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-steel-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-steel-600">
              <p>Отправляя форму, вы соглашаетесь на обработку персональных данных в соответствии с нашей политикой конфиденциальности.</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isSubmitted}
          className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
            isSubmitted
              ? 'bg-green-500 text-white cursor-default'
              : isSubmitting
              ? 'bg-steel-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-construction-600 to-construction-500 text-white hover:shadow-construction transform hover:scale-105'
          }`}
        >
          {isSubmitted ? (
            <>
              <CheckCircleIcon className="w-6 h-6" />
              Заявка отправлена!
            </>
          ) : isSubmitting ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Отправляем заявку...
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="w-6 h-6" />
              Отправить заявку
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ContactForm;
