import type { ReactNode } from "react";
import { PageHero } from "@/components/marketing/MarketingPrimitives";
import MarketingShell from "@/components/landing/MarketingShell";
import "@/styles/marketing-blog.css";

interface BlogPublicLayoutProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  nav?: { label: string; href: string }[];
  aside?: ReactNode;
}

const defaultNav = [
  { label: "Последние статьи", href: "#blog-feed" },
  { label: "Категории", href: "#blog-categories" },
  { label: "Контакты", href: "#blog-cta" },
];

const BlogPublicLayout = ({
  children,
  title = "Материалы о строительных процессах, запуске и управлении проектами.",
  description = "Публикуем статьи о графиках работ, снабжении, документах, финансах и организации строительной команды.",
  nav = defaultNav,
  aside,
}: BlogPublicLayoutProps) => (
  <MarketingShell>
    <div className="marketing-page-shell most-blog most-blog-editorial">
      <PageHero
        title={title}
        description={description}
        nav={nav}
        aside={aside}
      />
      {children}
    </div>
  </MarketingShell>
);

export default BlogPublicLayout;
