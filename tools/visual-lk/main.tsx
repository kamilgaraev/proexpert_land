import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HiringOfferDialog } from '@/components/dashboard/contractor-marketplace/HiringOfferDialog';
import type { MarketplaceContractorProfile } from '@/types/contractor-marketplace';
import '@/index.css';
import '@/styles/workspace.css';

const profile: MarketplaceContractorProfile = {
  id: 1, organization_id: 1, status: 'active', display_name: 'Тестовая строительная компания', short_description: null,
  description: null, team_size_min: null, team_size_max: null, years_on_market: null, base_city: 'Казань',
  service_radius_km: null, availability_status: 'available', available_from: null, verification_level: 'none',
  is_visible_in_marketplace: true, published_at: null, metadata: {}, ratings: [], regions: [],
  categories: [{ category_id: 1, is_primary: true, experience_years: null, team_capacity: null, min_project_budget: null, max_project_budget: null,
    category: { id: 1, parent_id: null, slug: 'building', name: 'Строительно-монтажные работы', type: 'construction', is_active: true, sort_order: 1, children: [] } }],
  portfolio_items: [], documents: [], created_at: null, updated_at: null,
};

function Preview() {
  const [open, setOpen] = useState(true);
  const [result, setResult] = useState('');
  return <main className="most-workspace min-h-screen p-6">
    <h1>Локальная проверка формы МОСТ</h1>
    <button onClick={() => setOpen(true)}>Открыть предложение</button>
    <p role="status">{result}</p>
    <HiringOfferDialog open={open} profile={profile} submitting={false} onClose={() => setOpen(false)}
      onSubmit={async () => { setResult('Тестовая проверка завершена. Данные не отправлялись.'); setOpen(false); }} />
  </main>;
}

createRoot(document.getElementById('root')!).render(<Preview />);
