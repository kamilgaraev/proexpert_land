import { render, screen } from '@testing-library/react';
import { Building2, Settings } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  it('highlights only the most specific dashboard navigation item', () => {
    render(
      <MemoryRouter
        initialEntries={['/dashboard/organization/settings']}
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
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

    expect(screen.getByRole('link', { name: 'Organization' })).not.toHaveClass('bg-primary/10');
    expect(screen.getByRole('link', { name: 'Management' })).toHaveClass('bg-primary/10');
  });
});
