import Features from '../../components/landing/Features';
import AIFocus from '../../components/landing/AIFocus';
import Trust from '../../components/landing/Trust';

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="bg-white py-12 border-b border-slate-100">
        <div className="container-custom px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Продукты экосистемы</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Полный набор инструментов для управления строительством
          </p>
        </div>
      </div>
      <Features />
      <AIFocus />
      <Trust />
    </div>
  );
};

export default FeaturesPage;

