import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#F0F0F2] text-[#6B6B80]',
  accent: 'bg-[#EEF3FD] text-[#1E3A8A]',
  success: 'bg-[#F0FDF4] text-[#16A34A]',
  warning: 'bg-[#FFFBEB] text-[#D97706]',
  danger: 'bg-[#FEF2F2] text-[#DC2626]',
};

interface ScaleBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function ScaleBadge({ children, variant = 'default', className }: ScaleBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', variantStyles[variant], className)}>
      {children}
    </span>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    new: 'accent',
    contacted: 'warning',
    qualified: 'default',
    proposal: 'accent',
    closed: 'success',
  };
  const labelMap: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    proposal: 'Proposal',
    closed: 'Closed',
  };
  return <ScaleBadge variant={variantMap[stage] ?? 'default'}>{labelMap[stage] ?? stage}</ScaleBadge>;
}

export function RoleBadge({ role }: { role: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    admin: 'accent',
    owner: 'default',
    agent: 'default',
  };
  const labelMap: Record<string, string> = {
    admin: 'Admin',
    owner: 'Business Owner',
    agent: 'Sales Agent',
  };
  return <ScaleBadge variant={variantMap[role] ?? 'default'}>{labelMap[role] ?? role}</ScaleBadge>;
}

export function TemplateBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger',
  };
  return <ScaleBadge variant={variantMap[status] ?? 'default'}>{status.charAt(0).toUpperCase() + status.slice(1)}</ScaleBadge>;
}

export function UserStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    active: 'success',
    inactive: 'default',
    invited: 'warning',
  };
  return <ScaleBadge variant={variantMap[status] ?? 'default'}>{status.charAt(0).toUpperCase() + status.slice(1)}</ScaleBadge>;
}
