import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';
import { PRICING_PLANS } from '../../../constants/landing-content';

const PricingPlans = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Выберите подходящий <span className="text-construction-600">тарифный план</span>
          </h2>
          <p className="text-lg text-slate-600">
            Гибкие тарифы для компаний любого размера - от стартапов до крупных холдингов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-[1400px] mx-auto">
          {PRICING_PLANS.map((plan, index) => {
            const Icon = plan.icon;
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col bg-white rounded-2xl transition-all duration-300 ${
                  plan.isPopular 
                    ? 'ring-2 ring-construction-500 shadow-2xl scale-105 z-10' 
                    : 'border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-max">
                    <div className="bg-construction-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-md">
                      Популярный выбор
                    </div>
                  </div>
                )}

                <div className="p-6 flex-grow flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                    plan.isPopular ? 'bg-construction-100 text-construction-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mb-6 h-10 flex items-center justify-center">
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-slate-900">
                        {plan.price === 0 ? '₽0' : `₽${plan.price.toLocaleString()}`}
                      </span>
                      {plan.price > 0 && <span className="text-slate-500 text-sm">/ мес</span>}
                    </div>
                    {plan.price === 0 && <span className="text-slate-500 text-sm">в месяц</span>}
                  </div>

                  <ul className="space-y-3 mb-8 w-full text-left flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckIcon className="w-5 h-5 text-construction-500 shrink-0" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      plan.isPopular
                        ? 'bg-construction-600 text-white hover:bg-construction-700 shadow-lg shadow-construction-600/25'
                        : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-construction-600 hover:text-construction-600'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;

