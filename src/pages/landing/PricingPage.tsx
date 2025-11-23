import PricingPlans from '../../components/landing/pricing/PricingPlans';
import Calculator from '../../components/landing/pricing/Calculator';
import Trust from '../../components/landing/Trust';

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <PricingPlans />
      
      {/* Divider with text for Custom Calculator */}
      <div className="bg-slate-50 pb-12">
        <div className="container-custom px-4 text-center">
          <p className="text-slate-500 mb-4">Нужна индивидуальная конфигурация?</p>
          <div className="h-px bg-slate-200 w-full max-w-md mx-auto"></div>
        </div>
      </div>

      <Calculator />
      <Trust />
    </div>
  );
};

export default PricingPage;
