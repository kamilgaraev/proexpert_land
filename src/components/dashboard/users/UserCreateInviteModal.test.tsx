import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserCreateInviteModal from './UserCreateInviteModal';

const api = vi.hoisted(() => ({
  fetchRoles: vi.fn().mockResolvedValue(undefined),
  fetchCustomRoles: vi.fn().mockResolvedValue(undefined),
  createUserWithCustomRoles: vi.fn(),
  sendInvitation: vi.fn(),
}));
vi.mock('@/hooks/useUserManagement', () => ({ useUserManagement: () => ({ roles: [], ...api }) }));
vi.mock('@/hooks/useCustomRoles', () => ({
  useCustomRoles: () => ({
    customRoles: [{ id: 41, slug: 'site-supervisor', name: 'Прораб' }],
    fetchCustomRoles: api.fetchCustomRoles,
  }),
}));
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  api.createUserWithCustomRoles.mockResolvedValue({ data: { user: { id: 12, email_verified_at: null } } });
});

it('диалог имеет название и закрывается по Escape до отправки', async () => {
  const onClose = vi.fn();
  render(<UserCreateInviteModal isOpen onSave={vi.fn()} onClose={onClose} />);
  const dialog = screen.getByRole('dialog', { name: 'Пригласить сотрудника' });
  expect(dialog).toHaveAccessibleDescription('Укажите рабочую почту и выберите роли сотрудника в компании.');
  await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  fireEvent.keyDown(dialog, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(api.sendInvitation).not.toHaveBeenCalled();
});

it.each(['Готово', 'Закрыть'])('после создания действие %s обновляет список вместо повторной отправки', async label => {
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(<UserCreateInviteModal isOpen canInvite={false} onSave={onSave} onClose={onClose} />);
  fireEvent.change(screen.getByLabelText('Имя *'), { target: { value: 'Анна' } });
  fireEvent.change(screen.getByLabelText('Рабочая почта *'), { target: { value: 'anna@example.test' } });
  fireEvent.click(screen.getByRole('button', { name: 'Создать' }));
  expect(await screen.findByText('Сотрудник добавлен')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Создать' })).not.toBeInTheDocument();
  expect(screen.getByLabelText('Имя *')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Создать напрямую' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: label }));
  expect(onSave).toHaveBeenCalledTimes(1);
  expect(onClose).not.toHaveBeenCalled();
  expect(api.createUserWithCustomRoles).toHaveBeenCalledTimes(1);
});

it('передаёт выбранную роль компании в приглашение', async () => {
  api.sendInvitation.mockResolvedValue({ data: { success: true } });
  render(<UserCreateInviteModal isOpen onSave={vi.fn()} onClose={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('Имя *'), { target: { value: 'Анна' } });
  fireEvent.change(screen.getByLabelText('Рабочая почта *'), { target: { value: 'ANNA@example.test' } });
  fireEvent.click(screen.getByText('Прораб'));
  fireEvent.click(screen.getByRole('button', { name: 'Отправить' }));
  await waitFor(() => expect(api.sendInvitation).toHaveBeenCalledWith({
    name: 'Анна',
    email: 'anna@example.test',
    role_slugs: [],
    custom_role_ids: [41],
    metadata: {},
  }));
});

it('не отправляет второй запрос пока создание не завершилось', async () => {
  let resolve!: (value: unknown) => void;
  api.createUserWithCustomRoles.mockReturnValue(new Promise(done => { resolve = done; }));
  const onClose = vi.fn();
  render(<UserCreateInviteModal isOpen canInvite={false} onSave={vi.fn()} onClose={onClose} />);
  const create = screen.getByRole('button', { name: 'Создать' });
  fireEvent.click(create);
  fireEvent.click(create);
  expect(api.createUserWithCustomRoles).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Рабочая почта *')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть диалог' }));
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();
  resolve({ data: { user: { id: 12, email_verified_at: null } } });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Готово' })).toBeEnabled());
});
