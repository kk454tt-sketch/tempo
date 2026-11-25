import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { ui } from './styles';

export function EmptyState({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className={`${ui.card} flex flex-col items-center gap-3 px-6 py-16 text-center`}>
      <Icon name={icon} className="text-[48px] text-on-surface-variant" />
      <p className="text-headline-sm text-primary">{title}</p>
      {children}
    </div>
  );
}
