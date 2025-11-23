import { motion } from 'framer-motion';
import { FEATURES_CONTENT } from '../../constants/landing-content';
import { CubeIcon } from '@heroicons/react/24/outline';

const Features = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{FEATURES_CONTENT.title}</h2>
          <p className="text-lg text-slate-600">{FEATURES_CONTENT.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {FEATURES_CONTENT.groups.map((group, idx) => {
            const Icon = group.icon || CubeIcon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-construction-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-construction-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{group.title}</h3>
                    <ul className="space-y-3">
                      {group.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center gap-3 text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-construction-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
