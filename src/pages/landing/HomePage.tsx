import Hero from '../../components/landing/Hero';
import Trust from '../../components/landing/Trust';
import AIFocus from '../../components/landing/AIFocus';
import Solutions from '../../components/landing/solutions/Solutions';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Trust />
      <Solutions />
      <AIFocus />
      
      {/* Final CTA Section */}
      <section className="py-24 bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-100">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Готовы начать работу?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Соберите свою идеальную конфигурацию ProHelper прямо сейчас. 
              Никаких скрытых платежей, только то, что нужно вам.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-construction-600 rounded-xl hover:bg-construction-700 hover:shadow-lg hover:shadow-construction-600/25 hover:-translate-y-1"
            >
              Рассчитать стоимость
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

