import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BuildingOffice2Icon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import NotificationService from '@/components/shared/NotificationService';
import SuccessModal from '@/components/shared/SuccessModal';
import { marketingPaths } from '@/data/marketingRegistry';
import useAnalytics from '@/hooks/useAnalytics';
import { COOKIE_CONSENT_VERSION } from '@/utils/marketingConsent';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  companyRole: string;
  companySize: string;
  subject: string;
  message: string;
  consentToPersonalData: boolean;
}

interface ContactFormProps {
  variant?: 'full' | 'compact';
  className?: string;
}

const subjectOptions = [
  { value: 'demo', label: 'Запрос демонстрации' },
  { value: 'pricing', label: 'Вопрос по пакетам и модулям' },
  { value: 'rollout', label: 'Внедрение и rollout' },
  { value: 'security', label: 'Безопасность и compliance' },
  { value: 'support', label: 'Поддержка и сопровождение' },
  { value: 'other', label: 'Другое обращение' },
];

const companyRoleOptions = [
  { value: 'contractor', label: 'Подрядчик' },
  { value: 'general_contractor', label: 'Генподрядчик' },
  { value: 'developer', label: 'Девелопер / холдинг' },
  { value: 'engineering', label: 'Инженерный блок / ПТО' },
];

const companySizeOptions = [
  { value: '1_3', label: '1-3 активных объекта' },
  { value: '4_10', label: '4-10 активных объектов' },
  { value: '10_plus', label: '10+ активных объектов' },
  { value: 'holding', label: 'Группа компаний / multi-org' },
];

const getPublicApiBase = () => {
  const rawBase = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://api.prohelper.pro';

  return rawBase.replace(/\/api\/v1\/landing\/?$/, '');
};

