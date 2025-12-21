import React, { useEffect, useMemo, useState } from 'react';
import OrangeModal from '@/components/shared/OrangeModal';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useCustomRoles } from '@/hooks/useCustomRoles';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

type Mode = 'invitation' | 'direct';

const UserCreateInviteModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const { roles, fetchRoles, sendInvitation, createUserWithCustomRoles } = useUserManagement();
  const { customRoles, fetchCustomRoles } = useCustomRoles();

  const [mode, setMode] = useState<Mode>('invitation');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [showEmailVerificationNotice, setShowEmailVerificationNotice] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role_slugs: [] as string[],
    custom_role_ids: [] as number[],
    password: '',
    password_confirmation: '',
    send_credentials: true
  });

  useEffect(() => {
    if (!isOpen) return;
    // лениво тянем данные для выбора ролей
    fetchRoles().catch(() => {});
    fetchCustomRoles().catch(() => {});
  }, [isOpen, fetchRoles, fetchCustomRoles]);

  const systemRoles = useMemo(() => roles.filter((r: any) => r.is_system), [roles]);

  const filteredSystemRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return systemRoles;
    return systemRoles.filter((r: any) => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q));
  }, [systemRoles, query]);

  const filteredCustomRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customRoles;
    return customRoles.filter((r: any) => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q));
  }, [customRoles, query]);

  const toggleSystemRole = (slug: string) => {
    setForm(prev => ({
      ...prev,
      role_slugs: prev.role_slugs.includes(slug)
        ? prev.role_slugs.filter(s => s !== slug)
        : [...prev.role_slugs, slug]
    }));
  };

  const toggleCustomRole = (id: number) => {
    setForm(prev => ({
      ...prev,
      custom_role_ids: prev.custom_role_ids.includes(id)
        ? prev.custom_role_ids.filter(rid => rid !== id)
        : [...prev.custom_role_ids, id]
    }));
  };

  const submit = async () => {
    setLoading(true);
    setShowEmailVerificationNotice(false);
    try {
      if (mode === 'direct') {
        const response = await createUserWithCustomRoles({
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
          custom_role_ids: form.custom_role_ids,
          send_credentials: form.send_credentials
        });
        
        // Проверяем статус верификации email
        if (response?.data?.user?.email_verified_at === null || response?.data?.user?.email_verified_at === undefined) {
          setShowEmailVerificationNotice(true);
        } else {
          onSave();
        }
      } else {
        await sendInvitation({
          name: form.name,
          email: form.email,
          role_slugs: form.role_slugs,
          metadata: {}
        });
        onSave();
      }
    } catch (error: any) {
      toast.error(error.message || 'Ошибка создания пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrangeModal
      isOpen={isOpen}
      title={mode === 'direct' ? 'Создать пользователя' : 'Пригласить пользователя'}
      primaryLabel={mode === 'direct' ? 'Создать' : 'Отправить'}
      onPrimary={submit}
      onClose={onClose}
      isProcessing={loading}
      widthClassName="max-w-3xl"
    >
      <div className="space-y-5">
        {showEmailVerificationNotice && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">Пользователь создан успешно</h4>
              <p className="text-sm text-yellow-800">
                На его email отправлено письмо для подтверждения адреса. Пользователь сможет войти в систему только после подтверждения email.
              </p>
              <button
                onClick={() => {
                  setShowEmailVerificationNotice(false);
                  onSave();
                }}
                className="mt-3 text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
              >
                Понятно
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 bg-gray-50 p-1 rounded-lg w-fit">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${mode === 'invitation' ? 'bg-white text-orange-700 border border-orange-200' : 'text-gray-700'}`}
            onClick={() => setMode('invitation')}
            type="button"
          >
            Приглашение
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${mode === 'direct' ? 'bg-white text-orange-700 border border-orange-200' : 'text-gray-700'}`}
            onClick={() => setMode('direct')}
            type="button"
          >
            Создать напрямую
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
            <input className="w-full px-3 py-2 border rounded-lg" value={form.name} onChange={e => setForm(v => ({...v, name: e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input className="w-full px-3 py-2 border rounded-lg" value={form.email} onChange={e => setForm(v => ({...v, email: e.target.value}))} />
          </div>
        </div>

        {mode === 'direct' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль *</label>
              <input type="password" className="w-full px-3 py-2 border rounded-lg" value={form.password} onChange={e => setForm(v => ({...v, password: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Подтверждение *</label>
              <input type="password" className="w-full px-3 py-2 border rounded-lg" value={form.password_confirmation} onChange={e => setForm(v => ({...v, password_confirmation: e.target.value}))} />
            </div>
            <label className="flex items-center gap-2 text-sm col-span-full">
              <input type="checkbox" checked={form.send_credentials} onChange={e => setForm(v => ({...v, send_credentials: e.target.checked}))} />
              Отправить данные для входа на email
            </label>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">Роли</div>
            <input
              placeholder="Поиск по ролям..."
              className="px-3 py-2 border rounded-lg w-64"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">Системные роли</div>
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {filteredSystemRoles.map((r: any) => (
                  <label key={r.slug} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.role_slugs.includes(r.slug)} onChange={() => toggleSystemRole(r.slug)} />
                    <span>{r.name}</span>
                  </label>
                ))}
                {filteredSystemRoles.length === 0 && <div className="text-xs text-gray-400">Ничего не найдено</div>}
              </div>
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">Кастомные роли</div>
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {filteredCustomRoles.map((r: any) => (
                  <label key={r.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.custom_role_ids.includes(r.id)} onChange={() => toggleCustomRole(r.id)} />
                    <span>{r.name}</span>
                  </label>
                ))}
                {filteredCustomRoles.length === 0 && <div className="text-xs text-gray-400">Ничего не найдено</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrangeModal>
  );
};

export default UserCreateInviteModal;


