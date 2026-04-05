import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  title: string;
  children: ReactNode;
  fullHeight?: boolean;
  noPadding?: boolean;
}

export function AppShell({ title, children, fullHeight, noPadding }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <Sidebar />
      <Topbar title={title} />
      <main
        className={fullHeight ? 'flex flex-col' : ''}
        style={{
          marginLeft: 220,
          marginTop: 56,
          minHeight: 'calc(100vh - 56px)',
          padding: noPadding ? 0 : '40px 48px',
          maxWidth: noPadding ? undefined : undefined,
        }}
      >
        {children}
      </main>
    </div>
  );
}
