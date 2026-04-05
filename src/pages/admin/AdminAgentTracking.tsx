import { useState } from 'react';
import { X } from 'lucide-react';
import { AgentConfigShell, SectionBlock, FieldGroup } from '@/components/agents/AgentConfigShell';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { LLMConfigSection } from '@/components/agents/LLMConfigSection';
import type { LLMConfig } from '@/components/agents/LLMConfigSection';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { TagInput } from '@/components/ui/TagInput';
import { InfoBlock } from '@/components/ui/InfoBlock';
import { Link } from 'wouter';

const SECTIONS = [
  { id: 'llm', label: 'LLM configuration' },
  { id: 'carrier', label: 'Delivery carrier API' },
  { id: 'mapping', label: 'Status messages' },
  { id: 'satisfaction', label: 'Satisfaction & handoff' },
  { id: 'triggers', label: 'Triggers' },
  { id: 'handoff', label: 'Human & owner alerts' },
];

const DEFAULT_STATUSES = [
  { code: 'confirmed', message: 'Hi {{name}}, your order is confirmed! We\'re preparing it for you.', escalation: false },
  { code: 'shipped', message: 'Great news {{name}} — your order is on its way! Track with your carrier link.', escalation: false },
  { code: 'out_for_delivery', message: '{{name}}, your package is out for delivery today. Please keep your phone available.', escalation: false },
  { code: 'delivered', message: 'Delivered! We hope you love your order, {{name}}. Reply if anything looks wrong.', escalation: false },
  { code: 'failed', message: 'Hi {{name}}, there was an issue with delivery. A team member will reach out shortly.', escalation: true },
  { code: 'returned', message: 'Your parcel was returned to us. We\'ll contact you to reschedule delivery.', escalation: true },
];

