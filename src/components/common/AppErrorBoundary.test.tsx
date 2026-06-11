// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';
import { reloadWithCacheBust } from '@/utils/preloadRecovery';

vi.mock('@/utils/preloadRecovery', async () => {
  const actual = await vi.importActual<typeof import('@/utils/preloadRecovery')>('@/utils/preloadRecovery');

  return {
    ...actual,
    reloadWithCacheBust: vi.fn(),
  };
});

const ThrowError = ({ error }: { error: Error }) => {
  throw error;
};

describe('AppErrorBoundary', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
    vi.mocked(reloadWithCacheBust).mockClear();
  });

  it('shows recovery text for lazy chunk loading failures', () => {
    render(
      <AppErrorBoundary>
        <ThrowError error={new Error('Failed to fetch dynamically imported module')} />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Кабинет обновился')).toBeInTheDocument();
    expect(screen.getByText(/Обновите страницу, чтобы продолжить работу/)).toBeInTheDocument();
  });

  it('shows generic recovery text for render failures', () => {
    render(
      <AppErrorBoundary>
        <ThrowError error={new Error('Unexpected render failure')} />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Раздел не открылся')).toBeInTheDocument();
    expect(screen.getByText(/вернитесь в кабинет/)).toBeInTheDocument();
  });

  it('reloads current page with cache busting from recovery action', () => {
    render(
      <AppErrorBoundary>
        <ThrowError error={new Error('Loading chunk 42 failed')} />
      </AppErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Обновить' }));

    expect(reloadWithCacheBust).toHaveBeenCalledTimes(1);
  });
});
