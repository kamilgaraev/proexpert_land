// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPublicSitePayloadFixture } from '@/test/fixtures/holdingSiteBuilder';
import SiteBuilderRenderer from './SiteBuilderRenderer';

describe('SiteBuilderRenderer', () => {
  afterEach(cleanup);
  beforeEach(() => {
    window.history.replaceState({}, '', '/services?preview=true&token=preview-token');
  });

  it.each(['locale=en', 'lang=en', 'locale=en&lang=en'])('сохраняет публичную локаль %s без закрытого токена', (query) => {
    const payload = createPublicSitePayloadFixture();
    render(<MemoryRouter initialEntries={[`/about?${query}&tracking=discard&token=private-token`]}><SiteBuilderRenderer
      site={payload.site}
      blocks={[]}
      navigation={[{ id: 100, slug: '/', label: 'Главная', page_type: 'home', is_home: true }]}
    /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute('href', `/?${query}`);
    expect(screen.getByRole('link', { name: new RegExp(payload.site.domain) }).getAttribute('href')).toBe(`/?${query}`);
  });

  it('сохраняет язык префикса при переходе по меню', () => {
    const payload = createPublicSitePayloadFixture();
    render(<MemoryRouter initialEntries={['/en/services?lang=ru&token=private']}><SiteBuilderRenderer
      site={payload.site}
      blocks={[]}
      navigation={[{ id: 100, slug: '/', label: 'Главная', page_type: 'home', is_home: true }]}
    /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute('href', '/?locale=en');
  });

  it.each([['/en/', 'Главная'], ['/en/about', 'О компании']])('выделяет текущий пункт для локализованного адреса %s', (pathname, label) => {
    const payload = createPublicSitePayloadFixture();
    render(<MemoryRouter initialEntries={[pathname]}><SiteBuilderRenderer
      site={payload.site}
      blocks={[]}
      navigation={[
        { id: 100, slug: '/', label: 'Главная', page_type: 'home', is_home: true },
        { id: 101, slug: '/about', label: 'О компании', page_type: 'about', is_home: false },
      ]}
    /></MemoryRouter>);
    expect(screen.getByRole('link', { name: label })).toHaveClass('text-white');
  });

  it('рендерит публичную навигацию и сохраняет preview query string в ссылках', () => {
    const payload = createPublicSitePayloadFixture();
    const currentPage = {
      ...payload.current_page!,
      id: 101,
      slug: 'services',
      page_type: 'services' as const,
      title: 'Услуги',
      navigation_label: 'Услуги',
      is_home: false,
    };

    render(
      <MemoryRouter initialEntries={['/services?preview=true&token=preview-token']}>
        <SiteBuilderRenderer
          blocks={currentPage.sections}
          mode="public"
          navigation={[
            {
              id: 100,
              slug: '/',
              label: 'Главная',
              page_type: 'home',
              is_home: true,
            },
            {
              id: currentPage.id,
              slug: currentPage.slug,
              label: currentPage.navigation_label ?? currentPage.title,
              page_type: currentPage.page_type,
              is_home: currentPage.is_home,
            },
          ]}
          page={currentPage}
          site={payload.site}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(payload.site.domain)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute(
      'href',
      '/?preview=true&token=preview-token',
    );
    expect(screen.getByRole('link', { name: 'Услуги' })).toHaveAttribute(
      'href',
      '/services?preview=true&token=preview-token',
    );
  });

  it('в корпоративной теме прокручивает к видимой форме с главной', () => {
    const payload = createPublicSitePayloadFixture();
    const section = payload.current_page!.sections[0];
    const page = {
      ...payload.current_page!,
      sections: [
        { ...section, id: 121, type: 'hero' as const, is_active: false, content: { title: 'Скрытый блок' } },
        { ...section, id: 122, type: 'lead_form' as const, content: { title: 'Заявка на работы' } },
      ],
    };
    render(<MemoryRouter><SiteBuilderRenderer
      page={page}
      site={{ ...payload.site, theme_config: { ...payload.site.theme_config, surface_style: 'corporate' } }}
    /></MemoryRouter>);

    expect(screen.queryByText('Скрытый блок')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Оставить заявку' })).toHaveAttribute('href', '/#lead-form');
    expect(screen.getByRole('heading', { name: 'Заявка на работы' }).closest('section')).toHaveAttribute('id', 'lead-form');
  });

  it('применяет общую палитру и форму кнопок в предпросмотре, сохраняя настройку отдельной кнопки', () => {
    const payload = createPublicSitePayloadFixture();
    const page = payload.current_page!;
    const section = page.sections[0]!;
    const { container } = render(<MemoryRouter initialEntries={['/dashboard/multi-organization/site']}><SiteBuilderRenderer
      mode="editor"
      page={{
        ...page,
        slug: '/services',
        is_home: false,
        sections: [{
          ...section,
          type: 'button',
          content: { button_text: 'Узнать больше', button_url: '/about' },
          style_config: { buttons: { link: { shape: 'square', background: '#ffcc77', width: 65 } } },
        }],
      }}
      navigation={[{ id: page.id, slug: '/services', label: 'Услуги', page_type: 'services', is_home: false }]}
      site={{
        ...payload.site,
        theme_config: {
          ...payload.site.theme_config,
          surface_style: 'corporate',
          palette: { primary: '#294a40', accent: '#f4c56e' },
          button_shape: 'pill',
        },
      }}
    /></MemoryRouter>);

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--holding-primary')).toBe('#294a40');
    expect(root.style.getPropertyValue('--holding-accent')).toBe('#f4c56e');
    expect(root.style.getPropertyValue('--holding-on-primary')).toBe('#ffffff');
    expect(root.style.getPropertyValue('--site-button-radius')).toBe('999px');
    expect(screen.getByRole('link', { name: 'Услуги' })).toHaveAttribute('aria-current', 'page');
    expect(root.querySelector('.holding-section-button .holding-site-button')).toHaveAttribute('data-shape', 'square');
  });

  it('открывает статью из её раздела и сохраняет локаль', () => {
    const payload = createPublicSitePayloadFixture();
    const page = { ...payload.current_page!, slug: '/articles', page_type: 'blog_index' as const, title: 'Статьи' };
    render(<MemoryRouter initialEntries={['/articles?locale=en&token=private']}><SiteBuilderRenderer
      blog={{ articles: [{ id: 123, title: 'Как подготовить объект к отделке', slug: 'prepare-fitout', status: 'published' }] }}
      page={page}
      site={payload.site}
    /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Статьи', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Как подготовить объект к отделке' })).toHaveAttribute('href', '/articles/prepare-fitout?locale=en');
  });

  it('показывает названия статей без переходов в редакторе', () => {
    const payload = createPublicSitePayloadFixture();
    const page = { ...payload.current_page!, slug: '/blog', page_type: 'blog_index' as const, title: 'Статьи' };
    render(<MemoryRouter><SiteBuilderRenderer
      blog={{ articles: [{ id: 123, title: 'План работ', slug: 'work-plan', status: 'published' }] }}
      mode="editor"
      page={page}
      site={payload.site}
    /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'План работ' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'План работ' })).not.toBeInTheDocument();
  });

  it('применяет цвет, форму и ширину отдельной кнопки на опубликованной странице', () => {
    const payload = createPublicSitePayloadFixture();
    const section = {
      ...payload.current_page!.sections[0],
      type: 'button' as const,
      content: { button_text: 'Узнать стоимость', button_url: '/contacts#lead-form' },
      style_config: { buttons: { link: { background: '#efc46a', shape: 'square', width: 72 } } },
    };
    render(<MemoryRouter><SiteBuilderRenderer blocks={[section]} site={payload.site} /></MemoryRouter>);

    const button = screen.getByRole<HTMLAnchorElement>('link', { name: 'Узнать стоимость' });
    expect(button).toHaveAttribute('href', '/contacts#lead-form');
    expect(button).toHaveAttribute('data-shape', 'square');
    expect(button.style.getPropertyValue('--site-button-background')).toBe('#efc46a');
    expect(button.style.getPropertyValue('--site-button-width')).toBe('72%');
  });

  it('в конструкторе выбирает настройку кнопки прикрепления вместо файлового диалога', () => {
    const payload = createPublicSitePayloadFixture();
    const section = { ...payload.current_page!.sections[0], type: 'lead_form' as const };
    const onEditorInteract = vi.fn();
    const { container } = render(<MemoryRouter><SiteBuilderRenderer
      blocks={[section]}
      mode="editor"
      onEditorInteract={onEditorInteract}
      site={payload.site}
    /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Прикрепить файлы' }));
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(onEditorInteract).toHaveBeenCalledOnce();
    expect(onEditorInteract).toHaveBeenCalledWith(expect.objectContaining({
      blockId: section.id, fieldPath: 'style_config.buttons.upload', intent: 'button',
    }));
  });

  it('прикрепляет файлы типовой кнопкой и отправляет оставшиеся после удаления', async () => {
    const payload = createPublicSitePayloadFixture();
    const section = {
      ...payload.current_page!.sections[0],
      type: 'lead_form' as const,
      content: { title: 'Заявка', submit_label: 'Отправить заявку' },
    };
    const onSubmitLead = vi.fn().mockResolvedValue({ id: 1 });
    const { container } = render(<MemoryRouter><SiteBuilderRenderer
      blocks={[section]}
      onSubmitLead={onSubmitLead}
      serviceRequest={{ enabled: true, services: [{ id: 22, name: 'Отделочные работы' }] }}
      site={payload.site}
    /></MemoryRouter>);

    const chooser = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(chooser).toHaveAttribute('hidden');
    const openChooser = vi.spyOn(chooser, 'click');
    fireEvent.click(screen.getByRole('button', { name: 'Прикрепить файлы' }));
    expect(openChooser).toHaveBeenCalledOnce();
    expect(onSubmitLead).not.toHaveBeenCalled();

    const specification = new File(['%PDF'], 'описание.pdf', { type: 'application/pdf' });
    const image = new File(['img'], 'фото.png', { type: 'image/png' });
    fireEvent.change(chooser, { target: { files: [specification] } });
    fireEvent.change(chooser, { target: { files: [image] } });
    fireEvent.change(chooser, { target: { files: [new File(['notes'], 'заметки.txt')] } });
    expect(screen.getByRole('alert')).toHaveTextContent('PDF, JPG или PNG');
    expect(screen.getByRole('list', { name: 'Прикреплённые файлы' })).toHaveTextContent(specification.name);
    expect(screen.getByRole('list', { name: 'Прикреплённые файлы' })).toHaveTextContent(image.name);
    fireEvent.click(screen.getByRole('button', { name: `Убрать ${specification.name}` }));
    expect(screen.queryByText(specification.name)).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Вид работ' }), { target: { value: '22' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Имя' }), { target: { value: 'Учебный заказчик' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Телефон' }), { target: { value: '+7 000 000-00-00' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Адрес объекта' }), { target: { value: 'Учебная площадка, 1' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Описание работ' }), { target: { value: 'Учебная заявка' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Отправить заявку' }).closest('form')!);

    await waitFor(() => expect(onSubmitLead).toHaveBeenCalledWith(expect.objectContaining({ work_type_id: 22, attachments: [image] })));
    expect(await screen.findByRole('status')).toHaveTextContent('Заявка отправлена');
  });
});
