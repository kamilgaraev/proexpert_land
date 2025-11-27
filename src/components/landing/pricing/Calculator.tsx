import { useState, useMemo } from 'react';
import { PRICING_MODULES } from '../../../constants/landing-content';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const Calculator = () => {
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set(
    PRICING_MODULES.filter(m => m.type === 'core').map(m => m.id)
  ));

  const toggleModule = (id: string, type: string) => {
    if (type === 'core') return; // Core modules cannot be deselected

    const newSelected = new Set(selectedModules);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedModules(newSelected);
  };

  const totals = useMemo(() => {
    let monthly = 0;
    let oneTime = 0;

    PRICING_MODULES.forEach(module => {
      if (selectedModules.has(module.id)) {
        if (module.period === 'one_time') {
          oneTime += module.price;
        } else {
          monthly += module.price;
        }
      }
    });

    return { monthly, oneTime };
  }, [selectedModules]);

  const categories = [
    { id: 'core', title: 'CORE (База)', description: 'Бесплатно для всех. Всегда.' },
    { id: 'feature', title: 'FEATURE (Модули)', description: 'Расширьте возможности вашей ERP.' },
    { id: 'addon', title: 'ADDONS (Дополнения)', description: 'Специализированные инструменты.' },
    { id: 'service', title: 'SERVICES (Услуги)', description: 'Разовые услуги и настройки.' },
  ];

  return (
    <section className="py-12 sm:py-24 bg-slate-50 min-h-screen">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Соберите свой ProHelper</h2>
          <p className="text-lg text-slate-600">
            Выбирайте только то, что нужно вашему бизнесу. Платите только за результат.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 relative items-start">
          
          {/* Left Column: Module Selection */}
          <div className="lg:col-span-8 space-y-8">
            {categories.map((category) => {
              const modules = PRICING_MODULES.filter(m => m.type === category.id);
              if (modules.length === 0) return null;

              return (
                <div key={category.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-900">{category.title}</h3>
                    <p className="text-slate-500 text-sm">{category.description}</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {modules.map((module) => {
                      const isSelected = selectedModules.has(module.id);
                      const isCore = module.type === 'core';
                      
                      return (
                        <div 
                          key={module.id}
                          onClick={() => toggleModule(module.id, module.type)}
                          className={`group p-4 sm:p-6 flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50 ${isSelected ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected 
                                ? isCore ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-construction-600 border-construction-600 text-white'
                                : 'border-slate-300 text-transparent group-hover:border-construction-400'
                            }`}>
                              <CheckCircleIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                  {module.name}
                                </span>
                                {module.status && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                    module.status === 'Beta' ? 'bg-amber-100 text-amber-700' :
                                    module.status === 'Dev' ? 'bg-purple-100 text-purple-700' :
                                    module.status === 'Alpha' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {module.status}
                                  </span>
                                )}
                              </div>
                              {/* Mobile Price display */}
                              <div className="text-sm text-slate-500 mt-1 sm:hidden">
                                {module.price === 0 ? 'Бесплатно' : `${module.price.toLocaleString()} ₽`}
                              </div>
                            </div>
                          </div>
                          
                          <div className="hidden sm:block text-right">
                            <div className={`font-bold ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                              {module.price === 0 ? 'Бесплатно' : `${module.price.toLocaleString()} ₽`}
                            </div>
                            {module.price > 0 && (
                              <div className="text-xs text-slate-400">
                                {module.period === 'one_time' ? 'разово' : '/ мес'}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700">
                <h3 className="text-xl font-bold mb-1">Ваша конфигурация</h3>
                <div className="text-slate-400 text-sm">
                  {selectedModules.size} {selectedModules.size === 1 ? 'модуль' : 'модуля'} выбрано
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Selected List Preview (Limited) */}
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {Array.from(selectedModules).map(id => {
                    const module = PRICING_MODULES.find(m => m.id === id);
                    if (!module || module.price === 0) return null;
                    return (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-slate-300">{module.name}</span>
                        <span className="text-white font-medium">{module.price.toLocaleString()} ₽</span>
                      </div>
                    );
                  })}
                  {totals.monthly === 0 && totals.oneTime === 0 && (
                     <div className="text-slate-500 text-sm italic">Только бесплатные модули</div>
                  )}
                </div>

                <div className="border-t border-slate-700 pt-4 space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-400">Ежемесячно:</span>
                    <span className="text-3xl font-bold text-white">{totals.monthly.toLocaleString()} ₽</span>
                  </div>
                  {totals.oneTime > 0 && (
                    <div className="flex justify-between items-end">
                      <span className="text-slate-400 text-sm">Разовые платежи:</span>
                      <span className="text-lg font-medium text-slate-300">{totals.oneTime.toLocaleString()} ₽</span>
                    </div>
                  )}
                </div>

                <button className="w-full py-4 bg-construction-600 hover:bg-construction-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-construction-900/20">
                  Оформить подписку
                </button>
                
                <p className="text-xs text-center text-slate-500">
                  7 дней бесплатного периода для всех платных модулей
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Calculator;

