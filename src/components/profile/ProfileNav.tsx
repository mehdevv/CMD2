import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/profile', label: 'Profile' },
  { href: '/profile/security', label: 'Security' },
  { href: '/profile/notifications', label: 'Notifications' },
  { href: '/profile/sessions', label: 'Sessions' },
] as const;

export function ProfileNav({ className }: { className?: string }) {
  const [location] = useLocation();

  return (
    <nav className={cn('flex flex-col gap-0.5', className)} aria-label="Profile sections">
      {LINKS.map(item => {
        const active =
          item.href === '/profile'
            ? location === '/profile'
            : location === item.href || location.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block cursor-pointer rounded-md px-3 py-2 text-[13px] transition-colors no-underline',
              active
                ? 'bg-[#EEF3FD] font-medium text-[#2B62E8]'
                : 'text-[#6B6B80] hover:bg-[#F7F7F8] hover:text-[#1A1A3E]'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
