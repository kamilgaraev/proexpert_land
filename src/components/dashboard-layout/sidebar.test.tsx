import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Building2, Settings } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { Sidebar, MobileSidebar } from './sidebar';

describe('Sidebar', () => {
  it('closes the mobile menu after selecting a destination', async () => {
    render(<MemoryRouter initialEntries={['/dashboard']}>
      <MobileSidebar navigation={[{ name: 'Проекты', href: '/dashboard/projects', icon: Building2 }]}
        supportNavigation={[]} userNavigation={[]} onLogout={vi.fn()} />
    </MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Открыть меню кабинета' }));
    expect(screen.getByRole('dialog', { name: 'Меню кабинета' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Проекты' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('highlights only the most specific dashboard navigation item', () => {
    render(
      <MemoryRouter
        initialEntries={['/dashboard/organization/settings']}
      >
        <Sidebar
          navigation={[
            {
              name: 'Organization',
              href: '/dashboard/organization',
              icon: Building2,
            },
            {
              name: 'Management',
              href: '/dashboard/organization/settings',
              icon: Settings,
            },
          ]}
          supportNavigation={[]}
          userNavigation={[]}
          onLogout={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Organization' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Management' })).toHaveAttribute('aria-current', 'page');
  });
});
