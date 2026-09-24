import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Tile({
  to,
  label,
  accent,
  dim = false,
  children,
}: {
  to: string;
  label: string;
  accent: 'coral' | 'gold' | 'emerald' | 'gray';
  dim?: boolean;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={`tile accent-${accent} ${dim ? 'dim' : ''}`} data-accent={accent} data-tile={label}>
      <span className="tile-body">{children}</span>
      <span className="tile-label">{label}</span>
    </Link>
  );
}
