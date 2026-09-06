import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnboardingWizard } from './OnboardingWizard';

const api = vi.hoisted(() => ({
  fetchAvailableCapabilities: vi.fn(), updateCapabilities: vi.fn(), updateBusinessType: vi.fn(),
  updateSpecializations: vi.fn(), updateCertifications: vi.fn(), completeOnboarding: vi.fn(),
}));
vi.mock('@/hooks/useOrganizationProfile', () => ({ useOrganizationProfile: () => ({
  ...api, profile: null, availableCapabilities: [],
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
    vi.clearAllMocks();
    api.updateCapabilities.mockResolvedValue(undefined);
  });

  it('keeps the selected direction after a save error and proceeds only after a successful retry', async () => {
    api.updateCapabilities.mockRejectedValueOnce(new Error('Internal failure'));
    render(<OnboardingWizard onComplete={vi.fn()} />);
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
  });

  it('prevents reset and duplicate submission while a step is saving', () => {
    api.updateCapabilities.mockReturnValue(new Promise(() => undefined));
    render(<OnboardingWizard onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Генеральный подряд' }));
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    expect(screen.getByRole('button', { name: 'Сбросить' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Далее' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    expect(api.updateCapabilities).toHaveBeenCalledTimes(1);
  });
});
