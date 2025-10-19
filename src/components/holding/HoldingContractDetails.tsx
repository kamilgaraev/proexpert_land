import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { useHoldingContractDetails } from '@/hooks/useHoldingContractDetails';
import { PageHeader } from './shared/PageHeader';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { motion } from 'framer-motion';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  active: { label: 'Активный', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  suspended: { label: 'Приостановлен', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  completed: { label: 'Завершен', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  terminated: { label: 'Расторгнут', color: 'bg-red-100 text-red-700 border-red-300' },
};

export const HoldingContractDetails = () => {
  const { id, contractId } = useParams<{ id?: string; contractId?: string }>();
  const navigate = useNavigate();
  const { data, loading, error, fetchContractDetails } = useHoldingContractDetails();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']));

  const actualContractId = id || contractId;

  useEffect(() => {
    if (actualContractId) {
      fetchContractDetails(Number(actualContractId));
    }
  }, [actualContractId, fetchContractDetails]);

  const handleBack = () => {
    navigate('/projects/contracts');
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <LoadingSpinner message="Загрузка деталей контракта..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg">
          <p className="font-medium text-lg mb-2">Ошибка загрузки контракта</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.contract) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
          <p className="text-gray-600">Контракт не найден</p>
        </div>
      </div>
    );
  }

  const { contract, financial_summary, child_contracts_summary, timeline } = data;
  const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.draft;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader
        title={`Контракт ${contract.number}`}
        subtitle={contract.subject}
        icon={<DocumentTextIcon className="w-7 h-7" />}
        actions={
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Назад
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-700 p-2 rounded-lg">
              <InformationCircleIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Статус</h3>
          </div>
          <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold border ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <CurrencyDollarIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Сумма</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(financial_summary.total_amount)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Выполнено</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {financial_summary.completion_percentage.toFixed(1)}%
          </p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all"
              style={{ width: `${Math.min(financial_summary.completion_percentage, 100)}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-600 p-2 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Осталось дней</h3>
          </div>
          <p className={`text-2xl font-bold ${timeline.days_remaining < 0 ? 'text-red-600' : 'text-amber-600'}`}>
            {timeline.days_remaining}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            из {timeline.days_total} дней
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-600 p-2 rounded-lg">
              <BuildingOfficeIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Стороны</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">
                Организация
              </label>
              <p className="text-gray-900 font-medium">{contract.organization.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {contract.organization.inn && `ИНН: ${contract.organization.inn}`}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">
                Подрядчик
              </label>
              <p className="text-gray-900 font-medium">{contract.contractor.name}</p>
              {contract.contractor.contact_person && (
                <p className="text-sm text-gray-600 mt-1">{contract.contractor.contact_person}</p>
              )}
              {contract.contractor.phone && (
                <p className="text-xs text-gray-500 mt-1">{contract.contractor.phone}</p>
              )}
              {contract.contractor.inn && (
                <p className="text-xs text-gray-500">ИНН: {contract.contractor.inn}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">
                Проект
              </label>
              <p className="text-gray-900 font-medium">{contract.project.name}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-600 p-2 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Сроки</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">
                Дата договора
              </label>
              <p className="text-gray-900">{formatDate(contract.date)}</p>
            </div>

            {contract.start_date && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Дата начала
                </label>
                <p className="text-gray-900">{formatDate(contract.start_date)}</p>
              </div>
            )}

            {contract.end_date && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Дата окончания
                </label>
                <p className="text-gray-900">{formatDate(contract.end_date)}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-600 block mb-1">
                Создан
              </label>
              <p className="text-sm text-gray-900">{formatDateTime(contract.created_at)}</p>
            </div>

            {contract.updated_at && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Обновлен
                </label>
                <p className="text-sm text-gray-900">{formatDateTime(contract.updated_at)}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <BanknotesIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Финансовая сводка</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <label className="text-xs font-medium text-emerald-700 block mb-2">
              Сумма контракта
            </label>
            <p className="text-xl font-bold text-emerald-900">
              {formatCurrency(financial_summary.total_amount)}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="text-xs font-medium text-blue-700 block mb-2">
              Оплачено
            </label>
            <p className="text-xl font-bold text-blue-900">
              {formatCurrency(financial_summary.total_paid)}
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <label className="text-xs font-medium text-amber-700 block mb-2">
              Остаток
            </label>
            <p className="text-xl font-bold text-amber-900">
              {formatCurrency(financial_summary.remaining_amount)}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <label className="text-xs font-medium text-purple-700 block mb-2">
              Утв. акты
            </label>
            <p className="text-xl font-bold text-purple-900">
              {formatCurrency(financial_summary.total_acts_approved)}
            </p>
          </div>

          {financial_summary.gp_amount > 0 && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <label className="text-xs font-medium text-indigo-700 block mb-2">
                ГП сумма
              </label>
              <p className="text-xl font-bold text-indigo-900">
                {formatCurrency(financial_summary.gp_amount)}
              </p>
            </div>
          )}

          {financial_summary.subcontract_amount > 0 && (
            <div className="bg-pink-50 p-4 rounded-lg">
              <label className="text-xs font-medium text-pink-700 block mb-2">
                Субподряды
              </label>
              <p className="text-xl font-bold text-pink-900">
                {formatCurrency(financial_summary.subcontract_amount)}
              </p>
            </div>
          )}

          {financial_summary.actual_advance > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <label className="text-xs font-medium text-green-700 block mb-2">
                Аванс
              </label>
              <p className="text-xl font-bold text-green-900">
                {formatCurrency(financial_summary.actual_advance)}
              </p>
            </div>
          )}

          {financial_summary.total_works_approved > 0 && (
            <div className="bg-teal-50 p-4 rounded-lg">
              <label className="text-xs font-medium text-teal-700 block mb-2">
                Утв. работы
              </label>
              <p className="text-xl font-bold text-teal-900">
                {formatCurrency(financial_summary.total_works_approved)}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {contract.performance_acts && contract.performance_acts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('acts')}
          >
            <div className="flex items-center gap-3">
              <div className="bg-violet-600 p-2 rounded-lg">
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Акты выполненных работ</h3>
                <p className="text-sm text-gray-500">
                  Всего актов: {contract.performance_acts.length}
                </p>
              </div>
            </div>
            <div className="text-gray-400">
              {expandedSections.has('acts') ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </div>
          </div>

          {expandedSections.has('acts') && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Номер акта
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Дата
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      Сумма
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contract.performance_acts.map((act: any) => (
                    <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {act.act_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(act.act_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600">
                        {formatCurrency(act.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${
                            act.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                              : 'bg-amber-100 text-amber-700 border-amber-300'
                          }`}
                        >
                          {act.status === 'approved' ? 'Утвержден' : act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {contract.payments && contract.payments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('payments')}
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <BanknotesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Платежи</h3>
                <p className="text-sm text-gray-500">
                  Всего платежей: {contract.payments.length}
                </p>
              </div>
            </div>
            <div className="text-gray-400">
              {expandedSections.has('payments') ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </div>
          </div>

          {expandedSections.has('payments') && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Дата
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      Сумма
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Тип
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Описание
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contract.payments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {payment.payment_type === 'advance' ? 'Аванс' : payment.payment_type === 'final' ? 'Окончательный' : payment.payment_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {payment.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {contract.child_contracts && contract.child_contracts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('subcontracts')}
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Субподряды</h3>
                <p className="text-sm text-gray-500">
                  Всего: {child_contracts_summary.total_count} на сумму {formatCurrency(child_contracts_summary.total_amount)}
                </p>
              </div>
            </div>
            <div className="text-gray-400">
              {expandedSections.has('subcontracts') ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </div>
          </div>

          {expandedSections.has('subcontracts') && (
            <div className="mt-6 space-y-3">
              {contract.child_contracts.map((subcontract: any) => (
                <div
                  key={subcontract.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-semibold text-gray-900">
                          {subcontract.number}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                          STATUS_CONFIG[subcontract.status]?.color || 'bg-gray-100 text-gray-700'
                        }`}>
                          {STATUS_CONFIG[subcontract.status]?.label || subcontract.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{subcontract.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Подрядчик: {subcontract.contractor?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Сумма</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(subcontract.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default HoldingContractDetails;

