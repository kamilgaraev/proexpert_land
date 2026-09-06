import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnboardingWizard } from './OnboardingWizard';

const api = vi.hoisted(() => ({
  fetchProfile: vi.fn(), fetchAvailableCapabilities: vi.fn(), updateCapabilities: vi.fn(), updateBusinessType: vi.fn(),
  updateSpecializations: vi.fn(), updateCertifications: vi.fn(), completeOnboarding: vi.fn(),
}));
const initialState = vi.hoisted(() => ({ profile: { capabilities: [] as string[], primary_business_type: null as string | null, specializations: [] as string[], certifications: [] as string[] } as { capabilities: string[]; primary_business_type: string | null; specializations: string[]; certifications: string[] } | null }));
vi.mock('@/hooks/useOrganizationProfile', () => ({ useOrganizationProfile: () => ({
  ...api, profile: initialState.profile, availableCapabilities: [{ key: 'general_contracting' }],
}) }));
vi.mock('../organization/CapabilitiesSelector', () => ({ CapabilitiesSelector: ({ selectedCapabilities, onChange }: { selectedCapabilities: string[]; onChange: (value: string[]) => void }) => (
  <label><input type="checkbox" checked={selectedCapabilities.includes('general_contracting')} onChange={event => onChange(event.target.checked ? ['general_contracting'] : [])} />Генеральный подряд</label>
) }));
vi.mock('../organization/BusinessTypeSelector', () => ({ BusinessTypeSelector: () => <div>Выбор основного режима</div> }));
vi.mock('../organization/SpecializationsSelector', () => ({ SpecializationsSelector: () => null }));
vi.mock('../organization/CertificationsList', () => ({ CertificationsList: () => null }));
vi.mock('../organization/WorkspaceQuickActionsCard', () => ({ WorkspaceQuickActionsCard: () => null }));
vi.mock('../organization/RecommendedPackagesCard', () => ({ RecommendedPackagesCard: () => null }));

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    initialState.profile = { capabilities: [], primary_business_type: null, specializations: [], certifications: [] };
    api.fetchProfile.mockResolvedValue(undefined);
    api.fetchAvailableCapabilities.mockResolvedValue(undefined);
    api.updateCapabilities.mockResolvedValue(undefined);
    api.updateSpecializations.mockResolvedValue(undefined);
    api.updateCertifications.mockResolvedValue(undefined);
  });

  it('keeps the selected direction after a save error and proceeds only after a successful retry', async () => {
    api.updateCapabilities.mockRejectedValueOnce(new Error('Internal failure'));
    render(<OnboardingWizard onComplete={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Далее' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    expect(screen.getByRole('button', { name: 'Далее' })).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Генеральный подряд' }));
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось сохранить'));
    expect(screen.getByRole('checkbox', { name: 'Генеральный подряд' })).toBeChecked();
    expect(screen.queryByText('Internal failure')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Основной режим работы' })).toBeInTheDocument());
    expect(api.updateCapabilities).toHaveBeenCalledTimes(2);
    expect(api.updateCapabilities).toHaveBeenLastCalledWith(['general_contracting']);
    fireEvent.click(screen.getByRole('button', { name: /Назад/ }));
    expect(screen.getByRole('checkbox', { name: 'Генеральный подряд' })).toBeChecked();
  });

  it('completes only after the server accepts the last step and allows retry after rejection', async () => {
    api.updateBusinessType.mockResolvedValue(undefined);
    api.completeOnboarding.mockRejectedValueOnce(new Error('Internal failure')).mockResolvedValueOnce(undefined);
    const onComplete = vi.fn();
    render(<OnboardingWizard onComplete={onComplete} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Далее' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Генеральный подряд' }));
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Основной режим работы' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Специализации' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Сертификаты и допуски' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Начать работу' })).toBeInTheDocument());
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Начать работу' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось сохранить'));
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Начать работу' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith('/dashboard'));
    expect(api.completeOnboarding).toHaveBeenCalledTimes(2);
    expect(api.updateSpecializations).toHaveBeenCalledWith([]);
    expect(api.updateCertifications).toHaveBeenCalledWith([]);
  });

  it('loads the existing profile once without overwriting local choices on refresh', async () => {
    initialState.profile = { capabilities: ['general_contracting'], primary_business_type: 'general_contracting', specializations: ['Строительство'], certifications: ['СРО'] };
    const view = render(<OnboardingWizard onComplete={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Далее' })).toBeEnabled());
    expect(api.fetchProfile).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    expect(screen.getByRole('checkbox', { name: 'Генеральный подряд' })).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Генеральный подряд' }));
    initialState.profile = { ...initialState.profile };
    view.rerender(<OnboardingWizard onComplete={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Генеральный подряд' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Далее' })).toBeDisabled();
  });

  it('blocks the wizard until the profile loads and retries without saving', async () => {
    initialState.profile = null;
    render(<OnboardingWizard onComplete={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось загрузить'));
    expect(screen.getByRole('button', { name: 'Далее' })).toBeDisabled();
    api.fetchProfile.mockImplementationOnce(async () => {
      initialState.profile = { capabilities: [], primary_business_type: null, specializations: [], certifications: [] };
    });
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Далее' })).toBeEnabled());
    expect(api.fetchProfile).toHaveBeenCalledTimes(2);
    expect(api.updateCapabilities).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('prevents reset and duplicate submission while a step is saving', async () => {
    api.updateCapabilities.mockReturnValue(new Promise(() => undefined));
    render(<OnboardingWizard onComplete={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Далее' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Генеральный подряд' }));
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    expect(screen.getByRole('button', { name: 'Сбросить' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Далее' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    expect(api.updateCapabilities).toHaveBeenCalledTimes(1);
  });
});
