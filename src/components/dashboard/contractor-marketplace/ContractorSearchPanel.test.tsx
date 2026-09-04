import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContractorSearchPanel from './ContractorSearchPanel';

const searchContractors = vi.hoisted(() => vi.fn());
vi.mock('@/utils/contractorMarketplaceApi', () => ({ default: { searchContractors } }));
vi.mock('./HiringOfferDialog', () => ({ default: () => null }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const emptyResponse = { data: [], meta: { total: 0, current_page: 1, last_page: 1 }, summary: { network_size: 5 } };

beforeEach(() => {
  searchContractors.mockReset().mockResolvedValue(emptyResponse);
});

describe('Поиск подрядчиков', () => {
  it('не превращает отсутствие оценок в нулевой рейтинг', async () => {
    searchContractors.mockResolvedValue({ ...emptyResponse, data: [{ id: 1, display_name: 'Монолит', category_rating: null }] });
    render(<ContractorSearchPanel categories={[]} canCreateOffer={false} />);
    expect(await screen.findByText('Нет оценок')).toBeInTheDocument();
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });
  it('применяет основные и свёрнутые уточняющие поля одной отправкой формы', async () => {
    render(<ContractorSearchPanel categories={[]} canCreateOffer={false} />);
    await waitFor(() => expect(searchContractors).toHaveBeenCalledTimes(1));
    await screen.findByText('По этим условиям никого не нашли');
    fireEvent.change(screen.getByLabelText('Название или специализация'), { target: { value: 'Монолит' } });
    fireEvent.change(screen.getByLabelText('Город'), { target: { value: 'Казань' } });
    const details = screen.getByText('Уточнить поиск').closest('details')!;
    fireEvent.click(details.querySelector('summary')!);
    fireEvent.change(screen.getByLabelText('Рейтинг от'), { target: { value: '4.5' } });
    fireEvent.click(details.querySelector('summary')!);
    fireEvent.submit(screen.getByRole('form', { name: 'Поиск подрядчиков' }));
    await waitFor(() => expect(searchContractors).toHaveBeenLastCalledWith({
      search: 'Монолит', city: 'Казань', min_rating: 4.5, sort_by: 'relevance', page: 1, per_page: 12,
    }));
    fireEvent.click(await screen.findByRole('button', { name: 'Сбросить фильтры' }));
    await waitFor(() => expect(searchContractors).toHaveBeenLastCalledWith({ sort_by: 'relevance', page: 1, per_page: 12 }));
    expect(screen.getByLabelText('Город')).toHaveValue('');
    expect(screen.getByLabelText('Рейтинг от')).toHaveValue(null);
  });

  it('раскрывает скрытое поле с ошибкой ввода', async () => {
    render(<ContractorSearchPanel categories={[]} canCreateOffer={false} />);
    await screen.findByText('По этим условиям никого не нашли');
    const rating = screen.getByLabelText('Рейтинг от');
    const details = rating.closest('details')!;
    expect(details.open).toBe(false);
    fireEvent.change(rating, { target: { value: '6' } });
    fireEvent.invalid(rating);
    expect(details.open).toBe(true);
    expect(searchContractors).toHaveBeenCalledTimes(1);
  });

  it('отличает пустой каталог от отсутствия совпадений', async () => {
    searchContractors.mockResolvedValue({ ...emptyResponse, summary: { network_size: 0 } });
    render(<ContractorSearchPanel categories={[]} canCreateOffer={false} />);
    expect(await screen.findByText('В каталоге пока нет подрядчиков')).toBeInTheDocument();
    expect(screen.queryByText('По этим условиям никого не нашли')).not.toBeInTheDocument();
  });

  it('не выдаёт ошибку загрузки за пустой результат и позволяет повторить поиск', async () => {
    searchContractors.mockRejectedValueOnce(new Error('offline'));
    render(<ContractorSearchPanel categories={[]} canCreateOffer={false} />);
    const retry = await screen.findByRole('button', { name: 'Повторить поиск' });
    expect(screen.queryByText('По этим условиям никого не нашли')).not.toBeInTheDocument();
    fireEvent.click(retry);
    expect(await screen.findByText('По этим условиям никого не нашли')).toBeInTheDocument();
    expect(searchContractors).toHaveBeenCalledTimes(2);
  });
});
