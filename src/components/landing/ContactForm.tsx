import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  PlayCircleIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  LifebuoyIcon,
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import NotificationService from '@components/shared/NotificationService';
import CustomSelect from '@components/shared/CustomSelect';
import SuccessModal from '@components/shared/SuccessModal';
import useAnalytics from '@hooks/useAnalytics';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { trackContactForm, trackButtonClick } = useAnalytics();

  const subjects = [
    { value: 'consultation', label: 'Консультация по продукту', icon: QuestionMarkCircleIcon },
    { value: 'demo', label: 'Заказать демонстрацию', icon: PlayCircleIcon },
    { value: 'pricing', label: 'Вопросы по тарифам', icon: CurrencyDollarIcon },
    { value: 'integration', label: 'Интеграция с 1С/ERP', icon: WrenchScrewdriverIcon },
    { value: 'support', label: 'Техническая поддержка', icon: LifebuoyIcon },
    { value: 'partnership', label: 'Партнерство', icon: UsersIcon },
    { value: 'other', label: 'Другое', icon: DocumentTextIcon }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔥 handleSubmit called! Event:', e);
    console.log('🔥 Form variant:', variant);
    
    e.preventDefault();
    
    // Не обрабатываем форму на сервере
    if (typeof window === 'undefined') {
      console.log('🔥 Window undefined, returning');
      return;
    }
    
    console.log('🚀 Form submit started, variant:', variant);
    console.log('📝 Form data:', formData);
    
    setIsSubmitting(true);

    // Валидация на клиенте
    const errors: string[] = [];

    // Обязательные поля
    if (!formData.name.trim() || formData.name.length < 2 || formData.name.length > 255) {
      errors.push('Имя должно содержать от 2 до 255 символов');
    }

    if (!formData.email.trim() || formData.email.length > 255) {
      errors.push('Email обязателен и не должен превышать 255 символов');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Введите корректный email адрес');
    }

    if (!formData.message.trim() || formData.message.length < 10 || formData.message.length > 5000) {
      errors.push('Сообщение должно содержать от 10 до 5000 символов');
    }

    // Проверка subject для полной формы
    if (variant === 'full') {
      const selectedSubject = subjects.find(s => s.value === formData.subject);
      const subjectLabel = selectedSubject ? selectedSubject.label : formData.subject;
      if (!subjectLabel || subjectLabel.length < 5 || subjectLabel.length > 255) {
        errors.push('Выберите тему обращения');
      }
    }

    // Необязательные поля
    if (formData.phone && (formData.phone.length > 20 || !/^[\d\s\-\+\(\)]+$/.test(formData.phone))) {
      errors.push('Телефон должен содержать только цифры, скобки, пробелы, дефисы и плюс (до 20 символов)');
    }

    if (formData.company && formData.company.length > 255) {
      errors.push('Название компании не должно превышать 255 символов');
    }

    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors);
      NotificationService.show({
        type: 'error',
        title: 'Ошибка валидации',
        message: errors.join('; ')
      });
      setIsSubmitting(false);
      return;
    }

    console.log('✅ Validation passed');

    try {
      // Трекинг аналитики (только на клиенте)
      if (typeof window !== 'undefined') {
        trackButtonClick('contact_form_submit', `contact_form_${variant}`);
        trackContactForm(variant, {
          subject: formData.subject,
          has_company: !!formData.company,
          has_phone: !!formData.phone,
          timestamp: new Date().toISOString()
        });
      }

      // Найти название темы для отправки
      const selectedSubject = subjects.find(s => s.value === formData.subject);
      const subjectLabel = selectedSubject ? selectedSubject.label : (variant === 'compact' ? 'Общий вопрос' : formData.subject);

      // Подготовка данных для API
      const apiData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        subject: subjectLabel,
        message: formData.message.trim()
      };

      // Удаляем undefined поля
      Object.keys(apiData).forEach(key => {
        if (apiData[key as keyof typeof apiData] === undefined) {
          delete apiData[key as keyof typeof apiData];
        }
      });

      // Отправка на API
      console.log('📤 Sending API request with data:', apiData);
      const response = await fetch('https://api.prohelper.pro/api/public/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      console.log('📥 API response status:', response.status);
      const result = await response.json();
      console.log('📋 API response data:', result);

       if (result.success) {
         setIsSubmitted(true);
         setSuccessMessage(result.message || 'Мы свяжемся с вами в ближайшее время');
         setShowSuccessModal(true);

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
      } else {
        // Обработка ошибок валидации
        if (response.status === 422 && result.errors) {
          const errorMessages = Object.values(result.errors)
            .flat()
            .join('; ');
          
          NotificationService.show({
            type: 'error',
            title: 'Ошибка валидации',
            message: errorMessages
          });
        } else {
          NotificationService.show({
            type: 'error',
            title: 'Ошибка отправки',
            message: result.message || 'Произошла ошибка при отправке заявки'
          });
        }
      }
      
    } catch (error) {
      if (typeof window !== 'undefined') {
        console.error('❌ Form submission error:', error);
      }
      NotificationService.show({
        type: 'error',
        title: 'Ошибка соединения',
        message: 'Не удалось отправить заявку. Проверьте интернет-соединение или попробуйте позже'
      });
    } finally {
      console.log('🔄 Resetting isSubmitting');
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
          {/* Скрытое поле для темы в компактной форме */}
          <input type="hidden" name="subject" value="consultation" />
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
               placeholder="Ваш вопрос (минимум 10 символов) *"
               rows={3}
               className="w-full px-4 py-3 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors resize-vertical text-steel-900 placeholder-steel-500"
               required
             />
             <div className="mt-1 text-xs text-steel-500">
               Минимум 10 символов {formData.message.length > 0 && `(введено: ${formData.message.length})`}
             </div>
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
         
         <SuccessModal
           isOpen={showSuccessModal}
           onClose={() => setShowSuccessModal(false)}
           title="Спасибо за обращение!"
           message={successMessage}
         />
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

       <form 
         onSubmit={(e) => {
           console.log('🔥 BIG FORM onSubmit event fired!', e);
           handleSubmit(e);
         }} 
         className="space-y-6"
       >
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
             <div className="mt-1 text-xs text-steel-500">
               Минимум 2 символа {formData.name.length > 0 && `(введено: ${formData.name.length})`}
             </div>
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
              placeholder="+7 (900) 123-45-67"
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
          <CustomSelect
            name="subject"
            value={formData.subject}
            onChange={handleSelectChange}
            options={subjects}
            placeholder="Выберите тему обращения"
          />
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
             className="w-full px-4 py-3 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors resize-vertical text-steel-900 placeholder-steel-500"
             required
           />
           <div className="mt-1 text-xs text-steel-500">
             Минимум 10 символов, максимум 5000 {formData.message.length > 0 && `(введено: ${formData.message.length})`}
           </div>
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
           onClick={(e) => {
             console.log('🔥 BIG FORM button clicked!', e);
             console.log('🔥 Button type:', e.currentTarget.type);
             console.log('🔥 isSubmitting:', isSubmitting);
             console.log('🔥 isSubmitted:', isSubmitted);
           }}
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
       
       <SuccessModal
         isOpen={showSuccessModal}
         onClose={() => setShowSuccessModal(false)}
         title="Спасибо за обращение!"
         message={successMessage}
       />
     </motion.div>
   );
 };
 
 export default ContactForm;
