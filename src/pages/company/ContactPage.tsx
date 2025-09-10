import PageLayout from '../../components/shared/PageLayout';
import ContactForm from '../../components/landing/ContactForm';
import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const ContactPage = () => {
  const contacts = [
    {
      icon: PhoneIcon,
      title: 'Телефон',
      value: '+7 (999) 123-45-67',
      href: 'tel:+79991234567',
      description: 'Звоните в рабочее время',
      color: 'construction'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      value: 'info@prohelper.ru',
      href: 'mailto:info@prohelper.ru',
      description: 'Ответим в течение часа',
      color: 'safety'
    },
    {
      icon: MapPinIcon,
      title: 'Адрес',
      value: 'Москва, ул. Строителей, 25',
      href: 'https://maps.google.com/?q=Москва+ул.+Строителей+25',
      description: 'Приглашаем в офис',
      color: 'steel'
    },
    {
      icon: ClockIcon,
      title: 'Режим работы',
      value: 'Пн-Пт: 9:00 - 18:00',
      href: '',
      description: 'МСК, выходные - чат поддержки',
      color: 'earth'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'construction':
        return {
          bg: 'bg-construction-500',
          hover: 'hover:bg-construction-600',
          text: 'text-construction-600',
          border: 'border-construction-200'
        };
      case 'safety':
        return {
          bg: 'bg-safety-500',
          hover: 'hover:bg-safety-600',
          text: 'text-safety-600',
          border: 'border-safety-200'
        };
      case 'steel':
        return {
          bg: 'bg-steel-500',
          hover: 'hover:bg-steel-600',
          text: 'text-steel-600',
          border: 'border-steel-200'
        };
      case 'earth':
        return {
          bg: 'bg-earth-500',
          hover: 'hover:bg-earth-600',
          text: 'text-earth-600',
          border: 'border-earth-200'
        };
      default:
        return {
          bg: 'bg-steel-500',
          hover: 'hover:bg-steel-600',
          text: 'text-steel-600',
          border: 'border-steel-200'
        };
    }
  };

  return (
    <PageLayout 
      title="Контакты ProHelper" 
      subtitle="Свяжитесь с нами удобным способом - мы готовы помочь"
    >
      <div className="mb-16">
        {/* Hero секция */}
        <div className="bg-gradient-to-br from-concrete-50 via-concrete-100 to-steel-100 rounded-2xl p-8 lg:p-12 mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-construction-grid opacity-20"></div>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-steel-900 mb-4">
              Мы всегда на связи
            </h1>
            <p className="text-lg text-steel-600 max-w-2xl mx-auto">
              Наша команда готова ответить на любые вопросы о ProHelper и помочь найти оптимальное решение для вашего бизнеса
            </p>
          </div>
        </div>

        {/* Контактная информация */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contacts.map((contact, index) => {
            const IconComponent = contact.icon;
            const colors = getColorClasses(contact.color);
            
            return (
              <div key={index} className={`bg-white rounded-xl p-6 shadow-lg border ${colors.border} group hover:shadow-xl transition-all duration-300`}>
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4 ${colors.hover} transition-colors`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-steel-900 mb-2">{contact.title}</h3>
                {contact.href ? (
                  <a 
                    href={contact.href}
                    target={contact.href.startsWith('http') ? '_blank' : undefined}
                    rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`${colors.text} font-medium hover:underline block mb-2`}
                  >
                    {contact.value}
                  </a>
                ) : (
                  <p className={`${colors.text} font-medium mb-2`}>{contact.value}</p>
                )}
                <p className="text-steel-600 text-sm">{contact.description}</p>
              </div>
            );
          })}
        </div>

        {/* Форма обратной связи */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <ContactForm />
          </div>
          
          <div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-steel-200 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-safety-500 to-safety-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-steel-900">Офис в Москве</h3>
              </div>
              
              <div className="space-y-4 text-steel-600">
                <p>
                  <strong className="text-steel-900">Адрес:</strong><br />
                  Москва, ул. Строителей, 25<br />
                  БЦ "Строительный", этаж 7
                </p>
                <p>
                  <strong className="text-steel-900">Как добраться:</strong><br />
                  м. Сокольники, 5 минут пешком<br />
                  Парковка для гостей бесплатно
                </p>
                <p>
                  <strong className="text-steel-900">Прием посетителей:</strong><br />
                  Понедельник - Пятница: 10:00 - 17:00<br />
                  Предварительная запись обязательна
                </p>
              </div>
              
              <div className="mt-6">
                <a 
                  href="https://maps.google.com/?q=Москва+ул.+Строителей+25"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-steel-600 to-steel-500 text-white font-semibold rounded-lg hover:shadow-steel transition-all duration-300 transform hover:scale-105"
                >
                  <MapPinIcon className="w-5 h-5" />
                  Открыть на карте
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-construction-500 to-safety-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Нужна консультация?</h3>
              <p className="mb-6 opacity-90">
                Не знаете, какой тариф выбрать? Хотите увидеть ProHelper в действии? 
                Закажите бесплатную консультацию с нашим экспертом.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Демонстрация всех возможностей</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Расчет стоимости для вашей компании</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Ответы на технические вопросы</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>План внедрения под ваши задачи</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ContactPage;
