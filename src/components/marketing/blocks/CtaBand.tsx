import { MarketingLink } from "@/components/marketing/MarketingPrimitives";

interface CtaBandAction {
  label: string;
  href: string;
  primary?: boolean;
}

interface CtaBandProps {
  eyebrow: string;
  title: string;
  description: string;
  actions: CtaBandAction[];
  tone?: "light" | "dark";
  size?: "default" | "compact";
}

const CtaBand = ({
  title,
  description,
  actions,
  tone = "dark",
  size = "default",
}: CtaBandProps) => (
  <section className={`most-cta-panel is-${tone} is-${size}`}>
    <h2>{title}</h2>
    <p>{description}</p>
    {actions.length > 0 ? (
      <div className="most-page-actions">
        {actions.map((action) => (
          <MarketingLink
            key={`${action.href}-${action.label}`}
            href={action.href}
            className={
              action.primary
                ? "most-button most-button-orange"
                : "most-text-link"
            }
          >
            {action.label}
            <span aria-hidden="true">↗</span>
          </MarketingLink>
        ))}
      </div>
    ) : null}
  </section>
);

export default CtaBand;
