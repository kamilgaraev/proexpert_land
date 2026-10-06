import { Link } from 'react-router-dom';
import { LEGAL_VERSION } from '@/data/marketing/legal';

export interface OrganizationLegalChoice {
  terms: boolean;
  processing: boolean;
  authority: boolean;
}

export const emptyLegalChoice: OrganizationLegalChoice = { terms: false, processing: false, authority: false };
export const allLegalChoices = (choice: OrganizationLegalChoice) => choice.terms && choice.processing && choice.authority;

export const OrganizationLegalAcceptance = ({ value, onChange }: { value: OrganizationLegalChoice; onChange: (value: OrganizationLegalChoice) => void }) => (
  <fieldset className="space-y-3 text-sm">
    <legend className="mb-2 font-medium">Документы организации, редакция {LEGAL_VERSION}</legend>
    <label className="flex items-start gap-3"><input type="checkbox" checked={value.terms} onChange={(event) => onChange({ ...value, terms: event.target.checked })} /><span>От имени организации принимаю <Link to="/offer" target="_blank" className="underline">договор использования МОСТ</Link>.</span></label>
    <label className="flex items-start gap-3"><input type="checkbox" checked={value.processing} onChange={(event) => onChange({ ...value, processing: event.target.checked })} /><span>От имени оператора выдаю <Link to="/data-processing" target="_blank" className="underline">поручение на обработку ПДн</Link> и подтверждаю законность передаваемых данных.</span></label>
    <label className="flex items-start gap-3"><input type="checkbox" checked={value.authority} onChange={(event) => onChange({ ...value, authority: event.target.checked })} /><span>Подтверждаю полномочия заключить договор и выдать поручение от имени указанной организации.</span></label>
    <p className="text-xs text-muted-foreground"><Link to="/privacy" target="_blank" className="underline">Политика обработки персональных данных</Link> объясняет собственные цели МОСТ. Это уведомление, а не согласие на рекламу или обработку всех данных организации.</p>
  </fieldset>
);
