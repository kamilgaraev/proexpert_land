import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEmailVerification } from '@/hooks/useEmailVerification';

export const EmailSentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'вашу почту';
  const [countdown, setCountdown] = useState(3);
  const [autoRedirect, setAutoRedirect] = useState(true);
  
  const {
    canResend,
    resendCooldown,
    resendVerificationEmail,
    loading
  } = useEmailVerification();

  useEffect(() => {
    if (autoRedirect && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (autoRedirect && countdown === 0) {
      navigate('/dashboard');
    }
  }, [countdown, autoRedirect, navigate]);

  const handleGoToDashboard = () => {
    setAutoRedirect(false);
    navigate('/dashboard');
  };

  const handleCancelAutoRedirect = () => {
    setAutoRedirect(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-construction-50 via-white to-safety-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2 border-construction-200 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-construction-500 to-construction-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4"
            >
              <Mail className="w-14 h-14 text-construction-600" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Проверьте вашу почту!
            </h1>
            <p className="text-construction-100 text-lg">
              Регистрация почти завершена
            </p>
          </div>

          <CardContent className="p-8 md:p-12">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <p className="text-lg text-gray-700 mb-4">
                  Мы отправили письмо с подтверждением на адрес:
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-construction-50 border-2 border-construction-200 rounded-xl">
                  <Mail className="w-5 h-5 text-construction-600" />
                  <span className="text-xl font-semibold text-construction-900">
                    {email}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Что делать дальше?
                    </h3>
                    <ol className="space-y-2 text-blue-800">
                      <li className="flex items-start">
                        <span className="font-bold mr-2">1.</span>
                        <span>Откройте свою почту и найдите письмо от ProHelper</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">2.</span>
                        <span>Нажмите на оранжевую кнопку "Подтвердить email"</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">3.</span>
                        <span>После подтверждения вы получите полный доступ к платформе</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                    <span className="text-yellow-800 font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800">
                      <strong>Не видите письмо?</strong> Проверьте папку "Спам" или "Промоакции". 
                      Письмо должно прийти в течение нескольких минут.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button
                  onClick={handleGoToDashboard}
                  className="flex-1 h-14 text-lg shadow-lg"
                  size="lg"
                >
                  Перейти в личный кабинет
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button
                  onClick={resendVerificationEmail}
                  disabled={!canResend || loading}
                  variant="outline"
                  className="h-14 px-6 border-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : !canResend ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Повторить через {resendCooldown}с
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Отправить повторно
                    </>
                  )}
                </Button>
              </motion.div>

              {autoRedirect && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-center pt-4 border-t"
                >
                  <p className="text-sm text-gray-500 mb-2">
                    Автоматический переход в личный кабинет через {countdown} {countdown === 1 ? 'секунду' : 'секунд'}...
                  </p>
                  <button
                    onClick={handleCancelAutoRedirect}
                    className="text-sm text-construction-600 hover:text-construction-700 underline"
                  >
                    Отменить
                  </button>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600">
            Нужна помощь?{' '}
            <a 
              href="mailto:support@prohelper.pro" 
              className="text-construction-600 hover:text-construction-700 font-semibold underline"
            >
              Напишите нам
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmailSentPage;

