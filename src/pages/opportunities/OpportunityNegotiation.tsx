import { AppShell } from '@/components/layout/AppShell';
import { StageEditorShell } from '@/components/opportunities/StageEditorShell';
import { useOpportunityFromRoute } from './useOpportunityFromRoute';
import type { Payment } from '@/lib/types';
import { canAdvance, derivePaymentStatus } from '@/lib/pipeline';

export default function OpportunityNegotiationPage() {
  const { opp, patchOpportunity, canAccess, user } = useOpportunityFromRoute();

  if (!opp) return <AppShell title="Negotiation"><p className="text-[#6B6B80]">Not found</p></AppShell>;
  if (!canAccess) return <AppShell title="Negotiation"><p className="text-[#DC2626]">No access</p></AppShell>;

  const addPayment = () => {
    const now = new Date().toISOString();
    const row: Payment = {
      id: `pay-${Date.now()}`,
      amount: opp.value,
      method: 'bank_transfer',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    };
    const payments = [...opp.payments, row];
    patchOpportunity(opp.id, {
      payments,
      paymentStatus: derivePaymentStatus(payments),
      updatedAt: now,
    });
  };

  const advance = () => {
    const check = canAdvance(opp, 'closing');
    if (!check.ok) {
      window.alert(check.reason);
      return;
    }
    const now = new Date().toISOString();
    const byId = user?.id ?? opp.ownerId;
    patchOpportunity(opp.id, {
      stage: 'closing',
      stageEnteredAt: now,
      updatedAt: now,
      stageHistory: [...opp.stageHistory, { from: opp.stage, to: 'closing', at: now, by: byId }],
    });
  };

  return (
    <AppShell title="Negotiation">
      <StageEditorShell opportunityId={opp.id}>
      <div className="scale-card max-w-2xl space-y-4 p-5">
        <h2 className="text-[17px] font-semibold text-[#1A1A3E]">Payment plan</h2>
        <p className="text-[13px] text-[#6B6B80]">Payments pending while the deal is verbally agreed.</p>
        <button type="button" className="scale-btn-secondary text-[13px]" onClick={addPayment}>
          Add payment row
        </button>
        <table className="w-full text-[13px] border border-[#E4E4E8] rounded-md overflow-hidden">
          <thead className="bg-[#F7F7F8]">
            <tr>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Method</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {opp.payments.map(p => (
              <tr key={p.id} className="border-t border-[#E4E4E8]">
                <td className="p-2">{p.amount.toLocaleString()} DZD</td>
                <td className="p-2">{p.method}</td>
                <td className="p-2 capitalize">{p.status.replace(/_/g, ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="scale-btn-primary" onClick={advance}>
          Move to Closing
        </button>
      </div>
      </StageEditorShell>
    </AppShell>
  );
}
