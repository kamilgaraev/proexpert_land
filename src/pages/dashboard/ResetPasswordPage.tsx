import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@utils/api';
import { usePageTitle } from '@/hooks/useSEO';
import '@/styles/auth.css';

const ResetPasswordPage = () => {
  usePageTitle('Новый пароль — МОСТ');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const validLink = Boolean(token && email);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || !validLink) return;
    if (password !== confirmation) {
      setError('Пароли не совпадают');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword({
        token,
        email,
        password,
        password_confirmation: confirmation,
      });
      setSuccess(true);
      setPassword('');
      setConfirmation('');
    } catch (failure: unknown) {
      const response = (failure as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
      setError(Object.values(response?.errors ?? {}).flat().join(' ') || response?.message || 'Не удалось изменить пароль. Запросите новую ссылку и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="most-workspace most-auth-page">
      <div className="most-auth-shell most-auth-content">
        <h1 className="text-2xl font-bold mb-4">{success ? 'Пароль изменён' : 'Новый пароль'}</h1>
        {success ? (
          <div role="status" className="space-y-6">
            <p>Теперь вы можете войти с новым паролем.</p>
            <Button asChild className="w-full"><Link to="/login">Войти</Link></Button>
          </div>
        ) : !validLink ? (
          <div className="space-y-6">
            <p role="alert">В ссылке не хватает данных для восстановления пароля.</p>
            <Link to="/forgot-password" className="text-primary underline">Запросить новую ссылку</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-muted-foreground">Укажите новый пароль для {email}.</p>
            {error && <p role="alert" className="text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input id="new-password" type="password" autoComplete="new-password" value={password}
                onChange={event => setPassword(event.target.value)} required minLength={8} disabled={loading}
                aria-describedby="password-rules" />
              <p id="password-rules" className="text-sm text-muted-foreground">Не менее 8 символов, строчные и заглавные буквы и цифры.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Повторите пароль</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmation}
                onChange={event => setConfirmation(event.target.value)} required minLength={8} disabled={loading} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Сохраняем...' : 'Сохранить пароль'}</Button>
            <Link to="/forgot-password" className="block text-primary underline">Запросить новую ссылку</Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
