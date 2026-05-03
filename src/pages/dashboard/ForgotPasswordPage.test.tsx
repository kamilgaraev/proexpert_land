import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import ForgotPasswordPage from './ForgotPasswordPage';
import { authService } from '@utils/api';

vi.mock('@utils/api', () => ({
  authService: {
    requestPasswordReset: vi.fn(),
  },
}));

const requestPasswordResetMock = vi.mocked(authService.requestPasswordReset);

const renderPage = () => render(
  <MemoryRouter>
    <ForgotPasswordPage />
  </MemoryRouter>
);

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    requestPasswordResetMock.mockReset();
  });

  it('sends password reset request through auth service', async () => {
    requestPasswordResetMock.mockResolvedValue({
      data: { success: true, message: '', data: null },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as Awaited<ReturnType<typeof authService.requestPasswordReset>>);
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'owner@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /отправить инструкции/i }));

    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledWith('owner@example.com');
    });
  });

  it('does not call API when email is invalid', async () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /отправить инструкции/i }));

    expect(requestPasswordResetMock).not.toHaveBeenCalled();
  });
});
