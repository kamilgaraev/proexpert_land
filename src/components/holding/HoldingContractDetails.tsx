import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowDownTrayIcon, DocumentMagnifyingGlassIcon, DocumentTextIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useHoldingContractDetails } from '@/hooks/useHoldingContractDetails';
import { holdingLegalArchiveService } from '@/services/legalArchiveService';

const formatDate = (value: string | null): string => value ? new Intl.DateTimeFormat('ru-RU').format(new Date(value)) : '—';
const formatAmount = (value: number | null): string => value === null ? '—' : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(value);

export const HoldingContractDetails = () => {
  const navigate = useNavigate();
  const { contractId } = useParams<{ contractId: string }>();
  const { data, loading, error, fetchContractDetails } = useHoldingContractDetails();
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(contractId);
    if (Number.isInteger(id) && id > 0) {
      void fetchContractDetails(id);
    }
  }, [contractId, fetchContractDetails]);

  const openFile = async (versionId: number, mode: 'preview' | 'download') => {
    if (!data?.contract) return;

    const target = window.open('about:blank', '_blank');
    if (target === null) {
      setFileError('Разрешите открытие нового окна для просмотра документа.');

      return;
    }

    target.opener = null;

    try {
      setFileError(null);
      const url = mode === 'preview'
        ? await holdingLegalArchiveService.getPreviewUrl(data.contract.id, versionId)
        : await holdingLegalArchiveService.getDownloadUrl(data.contract.id, versionId);
      target.location.replace(url);
    } catch {
      target.close();
      setFileError('Не удалось подготовить безопасную ссылку на файл.');
    }
  };

  if (loading) return <div className="p-6 text-slate-600">Загрузка юридического досье…</div>;
  if (error || !data) return <div className="p-6"><button onClick={() => navigate(-1)} className="mb-4 text-slate-700">← Назад</button><p className="text-red-700">{error ?? 'Досье не найдено'}</p></div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-950"><ArrowLeftIcon className="h-4 w-4" />К реестру договоров</button>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <div><p className="text-sm text-slate-500">Юридическое досье{data.organization ? ` · ${data.organization.name}` : ''}</p><h1 className="mt-1 text-2xl font-semibold text-slate-950">{data.title}</h1><p className="mt-2 text-sm text-slate-600">{data.document_number ?? data.contract?.number ?? 'Без номера'} · {data.document_type_label}</p></div>
            <div className="self-start rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{data.status_label}</div>
          </div>
          <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Дата документа</dt><dd className="mt-1 font-medium">{formatDate(data.document_date)}</dd></div><div><dt className="text-slate-500">Действует с</dt><dd className="mt-1 font-medium">{formatDate(data.effective_from)}</dd></div><div><dt className="text-slate-500">Действует до</dt><dd className="mt-1 font-medium">{formatDate(data.effective_until)}</dd></div></dl>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Подписание и проверка</h2><p className="mt-2 text-sm text-slate-600">Подписей: {data.signature_summary.total}; проверено: {data.signature_summary.verified}. Статус: {data.signature_summary.status ?? 'не указан'}.</p><p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500"><LockClosedIcon className="h-4 w-4" />Архив доступен только для просмотра: действия согласования здесь не выполняются.</p></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Финансовая сводка</h2>{data.financial_summary.visible ? <div className="mt-4 grid gap-4 sm:grid-cols-3"><div><p className="text-sm text-slate-500">Сумма</p><p className="font-semibold">{formatAmount(data.financial_summary.total_amount)}</p></div><div><p className="text-sm text-slate-500">Оплачено</p><p className="font-semibold">{formatAmount(data.financial_summary.paid_amount)}</p></div><div><p className="text-sm text-slate-500">Остаток</p><p className="font-semibold">{formatAmount(data.financial_summary.remaining_amount)}</p></div></div> : <p className="mt-2 text-sm text-slate-500">У вас нет права просмотра финансовых показателей этого досье.</p>}</section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Файлы и версии</h2>
          {fileError && <p className="mt-3 text-sm text-red-700">{fileError}</p>}
          {!data.permissions.can_preview_download ? <p className="mt-2 text-sm text-slate-500">У вас нет права просмотра и скачивания файлов этого досье.</p> : data.files.length === 0 ? <p className="mt-2 text-sm text-slate-500">Файлы пока не добавлены.</p> : (
            <ul className="mt-4 divide-y divide-slate-100">
              {data.files.map((file) => (
                <li key={file.id} className="py-4">
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium">{file.title}</p>
                      <p className="text-sm text-slate-500">{file.current_version?.original_filename ?? 'Версия обрабатывается'}</p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-2 pl-8">
                    {file.versions.map((version) => (
                      <li key={version.id} className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-slate-700">Версия {version.version_number}: {version.original_filename}</span>
                        {version.preview_available ? <div className="flex gap-2">
                          <button type="button" onClick={() => void openFile(version.id, 'preview')} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"><DocumentMagnifyingGlassIcon className="h-4 w-4" />Просмотр</button>
                          <button type="button" onClick={() => void openFile(version.id, 'download')} className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white"><ArrowDownTrayIcon className="h-4 w-4" />Скачать</button>
                        </div> : <span className="text-sm text-slate-500">Версия обрабатывается</span>}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default HoldingContractDetails;
