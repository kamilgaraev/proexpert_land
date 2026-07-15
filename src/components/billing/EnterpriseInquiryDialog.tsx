import { useEffect, useState, type FormEvent } from 'react';
import { Building2, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createEnterpriseInquiry } from '@/services/enterpriseInquiryService';
import { CommercialApiError } from '@/types/commercialBilling';
import type {
  EnterpriseCompanySize,
  EnterpriseNeed,
  EnterprisePreferredContact,
} from '@/types/enterpriseInquiry';

interface EnterpriseInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const needOptions: Array<{ value: EnterpriseNeed; label: string }> = [
  { value: 'multi_organization', label: 'Несколько организаций и филиалов' },
  { value: 'integrations', label: 'Интеграции с учётными системами' },
  { value: 'access_control', label: 'Особые правила доступа' },
  { value: 'implementation', label: 'Обучение и помощь с запуском' },
  { value: 'personal_configuration', label: 'Настройка под процессы компании' },
  { value: 'priority_support', label: 'Приоритетная поддержка' },
];

const initialForm = {
  contactPhone: '',
  companySize: '51_200' as EnterpriseCompanySize,
  preferredContact: 'phone' as EnterprisePreferredContact,
  needs: [] as EnterpriseNeed[],
  comment: '',
};

export const EnterpriseInquiryDialog = ({ open, onOpenChange }: EnterpriseInquiryDialogProps) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setSubmitting(false);
      setSubmitted(false);
      setError(null);
    }
  }, [open]);

  const toggleNeed = (need: EnterpriseNeed, checked: boolean) => {
    setForm((current) => ({
      ...current,
      needs: checked
        ? Array.from(new Set([...current.needs, need]))
        : current.needs.filter((item) => item !== need),
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.contactPhone.trim() || form.needs.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await createEnterpriseInquiry({ ...form, contactPhone: form.contactPhone.trim(), comment: form.comment.trim() });
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError instanceof CommercialApiError
        ? requestError.message
        : 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-slate-200 bg-white p-0 sm:max-w-2xl">
        {submitted ? (
          <div className="flex flex-col items-center px-6 py-12 text-center sm:px-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <DialogTitle className="mt-5 text-2xl text-slate-950">Заявка отправлена</DialogTitle>
            <DialogDescription className="mt-3 max-w-md leading-6 text-slate-600">
              Специалист МОСТ изучит задачи компании и свяжется с вами выбранным способом.
            </DialogDescription>
            <Button type="button" className="mt-7 bg-blue-700 hover:bg-blue-800" onClick={() => onOpenChange(false)}>
              Готово
            </Button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <DialogHeader className="border-b border-slate-200 px-6 py-6 text-left sm:px-8">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Building2 className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl text-slate-950">Обсудить корпоративное подключение</DialogTitle>
              <DialogDescription className="pt-1 leading-6 text-slate-600">
                Расскажите о масштабе и задачах — заявка сразу попадёт специалисту МОСТ.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 px-6 py-6 sm:px-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="enterprise-phone">Телефон для связи</Label>
                  <Input
                    id="enterprise-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+7 900 000-00-00"
                    value={form.contactPhone}
                    onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enterprise-company-size">Размер компании</Label>
                  <select
                    id="enterprise-company-size"
                    className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={form.companySize}
                    onChange={(event) => setForm((current) => ({ ...current, companySize: event.target.value as EnterpriseCompanySize }))}
                  >
                    <option value="up_to_50">До 50 сотрудников</option>
                    <option value="51_200">51–200 сотрудников</option>
                    <option value="201_500">201–500 сотрудников</option>
                    <option value="501_1000">501–1000 сотрудников</option>
                    <option value="1000_plus">Более 1000 сотрудников</option>
                  </select>
                </div>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-slate-950">Что важно для вашей компании</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {needOptions.map((option) => {
                    const checked = form.needs.includes(option.value);
                    return (
                      <Label
                        key={option.value}
                        htmlFor={`enterprise-need-${option.value}`}
                        className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 font-normal text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                      >
                        <Checkbox
                          id={`enterprise-need-${option.value}`}
                          checked={checked}
                          onCheckedChange={(value) => toggleNeed(option.value, value === true)}
                        />
                        <span>{option.label}</span>
                      </Label>
                    );
                  })}
                </div>
                {form.needs.length === 0 ? <p className="text-xs text-slate-500">Выберите хотя бы одну задачу.</p> : null}
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="enterprise-contact-method">Как удобнее связаться</Label>
                  <select
                    id="enterprise-contact-method"
                    className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={form.preferredContact}
                    onChange={(event) => setForm((current) => ({ ...current, preferredContact: event.target.value as EnterprisePreferredContact }))}
                  >
                    <option value="phone">Позвонить</option>
                    <option value="email">Написать на почту</option>
                    <option value="messenger">Написать в мессенджер</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enterprise-comment">Комментарий</Label>
                  <Textarea
                    id="enterprise-comment"
                    className="min-h-24 resize-y rounded-xl"
                    maxLength={3000}
                    placeholder="Коротко опишите задачу, если это важно"
                    value={form.comment}
                    onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                  />
                </div>
              </div>

              {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
            </div>

            <DialogFooter className="border-t border-slate-200 px-6 py-5 sm:px-8">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
              <Button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800"
                disabled={submitting || !form.contactPhone.trim() || form.needs.length === 0}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {submitting ? 'Отправляем…' : 'Отправить заявку'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
