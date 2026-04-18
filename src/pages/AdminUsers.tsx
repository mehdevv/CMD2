import { AppShell } from '@/components/layout/AppShell';
import { TeamAgentsSection } from '@/components/team/TeamAgentsSection';

export default function AdminUsersPage() {
  return (
    <AppShell title="Users">
      <TeamAgentsSection variant="admin" />
    </AppShell>
  );
}
