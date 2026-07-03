// @vitest-environment happy-dom

import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VerifyEmailPage from './VerifyEmailPage';

const mocks = vi.hoisted(() => ({
  authUser: {
    id: 61,
    email: 'owner@example.test',
    email_verified_at: null as string | null,
  },
  fetchUserMock: vi.fn(),
  verifyEmailMock: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mocks.authUser,
    isLoading: false,
    fetchUser: mocks.fetchUserMock,
  }),
}));

vi.mock('@/hooks/useEmailVerification', () => ({
  useEmailVerification: () => ({
    verifyEmail: mocks.verifyEmailMock,
    loading: false,
  }),
}));

const renderVerifyEmailPage = () => (
  <MemoryRouter initialEntries={['/verify-email?id=61&hash=hash&expires=1777117379&signature=signature']}>
    <Routes>
      <Route path="/verify-email" element={<VerifyEmailPage />} />
    </Routes>
  </MemoryRouter>
);

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    mocks.authUser = {
      id: 61,
      email: 'owner@example.test',
      email_verified_at: null,
    };
    mocks.fetchUserMock.mockReset();
    mocks.verifyEmailMock.mockReset();
  });

  it('refreshes authenticated user after successful email verification', async () => {
    mocks.verifyEmailMock.mockResolvedValue({
      success: true,
      message: 'Email подтвержден',
    });

    render(renderVerifyEmailPage());

    await waitFor(() => {
      expect(mocks.verifyEmailMock).toHaveBeenCalledWith('61', 'hash', '1777117379', 'signature');
    });

    await waitFor(() => {
      expect(mocks.fetchUserMock).toHaveBeenCalledTimes(1);
    });
  });

  it('does not verify the same signed link again after user refresh changes auth state', async () => {
    mocks.verifyEmailMock.mockResolvedValue({
      success: true,
      message: 'Email подтвержден',
    });
    mocks.fetchUserMock.mockImplementation(async () => {
      mocks.authUser = {
        ...mocks.authUser,
        email_verified_at: '2026-07-03T18:00:00.000000Z',
      };
    });

    const { rerender } = render(renderVerifyEmailPage());

    await waitFor(() => {
      expect(mocks.fetchUserMock).toHaveBeenCalledTimes(1);
    });

    rerender(renderVerifyEmailPage());

    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });

    expect(mocks.verifyEmailMock).toHaveBeenCalledTimes(1);
    expect(mocks.fetchUserMock).toHaveBeenCalledTimes(1);
  });
});
