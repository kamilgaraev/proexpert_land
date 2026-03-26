import type { ReactNode } from 'react';
import { PageHero } from '@/components/marketing/MarketingPrimitives';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

interface BlogPublicLayoutProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  nav?: { label: string; href: string }[];
  aside?: ReactNode;
}

const defaultNav = [
  { label: 'Последние статьи', href: '#blog-feed' },
  { label: 'Категории', href: '#blog-categories' },
  { label: 'Контакты', href: '#blog-cta' },
];

const BlogPublicLayout = ({
  children,
  eyebrow = 'Блог ProHelper',
  title = 'Материалы о строительных процессах, запуске и цифровом контуре.',
  description = 'Публикуем статьи о графиках работ, снабжении, документах, финансах и организации строительной команды.',
  nav = defaultNav,
  aside,
}: BlogPublicLayoutProps) => (
  <div className="min-h-screen overflow-hidden bg-white">
    <Navbar />
    <div className="pt-20">
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        nav={nav}
        aside={aside}
      />
      <main>{children}</main>
    </div>
    <Footer />
  </div>
);

export default BlogPublicLayout;
