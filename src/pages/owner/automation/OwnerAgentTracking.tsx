import { useState } from 'react';
import { AgentConfigShell, SectionBlock, FieldGroup } from '@/components/agents/AgentConfigShell';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { OwnerFundamentalsCard } from '@/components/automation/OwnerFundamentalsCard';
import { TagInput } from '@/components/ui/TagInput';
import { InfoBlock } from '@/components/ui/InfoBlock';

const SECTIONS = [
  { id: 'fundamentals', label: 'Platform defaults' },
  { id: 'mapping', label: 'Customer messages' },
  { id: 'satisfaction', label: 'After delivery replies' },
  { id: 'handoff', label: 'Who we notify' },
];

const DEFAULT_ROWS = [
  { code: 'confirmed', message: 'Hi {{name}}, your order is confirmed! We\'re preparing it.' },
  { code: 'shipped', message: 'Good news {{name}} — your order is on the way.' },
  { code: 'out_for_delivery', message: '{{name}}, delivery is out today — please keep your phone on.' },
  { code: 'delivered', message: 'Delivered! Hope you love it, {{name}}. Reply if anything is wrong.' },
];

export default function OwnerAgentTracking() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [dissatisfiedKw, setDissatisfiedKw] = useState<string[]>(['wrong', 'broken', 'refund', 'terrible']);
  const [saved, setSaved] = useState(false);
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const rightPanel = (
    <AgentStatusPanel
      agentId="owner-tracking"
      stats={[
        { label: 'Updates sent (7d)', value: '57' },
        { label: 'API status', value: 'Connected' },
        { label: 'Last sync', value: '2 min ago' },
      ]}
      lastEdited="This week"
    />
  );

  return (
    <AgentConfigShell
      agentName="Order Tracking"
      agentPath="/automation/tracking"
      agentId="tracking"
      overviewHref="/automation"
      overviewLabel="Your automation"
      sections={SECTIONS}
      rightPanel={rightPanel}
    >
      <SectionBlock id="fundamentals" title="Platform defaults">
        <OwnerFundamentalsCard agent="tracking" />
      </SectionBlock>

      <SectionBlock id="mapping" title="Customer messages" description="Edit the text customers receive for each status. Carrier connection is admin-only.">
        <div className="mb-4">
          <InfoBlock>Internal status codes come from your delivery partner. You control the wording customers see.</InfoBlock>
        </div>
        <div className="scale-card p-0 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#F7F7F8] border-b border-[#E4E4E8]">
                <th className="text-left py-2 px-3 font-medium text-[#6B6B80]">Status</th>
                <th className="text-left py-2 px-3 font-medium text-[#6B6B80]">Message</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.code} className="border-b border-[#E4E4E8] last:border-0">
                  <td className="py-2 px-3 font-medium text-[#1A1A3E] whitespace-nowrap">{r.code}</td>
                  <td className="py-2 px-3">
                    <input
                      className="scale-input w-full text-[13px]"
                      value={r.message}
                      onChange={e => setRows(prev => prev.map((x, j) => (j === i ? { ...x, message: e.target.value } : x)))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionBlock>

      <SectionBlock id="satisfaction" title="After delivery replies" description="When customers answer a delivery update, route unhappy threads to refund flow (admin configures Refund agent).">
        <div className="scale-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium text-[#1A1A3E]">Classify replies after delivery updates</div>
              <div className="text-[12px] text-[#9999AA]">Uses the org model with admin limits.</div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <FieldGroup label="Treat as unsatisfied if reply contains">
            <TagInput value={dissatisfiedKw} onChange={setDissatisfiedKw} restrictive />
          </FieldGroup>
        </div>
      </SectionBlock>

      <SectionBlock id="handoff" title="Who we notify" description="You choose who on your team gets alerts; channel credentials are from admin.">
        <div className="scale-card space-y-3">
          {['Notify me on failed delivery', 'Notify me when customer is unsatisfied', 'Notify assigned sales on failed delivery'].map(t => (
            <label key={t} className="flex items-center gap-2 text-[13px] cursor-pointer">
              <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
              {t}
            </label>
          ))}
          <FieldGroup label="Extra note on SMS / WhatsApp (optional)">
            <input className="scale-input w-full" placeholder="e.g. Call me on my mobile for VIP orders" />
          </FieldGroup>
        </div>
      </SectionBlock>

      <div className="sticky bottom-0 bg-white border-t border-[#E4E4E8] -mx-10 px-10 py-4 flex items-center justify-between">
        <span className="text-[13px] text-[#16A34A]">{saved ? '✓ Changes saved' : ''}</span>
        <button type="button" onClick={save} className="scale-btn-primary">
          Save changes
        </button>
      </div>
    </AgentConfigShell>
  );
}
