import { AppShell } from '@/components/layout/AppShell';
import { StageEditorShell } from '@/components/opportunities/StageEditorShell';
import { useOpportunityFromRoute } from './useOpportunityFromRoute';
import { derivePaymentStatus } from '@/lib/pipeline';

export default function OpportunityClosingPage() {
  const { opp, patchOpportunity, canAccess } = useOpportunityFromRoute();

  if (!opp) return <AppShell title="Closing"><p className="text-[#6B6B80]">Not found</p></AppShell>;
  if (!canAccess) return <AppShell title="Closing"><p className="text-[#DC2626]">No access</p></AppShell>;

  const markPaid = (pid: string) => {
    const now = new Date().toISOString();
    const payments = opp.payments.map(p =>
      p.id === pid
        ? { ...p, status: 'paid' as const, receivedAt: now, reference: p.reference ?? 'PAID' }
        : p
    );
    patchOpportunity(opp.id, {
      payments,
      paymentStatus: derivePaymentStatus(payments),
      updatedAt: now,
    });
  };

  const allPaid = opp.paymentStatus === 'paid';

  return (
    <AppShell title="Closing">
      <StageEditorShell opportunityId={opp.id}>
      {allPaid && (
        <div className="mb-4 rounded-md border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-[14px] text-[#166534]">
          All payments received — you can mark this opportunity as won from the record header.
        </div>
      )}
      <div className="scale-card max-w-2xl space-y-3 p-5">
        <h2 className="text-[17px] font-semibold text-[#1A1A3E]">Payments</h2>
        <table className="w-full text-[13px] border border-[#E4E4E8] rounded-md overflow-hidden">
          <thead className="bg-[#F7F7F8]">
            <tr>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Status</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {opp.payments.map(p => (
              <tr key={p.id} className="border-t border-[#E4E4E8]">
                <td className="p-2">{p.amount.toLocaleString()} DZD</td>
                <td className="p-2 capitalize">{p.status.replace(/_/g, ' ')}</td>
                <td className="p-2 text-right">
                  {p.status === 'pending' && (
                    <button type="button" className="scale-btn-secondary text-[12px]" onClick={() => markPaid(p.id)}>
                      Mark paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </StageEditorShell>
    </AppShell>
  );
}
