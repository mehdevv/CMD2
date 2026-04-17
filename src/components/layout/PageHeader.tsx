import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export interface PageHeaderBreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: PageHeaderBreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        {breadcrumb?.length ? (
          <nav className="text-[13px] text-[#6B6B80] mb-2" aria-label="Breadcrumb">
            {breadcrumb.map((b, i) => (
              <span key={`${b.label}-${i}`}>
                {i > 0 ? <span className="text-[#9999AA] mx-1">/</span> : null}
                {b.href ? (
                  <Link href={b.href}>
                    <a className="hover:text-[#2B62E8] hover:underline">{b.label}</a>
                  </Link>
                ) : (
                  <span className="text-[#1A1A3E]">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-[22px] font-semibold text-[#1A1A3E]">{title}</h1>
        {subtitle ? <p className="text-[13px] text-[#6B6B80] mt-1">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-shrink-0 flex-wrap items-center gap-2 mt-3 sm:mt-0">{actions}</div> : null}
    </div>
  );
}
