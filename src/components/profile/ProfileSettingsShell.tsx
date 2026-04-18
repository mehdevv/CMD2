import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileNav } from '@/components/profile/ProfileNav';

interface ProfileSettingsShellProps {
  /** Text shown in the top bar. */
  shellTitle: string;
  /** Main page heading below the top bar. */
  heading: string;
  description?: string;
  children: ReactNode;
}

export function ProfileSettingsShell({
  shellTitle,
  heading,
  description = 'Manage your personal account and sign-in.',
  children,
}: ProfileSettingsShellProps) {
  return (
    <AppShell title={shellTitle}>
      <PageHeader title={heading} subtitle={description} />
      <div className="mt-6 flex flex-col gap-8 lg:flex-row-reverse lg:items-start">
        <aside className="lg:w-44 lg:flex-shrink-0 lg:pt-1">
          <ProfileNav />
        </aside>
        <div className="min-w-0 flex-1 space-y-6">{children}</div>
      </div>
    </AppShell>
  );
}
