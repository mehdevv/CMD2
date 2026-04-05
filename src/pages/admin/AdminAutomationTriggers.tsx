import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Link } from 'wouter';
import { InfoBlock } from '@/components/ui/InfoBlock';

const TRIGGER_ROWS = [
  { id: 'new_lead', event: 'New lead arrives (any channel)', agent: 'Lead Follow-Up', effect: 'Start sequence — step 1 sent immediately', route: '/admin/agents/followup' },
  { id: 'lead_reply', event: 'Lead replies to any automation message', agent: 'Lead Follow-Up', effect: 'Stop sequence — mark as Contacted (configurable)', route: '/admin/agents/followup' },
  { id: 'inbound', event: 'Customer sends a DM or message', agent: 'Client Chat', effect: 'Match knowledge base / generate reply', route: '/admin/agents/chat' },
  { id: 'order_status', event: 'Order status changes in CRM', agent: 'Order Tracking', effect: 'Send mapped status message to customer', route: '/admin/agents/tracking' },
  { id: 'refund_intent', event: 'Customer intent: refund / return', agent: 'Refund', effect: 'Open refund flow — policy check', route: '/admin/agents/refund' },
  { id: 'low_conf', event: 'Low confidence or negative sentiment', agent: 'Any active agent', effect: 'Urgent alert + optional pause', route: '/admin/automation/intervention' },
  { id: 'takeover', event: 'Sales taps Take over', agent: '—', effect: 'Pause all automation on that thread', route: '/admin/automation/intervention' },
];

export default function AdminAutomationTriggers() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TRIGGER_ROWS.map(r => [r.id, true]))
  );

  return (
    <AppShell title="Triggers & automations">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1A1A3E]">Triggers & automations</h1>
        <p className="text-[13px] text-[#6B6B80] mt-1 max-w-2xl">
          Scale runs on events: when something happens, the matching automation agent runs. Toggle rows off to disable that path (production would persist per organization).
        </p>
      </div>

      <div className="mb-6">
        <InfoBlock>
          Message variables available in templates: {'{{name}}'}, {'{{product}}'}, {'{{company}}'}, {'{{agent_name}}'} — replaced at send time.
        </InfoBlock>
      </div>

      <div className="scale-card p-0 overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="bg-[#F7F7F8] border-b border-[#E4E4E8]">
              <th className="py-3 px-4 font-medium text-[#6B6B80] w-10"></th>
              <th className="py-3 px-4 font-medium text-[#6B6B80]">Trigger event</th>
              <th className="py-3 px-4 font-medium text-[#6B6B80]">Agent</th>
              <th className="py-3 px-4 font-medium text-[#6B6B80]">What happens</th>
              <th className="py-3 px-4 font-medium text-[#6B6B80] w-28">Configure</th>
            </tr>
          </thead>
          <tbody>
            {TRIGGER_ROWS.map(row => (
              <tr key={row.id} className="border-b border-[#E4E4E8] last:border-0">
                <td className="py-3 px-4 align-top">
                  <input
                    type="checkbox"
                    checked={enabled[row.id]}
                    onChange={() => setEnabled(e => ({ ...e, [row.id]: !e[row.id] }))}
                    className="w-4 h-4 mt-0.5"
                  />
                </td>
                <td className="py-3 px-4 text-[#1A1A3E] font-medium align-top">{row.event}</td>
                <td className="py-3 px-4 text-[#6B6B80] align-top">{row.agent}</td>
                <td className="py-3 px-4 text-[#1A1A3E] align-top">{row.effect}</td>
                <td className="py-3 px-4 align-top">
                  <Link href={row.route}>
                    <a className="text-[#2B62E8] hover:underline">Open</a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[12px] text-[#9999AA] mt-4">
        Sequences and delays are configured on each agent page (e.g. Lead Follow-Up → Follow-up sequence).
      </p>
    </AppShell>
  );
}
