import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/styles/auth.css';

export const EmailSentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = typeof location.state?.email === 'string' ? location.state.email : null;

  const handleGoToLogin = () => {
    navigate('/login', { state: email ? { email } : undefined });
  };

  return (
    <main className="most-workspace most-auth-page">
      <section className="most-auth-shell most-auth-content" aria-labelledby="email-sent-title">
        <Link to="/" className="mb-8 inline-flex min-h-11 items-center gap-3 font-bold text-2xl">
          <img src="/logo.svg" alt="" className="h-10 w-10" />МОСТ
        </Link>
        <Mail className="mb-5 h-8 w-8 text-primary" aria-hidden="true" />
        <h1 id="email-sent-title" className="mb-4 font-bold">Проверьте почту</h1>
        <p className="text-muted-foreground">Чтобы закончить регистрацию, откройте письмо от МОСТ и перейдите по ссылке подтверждения.</p>
        {email && <p className="mt-5 break-all font-medium">{email}</p>}
        <ol className="my-7 list-decimal space-y-3 pl-5">
          <li>Найдите письмо в почте, указанной при регистрации.</li>
          <li>Подтвердите адрес по ссылке из письма.</li>
          <li>Вернитесь ко входу и откройте личный кабинет.</li>
        </ol>
        <p className="mb-7 border-t pt-5 text-sm text-muted-foreground">Если письма нет во входящих, проверьте папки «Спам» и «Промоакции». Для повторной отправки перейдите ко входу и укажите свои данные.</p>
        <Button onClick={handleGoToLogin} className="h-12 w-full">
          Перейти ко входу<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
        </Button>
        <p className="mt-6 text-sm text-muted-foreground">Нужна помощь?{' '}
          <a href="mailto:support@xn--1-xtbgmf.xn--p1ai" className="text-primary underline underline-offset-4">Напишите нам</a>
        </p>
      </section>
    </main>
  );
};

export default EmailSentPage;
