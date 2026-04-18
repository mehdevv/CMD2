import { AppShell } from '@/components/layout/AppShell';
import { TeamAgentsSection } from '@/components/team/TeamAgentsSection';

export default function OwnerAgentsPage() {
  return (
    <AppShell title="Sales team">
      <p className="text-[14px] text-[#6B6B80] mb-6">Add agents, reset passwords, and monitor pipeline activity.</p>
      <TeamAgentsSection variant="owner" />
    </AppShell>
  );
}
