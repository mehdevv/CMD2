import { useState } from 'react';
import { X } from 'lucide-react';
import { AgentConfigShell, SectionBlock, FieldGroup } from '@/components/agents/AgentConfigShell';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { LLMConfigSection } from '@/components/agents/LLMConfigSection';
import type { LLMConfig } from '@/components/agents/LLMConfigSection';
import { RadioCards } from '@/components/ui/RadioCards';
import { TagInput } from '@/components/ui/TagInput';
import { InfoBlock } from '@/components/ui/InfoBlock';

const SECTIONS = [
  { id: 'llm', label: 'LLM configuration' },
  { id: 'personality', label: 'Personality' },
  { id: 'policy', label: 'Refund policy' },
  { id: 'rules', label: 'Policy rules' },
  { id: 'flow', label: 'Conversation flow' },
  { id: 'owner', label: 'Owner notifications' },
  { id: 'audit', label: 'Decision log' },
];

const TONE_OPTIONS = [
  { value: 'empathetic', label: 'Empathetic', desc: 'Apologizes, validates feelings, takes ownership' },
  { value: 'professional', label: 'Professional', desc: 'Clear, calm, policy-focused' },
  { value: 'minimal', label: 'Minimal', desc: 'Short confirmations, fewer words' },
];

interface RuleRow {
  id: string;
  condition: string;
  value: string;
  action: string;
}

const MOCK_DECISIONS = [
  { time: 'Today 12:40', contact: 'Karim H.', decision: 'Auto-approved', amount: '1,200 DZD', reason: 'Within window & under limit' },
  { time: 'Today 11:02', contact: 'Samir K.', decision: 'Escalated', amount: '18,500 DZD', reason: 'Above auto-approve threshold' },
  { time: 'Yesterday 16:55', contact: 'Inès M.', decision: 'Denied', amount: '—', reason: 'Outside refund window' },
];

function ruleSummary(rules: RuleRow[]): string[] {
  const condLabel = (c: string) => ({ order_value_above: 'Order value above', days_since_above: 'Days since purchase above', refund_count_90d: 'Refund count (90d) above' }[c] ?? c);
  const actLabel = (a: string) => ({ auto_approve: 'auto-approve', escalate: 'escalate to owner', reject: 'reject refund' }[a] ?? a);
  return rules.filter(r => r.value).map(r => `If ${condLabel(r.condition)} ${r.value} DZD → ${actLabel(r.action)}.`);
}

