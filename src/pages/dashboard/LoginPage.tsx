import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// We didn't create Checkbox yet, so I'll use a simple native one styled or quickly create it.
// For now I will use a native input with tailwind classes or assume I can make a simple one.

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // const [showNetworkError, setShowNetworkError] = useState(false);
  
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
    // setShowNetworkError(false);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Ошибка входа:', err);
      
      if (err.message?.includes('Не удалось подключиться к серверу')) {
        // setShowNetworkError(true);
        setError('Не удалось подключиться к серверу. Проверьте подключение к интернету или попробуйте позже.');
      } else if (err.message?.includes('Неверные учетные данные')) {
        setError('Неверный email или пароль');
      } else {
        setError(err.message || 'Ошибка при входе. Проверьте учетные данные.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 lg:p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://img.freepik.com/free-vector/construction-set-icons_1284-13233.jpg?w=740&t=st=1688212739~exp=1688213339~hmac=5c40049880458034950549147135503451414741490107508071527005575610')] bg-repeat bg-[length:400px]"></div>

      <motion.div 
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-card border rounded-3xl shadow-2xl overflow-hidden relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        
        {/* Left Panel - Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center mb-8 gap-3 transition-opacity hover:opacity-80">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30">
                P
              </div>
              <span className="text-2xl font-bold tracking-tight">ProHelper</span>
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
                  type="email"
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  className="pl-10 pr-10 h-12 text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
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
              className="w-full h-12 text-base shadow-lg shadow-primary/20" 
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

        {/* Right Panel - Visuals */}
        <div className="hidden lg:flex bg-muted relative overflow-hidden p-12 flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-orange-600 mix-blend-multiply z-10" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2531&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-50 z-0" />
            
            <div className="relative z-20 text-white mt-12">
                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8">
                    <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold mb-6 leading-tight">
                    Строим будущее<br/>вместе с вами
                </h2>
                <p className="text-white/80 text-lg max-w-md leading-relaxed">
                    Полный контроль над строительными проектами, финансами и командой в единой экосистеме ProHelper.
                </p>
            </div>

            <div className="relative z-20 grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                    <div className="text-3xl font-bold text-white mb-1">15+</div>
                    <div className="text-white/70 text-sm">Инструментов управления</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                    <div className="text-3xl font-bold text-white mb-1">24/7</div>
                    <div className="text-white/70 text-sm">Поддержка и доступность</div>
                </div>
            </div>
        </div>

      </motion.div>
    </div>
  );
};

export default LoginPage;
