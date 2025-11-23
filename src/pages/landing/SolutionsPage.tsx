import Solutions from '../../components/landing/solutions/Solutions';
import Trust from '../../components/landing/Trust';

const SolutionsPage = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="bg-slate-50 py-12 border-b border-slate-200">
        <div className="container-custom px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Решения для вашего бизнеса</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Специализированные инструменты для каждого участника строительного процесса
          </p>
        </div>
      </div>
      <Solutions />
      <Trust />
    </div>
  );
};

export default SolutionsPage;

