import { AppShell } from '@/components/layout/AppShell';
import { WorkspaceBillingPanel } from '@/components/billing/WorkspaceBillingPanel';

export default function OwnerBillingPage() {
  return (
    <AppShell title="Billing">
      <p className="text-[14px] text-[#6B6B80] mb-6">Your workspace plan, usage, invoices, and payment method.</p>
      <WorkspaceBillingPanel />
    </AppShell>
  );
}
