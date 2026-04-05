import { AppShell } from '@/components/layout/AppShell';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScaleBadge } from '@/components/ui/ScaleBadge';
import { MOCK_INVOICES } from '@/lib/mock-data';
import { Check, Download } from 'lucide-react';

const PLANS = [
  { name: 'Freelancer', price: '$20', users: 'Up to 10', messages: '200,000', features: ['4 AI agents', 'Basic analytics', 'Email support'] },
  { name: 'E-commerce', price: '$30', users: 'Up to 25', messages: '500,000', features: ['4 AI agents', 'Advanced analytics', 'Priority support', 'Custom templates'], current: true },
  { name: 'Edu Centers', price: '$50', users: 'Unlimited', messages: '1,000,000', features: ['4 AI agents', 'Full analytics', 'Dedicated support', 'API access'] },
];

export default function AdminBillingPage() {
  return (
    <AppShell title="Billing">
      {/* Current plan */}
      <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-4">Current plan</h2>
      <div className="scale-card max-w-lg mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[18px] font-semibold text-[#1A1A3E]">E-commerce Plan</div>
            <div className="text-[14px] text-[#6B6B80] mt-0.5">$30 / month · Renews May 1, 2026</div>
          </div>
          <a href="#plans" className="scale-btn-ghost text-[13px]">Change plan</a>
        </div>
        <div className="space-y-4">
          <div>
            <ProgressBar value={420000} max={500000} label="Messages" showValues />
          </div>
          <div>
            <ProgressBar value={5} max={25} label="Seats" showValues />
          </div>
        </div>
      </div>

      {/* Plans */}
      <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-4" id="plans">All plans</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className="scale-card"
            style={{ borderColor: plan.current ? '#2B62E8' : '#E4E4E8' }}
            data-testid={`card-plan-${plan.name.toLowerCase().replace(' ', '-')}`}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="text-[15px] font-medium text-[#1A1A3E]">{plan.name}</div>
              {plan.current && <ScaleBadge variant="accent">Current plan</ScaleBadge>}
            </div>
            <div className="text-[22px] font-semibold text-[#1A1A3E] mb-3">{plan.price}<span className="text-[13px] font-normal text-[#6B6B80]">/mo</span></div>
            <div className="text-[13px] text-[#6B6B80] mb-1">{plan.users} users</div>
            <div className="text-[13px] text-[#6B6B80] mb-4">{plan.messages} messages/mo</div>
            <ul className="space-y-1.5 mb-5">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-1.5 text-[13px] text-[#6B6B80]">
                  <Check size={12} className="text-[#16A34A]" /> {f}
                </li>
              ))}
            </ul>
            {plan.current ? (
              <div className="text-[13px] text-[#9999AA] text-center py-1.5">Your current plan</div>
            ) : (
              <button className="scale-btn-secondary w-full justify-center text-[13px]" data-testid={`button-upgrade-${plan.name.toLowerCase()}`}>
                Upgrade
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Invoices */}
      <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-4">Invoice history</h2>
      <div className="scale-card p-0 overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Date</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Description</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Amount</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Status</th>
              <th className="py-2 px-4" />
            </tr>
          </thead>
          <tbody>
            {MOCK_INVOICES.map(inv => (
              <tr key={inv.id} className="border-b border-[#E4E4E8] last:border-0 hover:bg-[#F7F7F8]" style={{ height: 48 }} data-testid={`row-invoice-${inv.id}`}>
                <td className="px-4 text-[13px] text-[#6B6B80]">{inv.date}</td>
                <td className="px-4 text-[14px] text-[#1A1A3E]">{inv.description}</td>
                <td className="px-4 text-[14px] font-medium text-[#1A1A3E]">${String(inv.amount)}</td>
                <td className="px-4"><ScaleBadge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</ScaleBadge></td>
                <td className="px-4">
                  <button className="text-[#6B6B80] hover:text-[#2B62E8]" title="Download PDF" data-testid={`button-download-invoice-${inv.id}`}><Download size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment method */}
      <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-4">Payment method</h2>
      <div className="scale-card max-w-sm">
        <div className="text-[14px] text-[#6B6B80] mb-0.5">Visa ending in 4242</div>
        <div className="text-[13px] text-[#9999AA] mb-3">Expires 12/27 · billing@scale.dz</div>
        <button className="scale-btn-ghost text-[13px] px-0" data-testid="button-update-payment">Update payment method</button>
      </div>
    </AppShell>
  );
}
