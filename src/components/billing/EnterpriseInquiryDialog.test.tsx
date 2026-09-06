import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnterpriseInquiryDialog } from './EnterpriseInquiryDialog';

const createEnterpriseInquiry = vi.hoisted(() => vi.fn());
vi.mock('@/services/enterpriseInquiryService', () => ({ createEnterpriseInquiry }));

function Harness() {
  const [open, setOpen] = useState(false);
  return <>
    <button onClick={() => setOpen(true)}>Обсудить подключение</button>
    <EnterpriseInquiryDialog open={open} onOpenChange={setOpen} />
  </>;
}

async function openDialog() {
  const trigger = screen.getByRole('button', { name: 'Обсудить подключение' });
  trigger.focus();
  fireEvent.click(trigger);
  await waitFor(() => expect(screen.getByLabelText('Телефон для связи')).toHaveFocus());
  return trigger;
}

beforeEach(() => createEnterpriseInquiry.mockReset().mockResolvedValue({}));

describe('Корпоративное подключение', () => {
  it.each(['Отмена', 'Escape', 'Закрыть диалог'])('возвращает фокус после %s при повторных открытиях', async (action) => {
    render(<Harness />);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const trigger = await openDialog();
      if (action === 'Escape') {
        fireEvent.keyDown(screen.getByLabelText('Телефон для связи'), { key: 'Escape' });
      } else {
        fireEvent.click(screen.getByRole('button', { name: action }));
      }
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    }
    expect(createEnterpriseInquiry).not.toHaveBeenCalled();
  });

  it('возвращает фокус после подтверждения успешной отправки', async () => {
    render(<Harness />);
    const trigger = await openDialog();
    fireEvent.change(screen.getByLabelText('Телефон для связи'), { target: { value: '+7 900 000-00-00' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Особые правила доступа' }));
    fireEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Готово' }));
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(createEnterpriseInquiry).toHaveBeenCalledTimes(1);
  });
});
