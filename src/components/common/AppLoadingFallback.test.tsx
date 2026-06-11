// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppLoadingFallback } from './AppLoadingFallback';
import { reloadWithCacheBust } from '@/utils/preloadRecovery';

vi.mock('@/utils/preloadRecovery', async () => {
  const actual = await vi.importActual<typeof import('@/utils/preloadRecovery')>('@/utils/preloadRecovery');

  return {
    ...actual,
    reloadWithCacheBust: vi.fn(),
  };
});

describe('AppLoadingFallback', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(reloadWithCacheBust).mockClear();
  });

  it('shows recovery action when loading takes too long', async () => {
    vi.useFakeTimers();

    render(<AppLoadingFallback slowAfterMs={1_000} />);

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Обновить страницу' })).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });

    const reloadButton = screen.getByRole('button', { name: 'Обновить страницу' });
    expect(screen.getByText(/Загрузка заняла больше обычного/)).toBeInTheDocument();

    fireEvent.click(reloadButton);

    expect(reloadWithCacheBust).toHaveBeenCalledTimes(1);
  });
});
