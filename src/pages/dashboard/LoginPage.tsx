import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User, 
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailVerificationModal } from '@/components/dashboard/EmailVerificationModal';
import '@/styles/auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Ошибка входа:', err);
      
      // Проверяем ошибку 403 с сообщением о неподтвержденном email
      const errorMessage = err.response?.data?.message || err.message || '';
      if (err.status === 403 && (
        errorMessage.includes('подтвердите ваш email') || 
        errorMessage.includes('подтвердите email') ||
        errorMessage.includes('Пожалуйста, подтвердите ваш email адрес')
      )) {
        setShowEmailVerificationModal(true);
        setError('');
      } else if (err.message?.includes('Не удалось подключиться к серверу')) {
        setError('Не удалось подключиться к серверу. Проверьте подключение к интернету или попробуйте позже.');
      } else if (err.message?.includes('Неверные учетные данные')) {
        setError('Неверный email или пароль');
      } else {
        setError(errorMessage || 'Ошибка при входе. Проверьте учетные данные.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="most-workspace most-auth-page">

      <motion.div 
        className="most-auth-shell most-auth-shell--split"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        
        {/* Left Panel - Form */}
        <div className="most-auth-content flex flex-col justify-center">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center mb-8 gap-3 transition-opacity hover:opacity-80">
              <img src="/logo.svg" alt="" className="h-12 w-12 object-contain" />
              <span className="text-2xl font-extrabold tracking-tight text-foreground">МОСТ</span>
            </Link>
            
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
              С возвращением
            </h1>
            <p className="text-muted-foreground text-lg">
              Введите свои данные для входа в систему
            </p>
          </div>

          {error && (
            <motion.div 
              role="alert"
              className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 items-start text-destructive"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Ошибка авторизации</p>
                <p className="opacity-90">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className="pl-10 h-12 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Введите пароль"
                  className="pl-10 pr-10 h-12 text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  aria-label="Показать пароль"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="most-auth-options">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="rounded border-input text-primary focus:ring-primary w-4 h-4 transition-colors"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Запомнить меня</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                Забыли пароль?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                 <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Вход...
                 </span>
              ) : (
                <span className="flex items-center gap-2">
                  Войти в систему
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline underline-offset-4">
              Зарегистрироваться
            </Link>
          </div>
        </div>

        <aside className="most-auth-brand-panel">
          <h2>Между офисом и стройкой — МОСТ.</h2>
          <p>Вернитесь к проектам, команде и документам компании. Продолжайте работу с того места, где остановились.</p>
          <svg className="most-auth-bridge" viewBox="0 0 480 220" fill="none" aria-hidden="true">
            <path d="M12 92H468" stroke="hsl(var(--primary))" strokeWidth="4" />
            <path d="M112 184V92L240 184L368 92V184" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
            <path d="M20 92V50H76V92M30 50V20M64 50V20M20 68H76M404 92V12H458V92M414 30H448M414 48H448M414 66H448" stroke="currentColor" strokeWidth="2" />
            <path d="M94 188H130M350 188H386" stroke="hsl(var(--primary))" strokeWidth="4" />
          </svg>
        </aside>

      </motion.div>

      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        email={email}
        onClose={() => setShowEmailVerificationModal(false)}
      />
    </div>
  );
};

export default LoginPage;
