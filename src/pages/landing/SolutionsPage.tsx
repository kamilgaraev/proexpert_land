import { useEffect } from 'react';
import ContactForm from '@/components/landing/ContactForm';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import SolutionStory from '@/components/marketing/blocks/SolutionStory';
import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  marketingCapabilityMatrix,
  marketingPackages,
  marketingPaths,
  marketingSeo,
  marketingSolutionSegments,
} from '@/data/marketingRegistry';
import useAnalytics from '@/hooks/useAnalytics';
import { useSEO } from '@/hooks/useSEO';

const SolutionsPage = () => {
  useSEO({
    ...marketingSeo.solutions,
    type: 'website',
  });

  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('marketing_solutions');
  }, [trackPageView]);

  const capabilityMap = new Map(
    marketingCapabilityMatrix.map((capability) => [capability.id, capability]),
  );
  const packageMap = new Map(marketingPackages.map((item) => [item.slug, item]));

  return (
    <div className="bg-white pt-28">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_24%),linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <SectionHeader
            eyebrow="Решения"
            title="Показываем продукт через задачи команды, а не через абстрактный каталог функций"
            description="Ниже собраны типовые сценарии для строительного бизнеса: от подрядчика с несколькими объектами до группы компаний."
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom space-y-8">
          {marketingSolutionSegments.map((segment, index) => {
            const capabilities = segment.capabilityIds
              .map((capabilityId) => capabilityMap.get(capabilityId))
              .filter((item): item is NonNullable<typeof item> => Boolean(item));
            const packages = segment.recommendedPackageSlugs
              .map((packageSlug) => packageMap.get(packageSlug))
              .filter((item): item is NonNullable<typeof item> => Boolean(item));

            return (
              <SolutionStory
                key={segment.id}
                segment={segment}
                capabilities={capabilities}
                packages={packages}
                inverted={index % 2 === 1}
              />
            );
          })}
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[1fr_420px] xl:items-start">
          <CtaBand
            eyebrow="Следующий шаг"
            title="Соберем демонстрацию под ваш формат работы и текущий масштаб компании"
            description="Если у вас смешанный сценарий, несколько ролей или переход к группе компаний, покажем оптимальный маршрут запуска и выделим приоритетный контур."
            actions={[
              { label: 'Перейти к пакетам', href: marketingPaths.pricing, primary: true },
              { label: 'О продукте', href: marketingPaths.about },
            ]}
            tone="light"
          />
          <ContactForm variant="compact" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default SolutionsPage;
