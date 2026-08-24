import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AutocompleteInput, { AutocompleteOption } from './AutocompleteInput';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

const Harness = ({ onSearch, isLoading = false }: {
  onSearch: (query: string) => Promise<AutocompleteOption[]>;
  isLoading?: boolean;
}) => {
  const [value, setValue] = useState('');

  return (
    <>
      <label htmlFor="organization">Организация</label>
      <AutocompleteInput
        id="organization"
        value={value}
        onChange={setValue}
        onSearch={onSearch}
        placeholder="Начните ввод"
        isLoading={isLoading}
      />
    </>
  );
};

afterEach(() => {
  vi.useRealTimers();
});

describe('AutocompleteInput', () => {
  it('debounces search and exposes an operable ARIA combobox', async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn().mockResolvedValue([
      { value: 'ООО МОСТ', label: 'ООО МОСТ' },
      { value: 'АО МОСТ', label: 'АО МОСТ' },
    ]);
    render(<Harness onSearch={onSearch} />);
    const input = screen.getByRole('combobox', { name: 'Организация' });

    fireEvent.change(input, { target: { value: 'О' } });
    fireEvent.change(input, { target: { value: 'ОО' } });
    fireEvent.change(input, { target: { value: 'ООО МОСТ' } });
    expect(onSearch).not.toHaveBeenCalled();

    await act(async () => vi.advanceTimersByTime(300));
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('ООО МОСТ');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toHaveAttribute('id', 'organization-listbox');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', 'organization-option-0');
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input).toHaveValue('ООО МОСТ');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('ignores stale responses and announces a recoverable lookup error', async () => {
    vi.useFakeTimers();
    const first = deferred<AutocompleteOption[]>();
    const second = deferred<AutocompleteOption[]>();
    const onSearch = vi.fn((query: string) => query === 'Первая' ? first.promise : second.promise);
    const { rerender } = render(<Harness onSearch={onSearch} isLoading />);
    const input = screen.getByRole('combobox', { name: 'Организация' });

    expect(screen.getByRole('status')).toHaveTextContent('Загрузка подсказок');
    fireEvent.change(input, { target: { value: 'Первая' } });
    await act(async () => vi.advanceTimersByTime(300));
    fireEvent.change(input, { target: { value: 'Вторая' } });
    await act(async () => vi.advanceTimersByTime(300));
    await act(async () => second.resolve([{ value: 'Вторая', label: 'Вторая' }]));
    await act(async () => first.resolve([{ value: 'Первая', label: 'Первая' }]));

    expect(screen.getByRole('option', { name: 'Вторая' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Первая' })).not.toBeInTheDocument();

    const failingSearch = vi.fn().mockRejectedValue(new Error('Load failed'));
    rerender(<Harness onSearch={failingSearch} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Ошибка' } });
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Подсказки временно недоступны. Введите данные вручную.',
    );
  });
});