function RefundTestModal({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState('8500');
  const [days, setDays] = useState('5');
  const [limit, setLimit] = useState('10000');
  const [windowDays, setWindowDays] = useState('30');
  const [result, setResult] = useState('');

  const run = () => {
    const v = parseInt(value, 10) || 0;
    const d = parseInt(days, 10) || 0;
    const lim = parseInt(limit, 10) || 0;
    const w = parseInt(windowDays, 10) || 0;
    if (d > w) setResult('Decision: Reject — outside refund window.');
    else if (v > lim * 2) setResult('Decision: Escalate — exceeds safe auto-approve band; owner review required.');
    else if (v <= lim) setResult('Decision: Auto-approve — within policy limits.');
    else setResult('Decision: Escalate — above auto-approve threshold.');
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E4E4E8] w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[15px] font-semibold text-[#1A1A3E]">Test refund policy</h3>
          <button type="button" onClick={onClose} className="text-[#9999AA]"><X size={18} /></button>
        </div>
        <div className="space-y-3 text-[13px]">
          <FieldGroup label="Order value (DZD)">
            <input className="scale-input w-full" value={value} onChange={e => setValue(e.target.value)} type="number" />
          </FieldGroup>
          <FieldGroup label="Days since purchase">
            <input className="scale-input w-full" value={days} onChange={e => setDays(e.target.value)} type="number" />
          </FieldGroup>
          <FieldGroup label="Auto-approve limit (DZD)">
            <input className="scale-input w-full" value={limit} onChange={e => setLimit(e.target.value)} type="number" />
          </FieldGroup>
          <FieldGroup label="Refund window (days)">
            <input className="scale-input w-full" value={windowDays} onChange={e => setWindowDays(e.target.value)} type="number" />
          </FieldGroup>
          <button type="button" onClick={run} className="scale-btn-primary text-[13px]">Run test</button>
          {result && <div className="scale-card text-[#1A1A3E]">{result}</div>}
        </div>
      </div>
    </div>
  );
}

export default function AdminAgentRefund() {
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: 'OpenAI',
    apiKey: '',
    model: 'gpt-4o',
    temperature: 0.2,
    maxTokens: 200,
  });
  const [tone, setTone] = useState('empathetic');
  const [agentName, setAgentName] = useState('Sara');
  const [systemPrompt, setSystemPrompt] = useState('You handle refund requests with empathy and strict adherence to policy. Never promise what rules disallow. Escalate ambiguous cases.');
  const [refundWindow, setRefundWindow] = useState('30');
  const [autoLimit, setAutoLimit] = useState('10000');
  const [proofRequired, setProofRequired] = useState(true);
  const [partialAllowed, setPartialAllowed] = useState(true);
  const [rules, setRules] = useState<RuleRow[]>([
    { id: '1', condition: 'order_value_above', value: '10000', action: 'escalate' },
    { id: '2', condition: 'days_since_above', value: '30', action: 'reject' },
    { id: '3', condition: 'refund_count_90d', value: '2', action: 'escalate' },
  ]);
  const [holdMessage, setHoldMessage] = useState('Thank you {{name}}, our manager will review your case personally within {{owner_response_sla}}. We take this seriously.');
  const [ownerSla, setOwnerSla] = useState('24 hours');
  const [notifyEvery, setNotifyEvery] = useState(false);
  const [forbiddenCommitments, setForbiddenCommitments] = useState<string[]>(['Full refund without return', 'Compensation not in policy']);
  const [showTest, setShowTest] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const summary = ruleSummary(rules);

  const rightPanel = (
    <AgentStatusPanel
      agentId="refund"
      stats={[
        { label: 'Refunds today', value: '6' },
        { label: 'Auto-approved %', value: '61%' },
        { label: 'Escalation %', value: '22%' },
        { label: 'Avg resolution', value: '4m' },
      ]}
      lastEdited="5 hours ago"
      onTest={() => setShowTest(true)}
    />
  );

  return (
    <>
      <AgentConfigShell
        agentName="Refund Agent"
        agentPath="/admin/agents/refund"
        agentId="refund"
        sections={SECTIONS}
        rightPanel={rightPanel}
      >
        <div className="mb-6">
          <InfoBlock>
            Refund conversations are sensitive — use a capable model and low creativity. Large or policy-violating cases always go to a human; the owner is notified for escalations.
          </InfoBlock>
        </div>

        <LLMConfigSection config={llmConfig} onChange={setLlmConfig} showRefundNote />

        <SectionBlock id="personality" title="Personality" description="How the automation sounds while enforcing policy.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Agent name">
              <input className="scale-input w-48" value={agentName} onChange={e => setAgentName(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Tone">
              <RadioCards options={TONE_OPTIONS} value={tone} onChange={setTone} />
            </FieldGroup>
            <FieldGroup label="System prompt">
              <div className="relative">
                <textarea className="scale-input w-full" rows={6} value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} />
                <span className="absolute bottom-2 right-2 text-[11px] text-[#9999AA]">{systemPrompt.length}</span>
              </div>
            </FieldGroup>
            <FieldGroup label="Forbidden commitments" help="If the customer asks for these, escalate.">
              <TagInput value={forbiddenCommitments} onChange={setForbiddenCommitments} restrictive placeholder="Add phrase + Enter" />
            </FieldGroup>
          </div>
        </SectionBlock>

        <SectionBlock id="policy" title="Refund policy parameters" description="Numbers the automation uses before involving a person.">
          <div className="scale-card space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Refund window (days)">
                <input type="number" className="scale-input w-full" value={refundWindow} onChange={e => setRefundWindow(e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Auto-approve limit (DZD)">
                <input type="number" className="scale-input w-full" value={autoLimit} onChange={e => setAutoLimit(e.target.value)} />
              </FieldGroup>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#1A1A3E]">Proof of purchase required</span>
              <input type="checkbox" checked={proofRequired} onChange={e => setProofRequired(e.target.checked)} className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#1A1A3E]">Allow partial refunds</span>
              <input type="checkbox" checked={partialAllowed} onChange={e => setPartialAllowed(e.target.checked)} className="w-4 h-4" />
            </div>
          </div>
        </SectionBlock>

        <SectionBlock id="rules" title="Policy rules (IF → THEN)" description="Fine-grained rules on top of the numeric policy. Plain-language summary updates live.">
          <div className="scale-card space-y-3">
            {rules.map((rule, i) => (
              <div key={rule.id} className="flex flex-wrap items-center gap-2 text-[13px]">
                <span className="text-[#6B6B80]">IF</span>
                <select value={rule.condition} onChange={e => setRules(prev => prev.map((r, j) => j === i ? { ...r, condition: e.target.value } : r))} className="scale-input w-48">
                  <option value="order_value_above">Order value above</option>
                  <option value="days_since_above">Days since purchase above</option>
                  <option value="refund_count_90d">Refund count (90d) above</option>
                </select>
                <input type="text" value={rule.value} onChange={e => setRules(prev => prev.map((r, j) => j === i ? { ...r, value: e.target.value } : r))} className="scale-input w-24" />
                <span className="text-[#6B6B80]">THEN</span>
                <select value={rule.action} onChange={e => setRules(prev => prev.map((r, j) => j === i ? { ...r, action: e.target.value } : r))} className="scale-input w-44">
                  <option value="auto_approve">Auto-approve</option>
                  <option value="escalate">Escalate to owner</option>
                  <option value="reject">Reject refund</option>
                </select>
                <button type="button" onClick={() => setRules(prev => prev.filter((_, j) => j !== i))} className="text-[#9999AA] hover:text-[#DC2626] text-[12px]">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => setRules(prev => [...prev, { id: String(Date.now()), condition: 'order_value_above', value: '', action: 'escalate' }])} className="scale-btn-secondary text-[13px]">+ Add rule</button>
            {summary.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#E4E4E8]">
                <div className="text-[12px] font-medium text-[#6B6B80] mb-2">Summary</div>
                <ul className="list-disc list-inside text-[13px] text-[#1A1A3E] space-y-1">
                  {summary.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        </SectionBlock>

        <SectionBlock id="flow" title="Conversation flow" description="Outline the steps the automation follows with the customer.">
          <div className="scale-card space-y-4">
            <ol className="list-decimal list-inside text-[13px] text-[#1A1A3E] space-y-2">
              <li>Acknowledge and empathize</li>
              <li>Collect reason and order reference</li>
              <li>Verify proof of purchase (if required)</li>
              <li>Run policy + rules → decision</li>
              <li>Send confirmation or escalation hold message</li>
            </ol>
            <FieldGroup label="Owner response SLA (shown to customer)" help="Inserted as {{owner_response_sla}}">
              <input className="scale-input w-64" value={ownerSla} onChange={e => setOwnerSla(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Escalation hold message">
              <textarea className="scale-input w-full" rows={3} value={holdMessage} onChange={e => setHoldMessage(e.target.value)} />
            </FieldGroup>
          </div>
        </SectionBlock>

        <SectionBlock id="owner" title="Owner notifications" description="Non-trivial refunds keep the business owner in the loop.">
          <div className="scale-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-[#1A1A3E]">Notify owner on every refund request</div>
                <div className="text-[12px] text-[#9999AA]">If off, owner is notified only on escalations (not auto-approved).</div>
              </div>
              <input type="checkbox" checked={notifyEvery} onChange={e => setNotifyEvery(e.target.checked)} className="w-4 h-4" />
            </div>
            <FieldGroup label="Owner notification recipients">
              <select className="scale-input w-full max-w-md" multiple size={3}>
                <option>Sara Owner</option>
                <option>Karim Admin</option>
              </select>
              <p className="text-[12px] text-[#9999AA] mt-1">Hold Ctrl/Cmd to multi-select (mock).</p>
            </FieldGroup>
            <FieldGroup label="Notify via">
              <div className="space-y-2">
                {['In-app', 'Email', 'WhatsApp'].map(ch => (
                  <label key={ch} className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="checkbox" defaultChecked={ch === 'In-app'} className="w-3.5 h-3.5" />
                    {ch}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Owner message template" help="Variables: {{contact_name}}, {{amount}}, {{reason}}, {{conversation_link}}">
              <textarea className="scale-input w-full" rows={3} defaultValue="Refund review needed: {{contact_name}} — {{amount}}. Reason: {{reason}}. {{conversation_link}}" />
            </FieldGroup>
          </div>
        </SectionBlock>

        <SectionBlock id="audit" title="Recent decisions" description="All refund outcomes are logged for admin review (sample).">
          <div className="scale-card p-0 overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#F7F7F8] border-b border-[#E4E4E8]">
                  <th className="text-left py-2 px-3 font-medium text-[#6B6B80]">Time</th>
                  <th className="text-left py-2 px-3 font-medium text-[#6B6B80]">Contact</th>
                  <th className="text-left py-2 px-3 font-medium text-[#6B6B80]">Decision</th>
                  <th className="text-left py-2 px-3 font-medium text-[#6B6B80]">Amount</th>
                  <th className="text-left py-2 px-3 font-medium text-[#6B6B80]">Reason</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DECISIONS.map((d, i) => (
                  <tr key={i} className="border-b border-[#E4E4E8] last:border-0">
                    <td className="py-2 px-3 text-[#6B6B80]">{d.time}</td>
                    <td className="py-2 px-3 font-medium">{d.contact}</td>
                    <td className="py-2 px-3">{d.decision}</td>
                    <td className="py-2 px-3">{d.amount}</td>
                    <td className="py-2 px-3 text-[#6B6B80]">{d.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionBlock>

        <div className="sticky bottom-0 bg-white border-t border-[#E4E4E8] -mx-10 px-10 py-4 flex items-center justify-between">
          <span className="text-[13px] text-[#16A34A]">{saved ? '✓ Changes saved' : ''}</span>
          <button type="button" onClick={save} className="scale-btn-primary">Save changes</button>
        </div>
      </AgentConfigShell>
      {showTest && <RefundTestModal onClose={() => setShowTest(false)} />}
    </>
  );
}