const getUtmPayload = () => {
  if (typeof window === 'undefined') {
    return {
      utm_source: undefined,
      utm_medium: undefined,
      utm_campaign: undefined,
      utm_term: undefined,
      utm_content: undefined,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    utm_source: searchParams.get('utm_source') ?? undefined,
    utm_medium: searchParams.get('utm_medium') ?? undefined,
    utm_campaign: searchParams.get('utm_campaign') ?? undefined,
    utm_term: searchParams.get('utm_term') ?? undefined,
    utm_content: searchParams.get('utm_content') ?? undefined,
  };
};

const normalizeOptional = (value: string) => {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

const ContactForm = ({ variant = 'full', className = '' }: ContactFormProps) => {
  const location = useLocation();
  const { trackButtonClick, trackContactForm } = useAnalytics();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    companyRole: '',
    companySize: '',
    subject: variant === 'compact' ? 'demo' : '',
    message: '',
    consentToPersonalData: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]:
        type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : value,
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d+\-\s()]+$/;

    if (formData.name.trim().length < 2) {
      errors.push('Укажите имя не короче 2 символов.');
    }

    if (!emailRegex.test(formData.email.trim())) {
      errors.push('Введите корректный email.');
    }

    if (formData.phone.trim() && !phoneRegex.test(formData.phone.trim())) {
      errors.push('Телефон может содержать только цифры, пробелы, скобки, дефис и плюс.');
    }

    if (formData.message.trim().length < 10) {
      errors.push('Опишите запрос минимум в 10 символах.');
    }

    if (variant === 'full' && !formData.subject) {
      errors.push('Выберите тему обращения.');
    }

    if (!formData.consentToPersonalData) {
      errors.push('Подтвердите согласие на обработку персональных данных.');
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      NotificationService.show({
        type: 'error',
        title: 'Форма заполнена не полностью',
        message: errors.join(' '),
      });
      return;
    }

    setIsSubmitting(true);

    const selectedSubject =
      subjectOptions.find((option) => option.value === formData.subject) ??
      subjectOptions[0];
    const selectedCompanyRole = companyRoleOptions.find(
      (option) => option.value === formData.companyRole,
    );
    const selectedCompanySize = companySizeOptions.find(
      (option) => option.value === formData.companySize,
    );

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: normalizeOptional(formData.phone),
      company: normalizeOptional(formData.company),
      company_role:
        variant === 'full' ? selectedCompanyRole?.label : undefined,
      company_size:
        variant === 'full' ? selectedCompanySize?.label : undefined,
      subject: selectedSubject.label,
      message: formData.message.trim(),
      consent_to_personal_data: formData.consentToPersonalData,
      consent_version: COOKIE_CONSENT_VERSION,
      page_source: `${location.pathname}${location.hash}`,
      ...getUtmPayload(),
    };

    const preparedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
    );

    try {
      trackButtonClick('public_contact_submit', `contact_form_${variant}`);
      trackContactForm(variant, {
        subject: selectedSubject.value,
        page_source: preparedPayload.page_source,
        has_company: Boolean(preparedPayload.company),
        has_phone: Boolean(preparedPayload.phone),
      });

      const response = await fetch(`${getPublicApiBase()}/api/public/contact`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedPayload),
      });

      const result = (await response.json().catch(() => null)) as
        | {
            success?: boolean;
            message?: string;
            errors?: Record<string, string[]>;
          }
        | null;

      if (!response.ok || !result?.success) {
        const validationMessage =
          response.status === 422 && result?.errors
            ? Object.values(result.errors).flat().join(' ')
            : result?.message ?? 'Не удалось отправить заявку. Попробуйте позже.';

        NotificationService.show({
          type: 'error',
          title: 'Ошибка отправки',
          message: validationMessage,
        });
        return;
      }

      setSuccessMessage(
        result.message ?? 'Заявка принята. Мы свяжемся с вами в течение рабочего дня.',
      );
      setShowSuccessModal(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        companyRole: '',
        companySize: '',
        subject: variant === 'compact' ? 'demo' : '',
        message: '',
        consentToPersonalData: false,
      });
    } catch {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка соединения',
        message: 'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const wrapperClass =
    variant === 'compact'
      ? `rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-xl ${className}`
      : `rounded-[2rem] border border-steel-200 bg-white p-8 shadow-xl ${className}`;

  return (
    <>
      <motion.div
        className={wrapperClass}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-construction-50 text-construction-700">
            <ChatBubbleLeftRightIcon className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-steel-950">
            {variant === 'compact' ? 'Оставить заявку' : 'Запросить demo или консультацию'}
          </h2>
          <p className="mt-3 text-sm leading-7 text-steel-600">
            {variant === 'compact'
              ? 'Короткая форма для первичного контакта и назначения созвона.'
              : 'Форма сохраняет только необходимые данные обращения и metadata для корректной обработки заявки.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-steel-700">
                <UserIcon className="h-4 w-4" />
                Имя
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Как к вам обращаться"
                className="w-full rounded-2xl border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-steel-700">
                <EnvelopeIcon className="h-4 w-4" />
                Email
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@company.ru"
                className="w-full rounded-2xl border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
                required
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-steel-700">
                <PhoneIcon className="h-4 w-4" />
                Телефон
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+7 (900) 000-00-00"
                className="w-full rounded-2xl border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-steel-700">
                <BuildingOffice2Icon className="h-4 w-4" />
                Компания
              </span>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Название компании"
                className="w-full rounded-2xl border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
              />
            </label>
          </div>

          {variant === 'full' ? (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-steel-700">
                    Роль компании
                  </span>
                  <select
                    name="companyRole"
                    value={formData.companyRole}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
                  >
                    <option value="">Выберите роль</option>
                    {companyRoleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-steel-700">
                    Масштаб
                  </span>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
                  >
                    <option value="">Выберите масштаб</option>
                    {companySizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-steel-700">
                  Тема обращения
                </span>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
                  required
                >
                  <option value="">Выберите тему</option>
                  {subjectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <input type="hidden" name="subject" value="demo" />
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-steel-700">
              Сообщение
            </span>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Опишите ваш процесс, текущую проблему или тип нужной демонстрации"
              rows={variant === 'compact' ? 4 : 5}
              className="w-full rounded-2xl border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
              required
            />
          </label>

          <div className="rounded-[1.5rem] border border-steel-200 bg-concrete-50 p-5">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentToPersonalData"
                checked={formData.consentToPersonalData}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 rounded border-steel-300 text-construction-600 focus:ring-construction-500"
              />
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-steel-900">
                  <ShieldCheckIcon className="h-4 w-4 text-construction-700" />
                  Согласие на обработку персональных данных
                </div>
                <p className="mt-2 text-sm leading-7 text-steel-600">
                  Подтверждаю согласие на обработку персональных данных в рамках{' '}
                  <Link
                    to={marketingPaths.privacy}
                    className="font-semibold text-construction-700"
                  >
                    политики конфиденциальности
                  </Link>{' '}
                  и принимаю условия{' '}
                  <Link
                    to={marketingPaths.offer}
                    className="font-semibold text-construction-700"
                  >
                    публичной оферты
                  </Link>
                  . Настройки аналитики описаны в{' '}
                  <Link
                    to={marketingPaths.cookies}
                    className="font-semibold text-construction-700"
                  >
                    cookies policy
                  </Link>
                  .
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.consentToPersonalData}
            className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-semibold transition ${
              isSubmitting || !formData.consentToPersonalData
                ? 'cursor-not-allowed bg-steel-300 text-white'
                : 'bg-steel-950 text-white hover:-translate-y-0.5 hover:bg-steel-900'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Отправляем заявку
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-5 w-5" />
                Отправить заявку
              </>
            )}
          </button>
        </form>
      </motion.div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Заявка отправлена"
        message={successMessage}
      />
    </>
  );
};

export default ContactForm;
