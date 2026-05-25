import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileNav } from '@/contexts/MobileNavContext';
import { getDashboardRoute } from '@/lib/auth';
import { BRAND_WORDMARK_PNG } from '@/lib/brand-assets';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

/** Slide-out navigation for viewports below `md`. */
export function MobileNavDrawer() {
  const { user } = useAuth();
  const { open, setOpen } = useMobileNav();

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="flex w-[min(100vw,280px)] flex-col gap-0 border-[#E4E4E8] bg-white p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-14 flex-shrink-0 items-center border-b border-[#E4E4E8] px-4">
          <Link href={getDashboardRoute(user.role)}>
            <a className="flex items-center py-1" aria-label="Scale home" onClick={() => setOpen(false)}>
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
        <SidebarNav closeOnNavigate />
      </SheetContent>
    </Sheet>
  );
}
