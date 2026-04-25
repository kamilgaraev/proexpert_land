// @vitest-environment happy-dom

import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import VerifyEmailPage from './VerifyEmailPage';

const fetchUserMock = vi.fn();
const verifyEmailMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 61,
      email: 'owner@example.test',
      email_verified_at: null,
    },
    isLoading: false,
    fetchUser: fetchUserMock,
  }),
}));

vi.mock('@/hooks/useEmailVerification', () => ({
  useEmailVerification: () => ({
    verifyEmail: verifyEmailMock,
    loading: false,
  }),
}));

describe('VerifyEmailPage', () => {
  it('refreshes authenticated user after successful email verification', async () => {
    verifyEmailMock.mockResolvedValue({
      success: true,
      message: 'Email успешно подтвержден',
    });

    render(
      <MemoryRouter initialEntries={['/verify-email?id=61&hash=hash&expires=1777117379&signature=signature']}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(verifyEmailMock).toHaveBeenCalledWith('61', 'hash', '1777117379', 'signature');
    });

    await waitFor(() => {
      expect(fetchUserMock).toHaveBeenCalledTimes(1);
    });
  });
});
