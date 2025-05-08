import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Используем solid для более четких иконок

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, toggleOpen }) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={toggleOpen}
        className="flex justify-between items-center w-full py-5 px-6 text-left text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-primary-500 focus-visible:ring-opacity-75 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium">{question}</span>
        {isOpen ? (
          <ChevronUpIcon className="h-6 w-6 text-primary-500" />
        ) : (
          <ChevronDownIcon className="h-6 w-6 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-5 pt-2 text-gray-600 leading-relaxed">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const faqData = [
  {
    id: 'q1',
    question: "Как изменить мой тарифный план?",
    answer: "Вы можете легко изменить свой тарифный план в разделе 'Подписки' вашего личного кабинета. Перейдите в этот раздел, найдите ваш текущий план и выберите опцию для изменения, либо выберите новый предпочтительный план из списка доступных и следуйте инструкциям на экране."
  },
  {
    id: 'q2',
    question: "Что делать, если я забыл пароль от своего аккаунта?",
    answer: "Если вы забыли пароль, на странице входа в систему кликните по ссылке \"Забыли пароль?\" Вам будет предложено ввести адрес электронной почты, связанный с вашим аккаунтом. После этого на указанный email придет письмо с подробными инструкциями по безопасному восстановлению доступа."
  },
  {
    id: 'q3',
    question: "Как я могу пополнить баланс моего счета?",
    answer: "Пополнение баланса доступно в разделе 'Биллинг' -> 'Баланс'. Выберите опцию 'Пополнить баланс', введите желаемую сумму и выберите удобный способ оплаты. Мы поддерживаем различные платежные системы для вашего удобства."
  },
  {
    id: 'q4',
    question: "Безопасно ли хранить данные моих проектов в системе?",
    answer: "Мы уделяем максимальное внимание безопасности ваших данных. Все данные проектов шифруются как при передаче, так и при хранении на наших серверах. Мы используем современные протоколы безопасности и регулярно проводим аудиты системы для обеспечения наивысшего уровня защиты."
  },
  {
    id: 'q5',
    question: "Могу ли я добавить других пользователей для управления проектами?",
    answer: "Да, в зависимости от вашего тарифного плана, вы можете добавлять прорабов или администраторов в вашу организацию для совместной работы над проектами. Управление пользователями доступно в разделе 'Администраторы' или соответствующем разделе управления командой."
  },
];

const FAQPage = () => {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
            Часто задаваемые вопросы
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Не нашли ответ? <a href="/dashboard/help" className="font-medium text-primary-600 hover:text-primary-500">Свяжитесь с нами</a>.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {faqData.map((item) => (
            <FAQItem
              key={item.id}
              question={item.question}
              answer={item.answer}
              isOpen={openFAQ === item.id}
              toggleOpen={() => toggleFAQ(item.id)}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
            <p className="text-gray-500">
                Мы постоянно обновляем наш FAQ, чтобы предоставить вам самую актуальную информацию.
            </p>
        </div>
      </div>
    </div>
  );
};

export default FAQPage; 