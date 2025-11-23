import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Mail,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Пожалуйста, введите ваш email');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Пожалуйста, введите корректный email');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      setIsSuccess(true);
    } catch (err: any) {
      setError('Произошла ошибка при отправке запроса. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
         <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://img.freepik.com/free-vector/construction-set-icons_1284-13233.jpg')] bg-repeat bg-[length:400px]"></div>
        
        <motion.div 
          className="w-full max-w-md bg-card border rounded-3xl shadow-2xl p-8 text-center relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">
            Письмо отправлено!
          </h1>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Мы отправили инструкции по восстановлению пароля на адрес{' '}
            <span className="font-semibold text-foreground">{email}</span>
          </p>
          
          <div className="bg-muted rounded-xl p-4 mb-6">
            <p className="text-muted-foreground text-sm">
              Не получили письмо? Проверьте папку "Спам" или попробуйте снова через несколько минут.
            </p>
          </div>
          
          <Button asChild className="w-full h-12 text-base">
            <Link to="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к входу
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://img.freepik.com/free-vector/construction-set-icons_1284-13233.jpg')] bg-repeat bg-[length:400px]"></div>

      <motion.div 
        className="w-full max-w-md bg-card border rounded-3xl shadow-2xl p-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center mb-6 gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30">
                P
            </div>
            <span className="text-2xl font-bold">ProHelper</span>
          </Link>
          
          <h1 className="text-2xl font-bold mb-2">
            Восстановление пароля
          </h1>
          <p className="text-muted-foreground">
            Введите ваш email для сброса пароля
          </p>
        </div>

        {error && (
          <motion.div 
            className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3 text-destructive"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
             <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
             <div className="text-sm">
               <p className="font-bold">Ошибка</p>
               <p>{error}</p>
             </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email адрес</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="pl-10 h-11" 
                placeholder="name@example.com"
                required 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base shadow-lg shadow-primary/20" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Отправка...
              </>
            ) : (
              'Отправить инструкции'
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к входу
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
