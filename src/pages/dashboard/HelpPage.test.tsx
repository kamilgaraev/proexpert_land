import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import HelpPage from './HelpPage';

vi.mock('@/components/support/HelpOverview', () => ({ HelpOverview: ({ onTabChange }: { onTabChange: (value: string) => void }) => <button onClick={() => onTabChange('support')}>Написать обращение</button> }));
vi.mock('@/components/support/FaqSection', () => ({ FaqSection: () => <p>Ответы на вопросы</p> }));
vi.mock('@/components/support/ContactForm', () => ({ ContactForm: () => <p>Форма поддержки</p> }));

const setup = (entry: string) => {
  const router = createMemoryRouter([{ path: '/dashboard/help', element: <HelpPage /> }], { initialEntries: [entry] });
  render(<RouterProvider router={router} />);
  return router;
};

describe('HelpPage navigation', () => {
  it('возвращает выбранную вкладку при переходах назад и вперёд', async () => {
    const router = setup('/dashboard/help?tab=overview');
    fireEvent.click(await screen.findByRole('button', { name: 'Написать обращение' }));
    await screen.findByText('Форма поддержки');
    await act(async () => { await router.navigate(-1); });
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Обзор' })).toHaveAttribute('aria-selected', 'true'));
    await act(async () => { await router.navigate(1); });
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Поддержка' })).toHaveAttribute('aria-selected', 'true'));
  });

  it('показывает обзор для неизвестной вкладки', async () => {
    setup('/dashboard/help?tab=unknown');
    expect(await screen.findByRole('button', { name: 'Написать обращение' })).toBeInTheDocument();
  });

  it('сохраняет остальные параметры адреса при выборе раздела', async () => {
    const router = setup('/dashboard/help?source=profile');
    fireEvent.click(await screen.findByRole('button', { name: 'Написать обращение' }));
    await screen.findByText('Форма поддержки');
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get('source')).toBe('profile');
    expect(params.get('tab')).toBe('support');
  });
});
