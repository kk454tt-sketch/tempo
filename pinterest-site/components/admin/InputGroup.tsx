import type { ReactNode } from 'react';
import { ui } from './styles';

/** Input with a fixed prefix inside the same border (currency symbol, "/products/"). */
export function InputGroup({ prefix, invalid, children }: { prefix: ReactNode; invalid?: boolean; children: ReactNode }) {
  return (
    <div className={`${ui.inputGroup} ${invalid ? 'border-[#DC2626]' : ''}`}>
      <span className="select-none pl-3 text-body-md text-on-surface-variant">{prefix}</span>
      {children}
    </div>
  );
}
