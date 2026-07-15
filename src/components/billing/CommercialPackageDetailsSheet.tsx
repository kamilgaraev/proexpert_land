import { CheckCircle2, Layers3 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { CommercialPackage } from '@/types/commercialBilling';

type CommercialPackageDetailsSheetProps = {
  packageItem: CommercialPackage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formatMoney = (minor: number, currency: string) => new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(minor / 100);

export const CommercialPackageDetailsSheet = ({
  packageItem,
  open,
  onOpenChange,
}: CommercialPackageDetailsSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="w-full overflow-y-auto border-slate-200 p-0 sm:max-w-2xl">
      {packageItem && (
        <div className="min-h-full bg-slate-50">
          <SheetHeader className="border-b border-slate-200 bg-white px-6 py-8 pr-14 sm:px-8">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-600">
              <Layers3 className="h-4 w-4" />
              Пакет возможностей
            </div>
            <SheetTitle className="text-3xl tracking-tight text-slate-950">{packageItem.name}</SheetTitle>
            <SheetDescription className="max-w-xl text-base leading-7 text-slate-600">
              {packageItem.description}
            </SheetDescription>
            <div className="pt-3 text-2xl font-semibold text-slate-950">
              {formatMoney(packageItem.priceMinor, packageItem.currency)}
              <span className="ml-2 text-sm font-normal text-slate-500">за 30 дней</span>
            </div>
          </SheetHeader>

          <div className="space-y-8 px-6 py-8 sm:px-8">
            {packageItem.businessOutcomes.length > 0 && (
              <section aria-labelledby="package-results-title">
                <h3 id="package-results-title" className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Что получает команда
                </h3>
                <ul className="mt-4 space-y-3">
                  {packageItem.businessOutcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="package-modules-title">
              <div className="flex items-end justify-between gap-4">
                <h3 id="package-modules-title" className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Что входит
                </h3>
                <span className="text-sm text-slate-500">{packageItem.modules.length} возможностей</span>
              </div>
              <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {packageItem.modules.map((module) => (
                  <div key={module.slug} className="p-5">
                    <h4 className="font-semibold text-slate-950">{module.name}</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{module.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </SheetContent>
  </Sheet>
);
