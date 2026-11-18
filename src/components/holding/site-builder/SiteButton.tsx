import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties } from 'react';
import type { SiteButtonAppearance } from './siteButtonAppearance';
import './siteButton.css';

interface ButtonStyleProps {
  appearance?: SiteButtonAppearance;
  variant?: 'primary' | 'secondary';
}

type SiteButtonProps = ButtonStyleProps & (
  | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
);

export default function SiteButton({ appearance = {}, className = '', variant = 'primary', ...props }: SiteButtonProps) {
  const style = {
    ...props.style,
    '--site-button-background': appearance.background,
    '--site-button-foreground': appearance.foreground,
    '--site-button-border': appearance.border,
    '--site-button-width': appearance.width === 'auto' ? 'fit-content' : appearance.width === undefined ? undefined : `${appearance.width}%`,
  } as CSSProperties;
  const classes = `holding-site-button holding-site-button--${variant} ${className}`;

  if (props.href !== undefined) {
    return <a {...props} className={classes} data-shape={appearance.shape} style={style} />;
  }

  return <button {...props} className={classes} data-shape={appearance.shape} style={style} type={props.type ?? 'button'} />;
}
