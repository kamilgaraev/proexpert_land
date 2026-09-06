import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VerificationRecommendations as Recommendations } from '@utils/api';
import VerificationRecommendations from './VerificationRecommendations';

const { getRecommendations } = vi.hoisted(() => ({ getRecommendations: vi.fn() }));
vi.mock('@utils/api', () => ({
  organizationService: { getVerificationRecommendations: getRecommendations },
}));

const recommendations = (overrides: Partial<Recommendations> = {}): Recommendations => ({
  current_score: 100,
  max_score: 100,
  status: 'pending',
  status_text: 'Ожидает проверки',
  missing_fields: [],
  field_issues: [],
  verification_issues: [],
  can_auto_verify: true,
  potential_score_increase: 0,
  needs_verification: true,
  ...overrides,
});

const load = (data: Recommendations) => getRecommendations.mockResolvedValue({
  success: true,
  data: { recommendations: data, user_message: { type: 'info', title: '', message: '', action: null } },
});

describe('VerificationRecommendations status', () => {
  beforeEach(() => vi.resetAllMocks());

  it('does not treat a full basic score as completed verification', async () => {
    load(recommendations());
    const verify = vi.fn();
    render(<VerificationRecommendations onVerificationRequest={verify} />);
    expect(await screen.findByText('Основные данные заполнены. Проверка ещё не завершена.')).toBeInTheDocument();
    expect(screen.queryByText(/Проверка организации завершена/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Проверить данные организации' }));
    expect(verify).toHaveBeenCalledOnce();
  });

  it('uses the verified status instead of requiring a score of exactly 100', async () => {
    load(recommendations({ current_score: 95, status: 'verified', needs_verification: false }));
    render(<VerificationRecommendations />);
    expect(await screen.findByText('Проверка организации завершена. По текущим результатам замечаний нет.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/государственные реестры/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Статус верификации', level: 2 })).toBeInTheDocument();
  });

  it('does not hide reported issues behind a full score', async () => {
    load(recommendations({
      status: 'verified', needs_verification: false,
      verification_issues: [{ type: 'warning', message: 'Нужно уточнить адрес', severity: 'medium' }],
    }));
    render(<VerificationRecommendations />);
    expect(await screen.findByText('Нужно уточнить адрес')).toBeInTheDocument();
    expect(screen.queryByText(/По текущим результатам замечаний нет/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Замечания по верификации', level: 3 })).toBeInTheDocument();
  });

  it('keeps the verification action disabled during an active request', async () => {
    load(recommendations());
    const verify = vi.fn();
    render(<VerificationRecommendations onVerificationRequest={verify} isVerifying />);
    const button = await screen.findByRole('button', { name: 'Выполняется верификация...' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(verify).not.toHaveBeenCalled();
  });

  it('retains the manual verification path when automatic verification is unavailable', async () => {
    load(recommendations({ can_auto_verify: false }));
    const verify = vi.fn();
    render(<VerificationRecommendations onVerificationRequest={verify} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Запустить верификацию данных' }));
    expect(verify).toHaveBeenCalledOnce();
  });
});
