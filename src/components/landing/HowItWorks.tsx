import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Прораб принимает материалы',
    description: 'В мобильном приложении прораб фиксирует поступление материалов на объект, указывая материал, количество и поставщика. Он может прикрепить фото накладной.',
    image: '/how-it-works-1.svg',
  },
  {
    number: '02',
    title: 'Прораб списывает материалы',
    description: 'При использовании материалов прораб отмечает в приложении, какие материалы и в каком количестве были использованы, а также для каких видов работ.',
    image: '/how-it-works-2.svg',
  },
  {
    number: '03',
    title: 'Прораб фиксирует выполненные работы',
    description: 'Прораб вносит информацию о выполненных работах, указывая их вид и объем. Можно прикрепить фото выполненных работ в качестве подтверждения.',
    image: '/how-it-works-3.svg',
  },
  {
    number: '04',
    title: 'Бухгалтерия получает отчеты',
    description: 'Бухгалтер или администратор в веб-интерфейсе формирует отчеты за нужный период и выгружает их в формате, готовом для импорта в учетную систему.',
    image: '/how-it-works-4.svg',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-12 bg-white sm:py-16 lg:py-20">
      <div className="container-custom">
        <div className="text-center">
          <motion.h2 
            className="text-primary-600 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            КАК ЭТО РАБОТАЕТ
          </motion.h2>
          <motion.h3 
            className="mt-2 text-3xl font-bold text-secondary-900 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            От стройплощадки до бухгалтерии за 4 шага
          </motion.h3>
          <motion.p 
            className="mt-4 max-w-2xl mx-auto text-xl text-secondary-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Простая и понятная система, которая работает на всех этапах
          </motion.p>
        </div>

        <div className="mt-16 space-y-16">
          {steps.map((step, index) => (
            <motion.div 
              key={step.number}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="lg:w-1/2 flex flex-col justify-center">
                <div className="flex items-center">
                  <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-700 font-bold text-lg">
                    {step.number}
                  </span>
                  <h4 className="ml-4 text-2xl font-bold text-secondary-900">{step.title}</h4>
                </div>
                <p className="mt-4 text-lg text-secondary-500">{step.description}</p>
              </div>
              <div className="lg:w-1/2 rounded-lg overflow-hidden shadow-lg bg-secondary-50 flex items-center justify-center p-8">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full max-h-96 object-contain"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 