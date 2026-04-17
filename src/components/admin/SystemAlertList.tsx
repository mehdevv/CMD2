import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SystemAlertItem {
  id: number | string;
  type: 'warning' | 'info';
  text: ReactNode;
}

export interface SystemAlertListProps {
  alerts: SystemAlertItem[];
  footer?: ReactNode;
}

export function SystemAlertList({ alerts, footer }: SystemAlertListProps) {
  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div key={alert.id} className="flex items-start gap-2.5">
          <span
            className={cn(
              'mt-0.5 text-[16px]',
              alert.type === 'warning' ? 'text-[#D97706]' : 'text-[#2B62E8]'
            )}
          >
            {alert.type === 'warning' ? '⚠' : 'ℹ'}
          </span>
          <p className="text-[13px] leading-snug text-[#6B6B80]">{alert.text}</p>
        </div>
      ))}
      {footer}
    </div>
  );
}
