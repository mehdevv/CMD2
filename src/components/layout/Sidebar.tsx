import { memo } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/auth';
import { BRAND_WORDMARK_PNG } from '@/lib/brand-assets';
import { SidebarNav } from '@/components/layout/SidebarNav';

function SidebarInner() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside
      className="fixed bottom-0 left-0 top-0 z-50 hidden w-[220px] flex-col overflow-hidden border-r border-[#E4E4E8] bg-white md:flex"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="flex h-14 flex-shrink-0 items-center border-b border-[#E4E4E8] px-4">
        <Link href={getDashboardRoute(user.role)}>
          <a className="flex items-center py-1" aria-label="Scale home" data-testid="link-brand-sidebar">
            <img
              src={BRAND_WORDMARK_PNG}
              alt="Scale"
              className="h-[26px] w-auto max-w-[148px] object-contain object-left"
              width={148}
              height={26}
            />
          </a>
        </Link>
      </div>
      <SidebarNav />
    </aside>
  );
}

SidebarInner.displayName = 'Sidebar';
export const Sidebar = memo(SidebarInner);
