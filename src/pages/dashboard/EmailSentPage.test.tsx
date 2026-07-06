import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import EmailSentPage from './EmailSentPage';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/email-sent', state: { email: 'owner@example.test' } }]}>
      <Routes>
        <Route path="/email-sent" element={<EmailSentPage />} />
        <Route path="/login" element={<div>Login target</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('EmailSentPage', () => {
  it('keeps registration flow unauthenticated and navigates to login', () => {
    renderPage();

    expect(screen.getByText('owner@example.test')).toBeInTheDocument();
    expect(screen.queryByText('Перейти в личный кабинет')).not.toBeInTheDocument();
    expect(screen.queryByText('Отправить повторно')).not.toBeInTheDocument();
    expect(screen.queryByText(/Автоматический переход/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Перейти ко входу/i }));

    expect(screen.getByText('Login target')).toBeInTheDocument();
  });
});
