import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookOpenIcon,
  AcademicCapIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqData = [
    {
      question: "Как добавить нового сотрудника в команду?",
      answer: "Перейдите в раздел 'Команда', нажмите кнопку 'Добавить администратора' и заполните необходимые данные. Новый сотрудник получит приглашение на указанную электронную почту."
    },
    {
      question: "Как пополнить баланс аккаунта?",
      answer: "В разделе 'Финансы' выберите удобную сумму пополнения или введите свою. Доступны различные способы оплаты: банковские карты, электронные кошельки, банковские переводы."
    },
    {
      question: "Можно ли настроить уведомления о важных событиях?",
      answer: "Да, в разделе 'Настройки' вы можете настроить различные типы уведомлений: email, SMS, push-уведомления в браузере. Выберите события, о которых хотите получать информацию."
    },
    {
      question: "Как получить доступ к дополнительным услугам?",
      answer: "В разделе 'Услуги' представлен каталог доступных дополнительных возможностей. Выберите нужную услугу и активируйте её. Стоимость будет списана с вашего баланса."
    },
    {
      question: "Что делать, если забыл пароль?",
      answer: "На странице входа нажмите 'Забыли пароль?', введите свой email. Вы получите ссылку для восстановления пароля. Перейдите по ссылке и создайте новый пароль."
    },
    {
      question: "Как изменить тарифный план?",
      answer: "Свяжитесь с нашей службой поддержки для консультации по тарифным планам. Мы поможем выбрать оптимальный план для ваших потребностей и оформить переход."
    }
  ];

  const supportChannels = [
    {
      title: "Телефон поддержки",
      description: "Звоните в рабочие часы",
      contact: "+7 (800) 123-45-67",
      icon: PhoneIcon,
      color: "construction",
      hours: "Пн-Пт: 9:00-18:00"
    },
    {
      title: "Email поддержка",
      description: "Отвечаем в течение 2 часов",
      contact: "support@prohelper.pro",
      icon: EnvelopeIcon,
      color: "safety",
      hours: "Круглосуточно"
    },
    {
      title: "Онлайн чат",
      description: "Мгновенная помощь",
      contact: "Открыть чат",
      icon: ChatBubbleLeftRightIcon,
      color: "earth",
      hours: "Пн-Пт: 9:00-22:00"
    }
  ];

  const resources = [
    {
      title: "Видеоуроки",
      description: "Обучающие ролики по всем функциям",
      icon: VideoCameraIcon,
      color: "construction",
      items: ["Начало работы", "Управление командой", "Финансы", "Настройки"]
    },
    {
      title: "База знаний",
      description: "Подробные статьи и инструкции",
      icon: BookOpenIcon,
      color: "safety",
      items: ["Руководства", "Лучшие практики", "Советы", "Обновления"]
    },
    {
      title: "Вебинары",
      description: "Живые обучающие сессии",
      icon: AcademicCapIcon,
      color: "earth",
      items: ["Еженедельные вебинары", "Специальные темы", "Q&A сессии", "Записи"]
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-concrete-50 to-steel-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-safety-500 to-safety-600 rounded-2xl flex items-center justify-center shadow-safety">
              <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-steel-900 mb-4">Центр помощи</h1>
          <p className="text-xl text-steel-600 max-w-2xl mx-auto">
            Найдите ответы на вопросы, изучите руководства или свяжитесь с нашей командой поддержки
          </p>
        </motion.div>

        {/* Быстрые действия */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Link
            to="/dashboard/support"
            className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-steel-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-construction-500 to-construction-600 rounded-xl flex items-center justify-center shadow-construction">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-steel-900">Техподдержка</h3>
                <p className="text-steel-600 text-sm">Быстрая помощь</p>
              </div>
            </div>
            <p className="text-steel-600 group-hover:text-steel-700 transition-colors">
              Создайте заявку в службу поддержки для решения технических вопросов
            </p>
          </Link>

          <Link
            to="/dashboard/faq"
            className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-steel-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-safety-500 to-safety-600 rounded-xl flex items-center justify-center shadow-safety">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-steel-900">FAQ</h3>
                <p className="text-steel-600 text-sm">Готовые ответы</p>
              </div>
            </div>
            <p className="text-steel-600 group-hover:text-steel-700 transition-colors">
              Часто задаваемые вопросы с подробными ответами
            </p>
          </Link>

          <a
            href="mailto:support@prohelper.pro"
            className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-steel-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-earth-500 to-earth-600 rounded-xl flex items-center justify-center shadow-earth">
                <EnvelopeIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-steel-900">Email</h3>
                <p className="text-steel-600 text-sm">Прямая связь</p>
              </div>
            </div>
            <p className="text-steel-600 group-hover:text-steel-700 transition-colors">
              Напишите нам на почту для детального обсуждения вопроса
            </p>
          </a>
        </motion.div>

        {/* Каналы поддержки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-steel-900 mb-8 text-center">Способы связи</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportChannels.map((channel, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg border border-steel-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r from-${channel.color}-500 to-${channel.color}-600 rounded-xl flex items-center justify-center shadow-${channel.color}`}>
                    <channel.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-steel-900">{channel.title}</h3>
                    <p className="text-steel-600 text-sm">{channel.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-steel-900 font-medium">{channel.contact}</p>
                  <div className="flex items-center text-steel-600 text-sm">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {channel.hours}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Обучающие ресурсы */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-steel-900 mb-8 text-center">Обучающие материалы</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg border border-steel-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r from-${resource.color}-500 to-${resource.color}-600 rounded-xl flex items-center justify-center shadow-${resource.color}`}>
                    <resource.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-steel-900">{resource.title}</h3>
                    <p className="text-steel-600 text-sm">{resource.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {resource.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-steel-700">
                      <div className="w-2 h-2 bg-steel-400 rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Популярные вопросы */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-steel-200 p-8"
        >
          <h2 className="text-2xl font-bold text-steel-900 mb-8 text-center">Популярные вопросы</h2>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-steel-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-steel-50 transition-colors"
                >
                  <span className="font-medium text-steel-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUpIcon className="w-5 h-5 text-steel-500" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-steel-500" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="px-6 pb-4 text-steel-700 bg-steel-25"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpPage;