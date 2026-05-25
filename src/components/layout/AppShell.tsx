import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNavDrawer } from './MobileNavDrawer';
import { MotionPage } from '@/components/motion';
import { MobileNavProvider } from '@/contexts/MobileNavContext';
import { cn } from '@/lib/utils';

interface AppShellProps {
  title: string;
  children: ReactNode;
  fullHeight?: boolean;
  noPadding?: boolean;
}

export function AppShell({ title, children, fullHeight, noPadding }: AppShellProps) {
  return (
    <MobileNavProvider>
      <div className="scale-app-shell min-h-screen bg-[#F7F7F8]">
        <Sidebar />
        <MobileNavDrawer />
        <Topbar title={title} />
        <main
          className={cn(
            'scale-app-main',
            fullHeight && 'flex flex-col',
            noPadding && 'scale-app-main--flush'
          )}
        >
          <MotionPage className={fullHeight ? 'flex min-h-0 flex-1 flex-col' : undefined}>{children}</MotionPage>
        </main>
      </div>
    </MobileNavProvider>
  );
}
