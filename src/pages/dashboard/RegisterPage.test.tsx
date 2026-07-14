import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { commercialIntentStorageKey } from '@/utils/commercialIntent';
import RegisterPage from './RegisterPage';

const registerMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    register: registerMock,
  }),
}));

vi.mock('@/hooks/useDaData', () => ({
  default: () => ({
    searchAddresses: vi.fn().mockResolvedValue([]),
    searchCities: vi.fn().mockResolvedValue([]),
    searchOrganizations: vi.fn().mockResolvedValue([]),
    isLoading: false,
  }),
}));

const renderPage = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </MemoryRouter>,
  );

const submitValidRegistration = async () => {
  fireEvent.change(screen.getByLabelText('Полное имя'), { target: { value: 'Иван Иванов' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ivan@example.com' } });
  fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'Password1' } });
  fireEvent.change(screen.getByLabelText('Подтверждение пароля'), { target: { value: 'Password1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Далее' }));

  const organizationInput = await screen.findByPlaceholderText('ООО СтройКомплект');
  fireEvent.change(organizationInput, { target: { value: 'ООО Мост' } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Создать аккаунт' }));
};

describe('RegisterPage', () => {
  beforeEach(() => {
    registerMock.mockReset();
    window.sessionStorage.clear();
  });

  it('показывает выбранные бизнес-пакеты без старого тарифа', () => {
    renderPage('/register?packages=projects-processes,machinery');

    expect(screen.getByText('Сохранен набор из 2 пакета')).toBeInTheDocument();
    expect(screen.queryByText(/тариф Business/i)).not.toBeInTheDocument();
  });

  it('показывает полный комплект и отбрасывает неизвестные значения', () => {
    const { unmount } = renderPage('/register?packages=full-suite');

    expect(screen.getByText('Сохранено намерение подключить полный комплект')).toBeInTheDocument();

    unmount();
    renderPage('/register?packages=unknown');

    expect(screen.queryByText(/Сохранен набор|Сохранено намерение/)).not.toBeInTheDocument();
  });

  it('правильно склоняет количество выбранных пакетов', () => {
    const { unmount } = renderPage('/register?packages=projects-processes');

    expect(screen.getByText('Сохранен набор из 1 пакет')).toBeInTheDocument();

    unmount();
    renderPage('/register?packages=projects-processes,machinery,planning-schedules');

    expect(screen.getByText('Сохранен набор из 3 пакета')).toBeInTheDocument();
  });

  it('сохраняет intent только после успешной регистрации и не передает plan_slug', async () => {
    let resolveRegistration: (() => void) | undefined;
    registerMock.mockReturnValue(new Promise<void>((resolve) => {
      resolveRegistration = resolve;
    }));
    renderPage('/register?packages=projects-processes,machinery');

    await submitValidRegistration();

    await waitFor(() => expect(registerMock).toHaveBeenCalledTimes(1));
    expect(window.sessionStorage.getItem(commercialIntentStorageKey)).toBeNull();
    const formData = registerMock.mock.calls[0][0] as FormData;
    expect(formData.has('plan_slug')).toBe(false);

    resolveRegistration?.();
    await waitFor(() => expect(window.sessionStorage.getItem(commercialIntentStorageKey)).toBe(
      'projects-processes,machinery',
    ));
  });

  it('не сохраняет intent после ошибки регистрации', async () => {
    registerMock.mockRejectedValue(new Error('registration failed'));
    renderPage('/register?packages=machinery');

    await submitValidRegistration();

    await waitFor(() => expect(registerMock).toHaveBeenCalledTimes(1));
    expect(window.sessionStorage.getItem(commercialIntentStorageKey)).toBeNull();
  });

  it('очищает старый intent после успешной бесплатной регистрации', async () => {
    window.sessionStorage.setItem(commercialIntentStorageKey, 'machinery');
    registerMock.mockResolvedValue(undefined);
    renderPage('/register');

    await submitValidRegistration();

    await waitFor(() => expect(registerMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(window.sessionStorage.getItem(commercialIntentStorageKey)).toBeNull());
  });
});
