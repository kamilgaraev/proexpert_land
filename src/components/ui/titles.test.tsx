import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardTitle } from './card';
import { AlertTitle } from './alert';

describe('Семантика заголовков дизайн-системы', () => {
  it('сохраняет прежние уровни по умолчанию', () => {
    render(<><CardTitle>Карточка</CardTitle><AlertTitle>Сообщение</AlertTitle></>);
    expect(screen.getByRole('heading', { level: 3, name: 'Карточка' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 5, name: 'Сообщение' })).toBeTruthy();
  });

  it('поддерживает уровень раздела и сообщение без лишнего заголовка', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(<><CardTitle as="h2" ref={ref}>Раздел</CardTitle><AlertTitle as="p">Готово</AlertTitle></>);
    expect(ref.current).toBe(screen.getByRole('heading', { level: 2, name: 'Раздел' }));
    expect(screen.queryByRole('heading', { name: 'Готово' })).toBeNull();
    expect(screen.getByText('Готово').tagName).toBe('P');
  });
});