function TrackingTestModal({ onClose }: { onClose: () => void }) {
  const [order, setOrder] = useState('ORD-10432');
  const [status, setStatus] = useState('shipped');
  const [preview, setPreview] = useState('');

  const run = () => {
    const row = DEFAULT_STATUSES.find(s => s.code === status);
    setPreview(row?.message.replace('{{name}}', 'Demo Customer') ?? '');
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E4E4E8] w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[15px] font-semibold text-[#1A1A3E]">Test Order Tracking</h3>
          <button type="button" onClick={onClose} className="text-[#9999AA] hover:text-[#1A1A3E]"><X size={18} /></button>
        </div>
        <FieldGroup label="Sample order ID">
          <input className="scale-input w-full" value={order} onChange={e => setOrder(e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Simulate status">
          <select className="scale-input w-full" value={status} onChange={e => setStatus(e.target.value)}>
            {DEFAULT_STATUSES.map(s => (
              <option key={s.code} value={s.code}>{s.code}{s.escalation ? ' ⚠' : ''}</option>
            ))}
          </select>
        </FieldGroup>
        <button type="button" onClick={run} className="scale-btn-primary text-[13px] mb-4">Preview customer message</button>
        {preview && (
          <div className="scale-card bg-[#F7F7F8] text-[13px] text-[#1A1A3E]">
            <div className="text-[11px] text-[#9999AA] mb-1">Customer would receive</div>
            {preview}
          </div>
        )}
        <p className="text-[12px] text-[#9999AA] mt-4">If the customer replies with dissatisfaction keywords, the Refund agent runs and the owner is notified (see Satisfaction section).</p>
      </div>
    </div>
  );
}

export default function AdminAgentTracking() {
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: 'OpenAI',
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.25,
    maxTokens: 120,
  });
  const [baseUrl, setBaseUrl] = useState('https://api.yalidine.app/v1');
  const [carrierKey, setCarrierKey] = useState('');
  const [pollMins, setPollMins] = useState(5);
  const [orderField, setOrderField] = useState('external_order_id');
  const [rows, setRows] = useState(DEFAULT_STATUSES);
  const [dissatisfiedKw, setDissatisfiedKw] = useState<string[]>(['wrong', 'broken', 'refund', 'angry', 'terrible']);
  const [showTest, setShowTest] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const rightPanel = (
    <AgentStatusPanel
      agentId="tracking"
      stats={[
        { label: 'Updates sent (7d)', value: '57' },
        { label: 'Inbound “where is order?”', value: '↓ 38%' },
        { label: 'Delivery confirmed', value: '91%' },
        { label: 'Last poll', value: '2 min ago' },
      ]}
      lastEdited="3 days ago"
      onTest={() => setShowTest(true)}
    />
  );

  return (
    <>
      <AgentConfigShell agentName="Order Tracking Agent" agentPath="/admin/agents/tracking" sections={SECTIONS} rightPanel={rightPanel}>
        <div className="mb-6">
          <InfoBlock>
            Channels: WhatsApp & Facebook. The agent reads your delivery partner API, maps statuses to customer messages, and hands off to the Refund flow when the customer is unsatisfied.
          </InfoBlock>
        </div>

        <LLMConfigSection config={llmConfig} onChange={setLlmConfig} />

        <SectionBlock id="carrier" title="Delivery carrier API" description="Connect to your carrier or delivery agency. The automation polls for status changes and fires customer messages.">
          <div className="scale-card space-y-4">
            <FieldGroup label="API base URL" help="REST base for your provider (example shown).">
              <input className="scale-input w-full" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="API key" help="Stored encrypted. Test sends a mock handshake in the UI.">
              <PasswordInput value={carrierKey} onChange={setCarrierKey} placeholder="••••••••" showTestButton />
            </FieldGroup>
            <FieldGroup label="Authentication">
              <select className="scale-input w-56">
                <option>Bearer token (header)</option>
                <option>API key (query param)</option>
                <option>Basic auth</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Polling interval (minutes)" help="How often to fetch updates for open shipments.">
              <input type="number" className="scale-input w-24" value={pollMins} onChange={e => setPollMins(Number(e.target.value))} min={1} />
            </FieldGroup>
            <FieldGroup label="Webhook URL (inbound)" help="Display only — register this URL with the carrier if supported.">
              <input readOnly className="scale-input w-full bg-[#F7F7F8]" value="https://api.scale.dz/webhooks/carrier/tracking" />
            </FieldGroup>
            <FieldGroup label="CRM field for carrier order ID" help="Which field on the order links to the carrier’s tracking id.">
              <input className="scale-input w-72" value={orderField} onChange={e => setOrderField(e.target.value)} />
            </FieldGroup>
          </div>
        </SectionBlock>

        <SectionBlock id="mapping" title="Status → customer message" description="When the carrier reports a status, the matching message is sent on the active channel thread.">
          <div className="scale-card p-0 overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#F7F7F8] border-b border-[#E4E4E8]">
                  <th className="text-left py-2 px-3 font-medium text-[#6B6B80]">Internal status</th>
                  <th className="text-left py-2 px-3 font-medium text-[#6B6B80]">Customer message</th>
                  <th className="text-left py-2 px-3 font-medium text-[#6B6B80] w-24">Escalation</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.code} className="border-b border-[#E4E4E8] last:border-0">
                    <td className="py-2 px-3 font-medium text-[#1A1A3E] whitespace-nowrap">
                      {r.code}
                      {r.escalation && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626]">alert</span>}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        className="scale-input w-full text-[13px]"
                        value={r.message}
                        onChange={e => setRows(prev => prev.map((x, j) => j === i ? { ...x, message: e.target.value } : x))}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="checkbox"
                        checked={r.escalation}
                        onChange={e => setRows(prev => prev.map((x, j) => j === i ? { ...x, escalation: e.target.checked } : x))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="scale-btn-ghost text-[13px] mt-3">+ Add custom status</button>
        </SectionBlock>

        <SectionBlock id="satisfaction" title="Satisfaction & handoff to Refund" description="After delivery updates, monitor replies. Unhappy customers trigger the Refund agent and notify the owner.">
          <div className="scale-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-[#1A1A3E]">Check satisfaction after delivery-type messages</div>
                <div className="text-[12px] text-[#9999AA]">Uses the model to classify replies as satisfied, neutral, or unsatisfied.</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <FieldGroup label="Unsatisfied keywords (instant handoff)" help="Also escalates if these appear in the customer reply.">
              <TagInput value={dissatisfiedKw} onChange={setDissatisfiedKw} restrictive examples={['refund', 'broken']} />
            </FieldGroup>
            <FieldGroup label="When unsatisfied">
              <div className="space-y-2">
                {['Send empathy message first, then start Refund flow', 'Notify business owner immediately', 'Notify assigned sales agent'].map((o, idx) => (
                  <label key={o} className="flex items-center gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                    <input type="checkbox" defaultChecked={idx < 2} className="w-3.5 h-3.5" />
                    {o}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <div className="border border-[#E4E4E8] rounded-lg p-4 bg-[#F7F7F8]">
              <div className="text-[12px] font-medium text-[#6B6B80] mb-3">Flow preview</div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#1A1A3E]">
                <span className="px-2 py-1 bg-white border border-[#E4E4E8] rounded">Delivery update sent</span>
                <span className="text-[#9999AA]">→</span>
                <span className="px-2 py-1 bg-white border border-[#E4E4E8] rounded">Customer replies</span>
                <span className="text-[#9999AA]">→</span>
                <span className="px-2 py-1 bg-white border border-[#E4E4E8] rounded">Satisfaction check</span>
                <span className="text-[#9999AA]">→</span>
                <span className="px-2 py-1 bg-[#FEF2F2] border border-[#FCA5A5] rounded text-[#B91C1C]">Unsatisfied → Refund + owner</span>
              </div>
            </div>
            <Link href="/admin/agents/refund">
              <a className="text-[13px] text-[#2B62E8] hover:underline">Configure Refund agent →</a>
            </Link>
          </div>
        </SectionBlock>

        <SectionBlock id="triggers" title="Triggers" description="When Order Tracking sends messages.">
          <div className="scale-card space-y-3">
            {[
              'When order status changes in CRM (primary)',
              'Only if order is linked to a contact with an open channel thread',
              'Skip if customer opted out of automation messages',
            ].map(t => (
              <label key={t} className="flex items-center gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                {t}
              </label>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock id="handoff" title="Human & owner alerts" description="Who gets notified for failures and unhappy customers.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Notify business owner when">
              <div className="space-y-2">
                {['Delivery failed or returned', 'Customer marked unsatisfied after tracking message', 'Carrier API errors (3+ consecutive)'].map(x => (
                  <label key={x} className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                    {x}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Notify assigned sales agent when">
              <div className="space-y-2">
                {['Failed delivery in their territory', 'Customer asks for callback in thread'].map(x => (
                  <label key={x} className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                    {x}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Owner notification template" help="Variables: {{contact_name}}, {{order_id}}, {{status}}, {{conversation_link}}">
              <textarea className="scale-input w-full" rows={3} defaultValue="Heads up: {{contact_name}} — issue with order {{order_id}} ({{status}}). Open thread: {{conversation_link}}" />
            </FieldGroup>
          </div>
        </SectionBlock>

        <div className="sticky bottom-0 bg-white border-t border-[#E4E4E8] -mx-10 px-10 py-4 flex items-center justify-between">
          <span className="text-[13px] text-[#16A34A]">{saved ? '✓ Changes saved' : ''}</span>
          <button type="button" onClick={save} className="scale-btn-primary">Save changes</button>
        </div>
      </AgentConfigShell>
      {showTest && <TrackingTestModal onClose={() => setShowTest(false)} />}
    </>
  );
}
