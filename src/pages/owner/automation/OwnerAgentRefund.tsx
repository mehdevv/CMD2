import { useState } from 'react';
import { AgentConfigShell, SectionBlock, FieldGroup } from '@/components/agents/AgentConfigShell';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { OwnerFundamentalsCard } from '@/components/automation/OwnerFundamentalsCard';
import { RadioCards } from '@/components/ui/RadioCards';
import { TagInput } from '@/components/ui/TagInput';
import { InfoBlock } from '@/components/ui/InfoBlock';
import { ORG_REFUND_POLICY_FOR_OWNER } from '@/lib/automation-fundamentals';

const SECTIONS = [
  { id: 'fundamentals', label: 'Platform defaults' },
  { id: 'policy', label: 'Refund policy (admin)' },
  { id: 'personality', label: 'Tone & prompts' },
  { id: 'messages', label: 'Customer messages' },
];

const TONE_OPTIONS = [
  { value: 'empathetic', label: 'Empathetic', desc: 'Apologize and validate' },
  { value: 'professional', label: 'Professional', desc: 'Calm and clear' },
  { value: 'minimal', label: 'Minimal', desc: 'Short confirmations' },
];

export default function OwnerAgentRefund() {
  const p = ORG_REFUND_POLICY_FOR_OWNER;
  const [agentName, setAgentName] = useState('Sara');
  const [tone, setTone] = useState('empathetic');
  const [systemPrompt, setSystemPrompt] = useState('You process refunds according to company policy. Never promise outside the rules. Escalate edge cases.');
  const [forbiddenPhrases, setForbiddenPhrases] = useState<string[]>(['Full refund without return', 'Free replacement guaranteed']);
  const [holdMessage, setHoldMessage] = useState('Thanks {{name}} — a manager will review your case within {{owner_response_sla}}.');
  const [ownerSla, setOwnerSla] = useState('24 hours');
  const [confirmAuto, setConfirmAuto] = useState('Your refund of {{amount}} DZD is approved. You\'ll receive confirmation shortly.');
  const [saved, setSaved] = useState(false);
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const rightPanel = (
    <AgentStatusPanel
      agentId="owner-refund"
      stats={[
        { label: 'Handled (7d)', value: '18' },
        { label: 'Auto-approved', value: '61%' },
        { label: 'Pending you', value: '3' },
      ]}
      lastEdited="Today"
    />
  );

  return (
    <AgentConfigShell
      agentName="Refund"
      agentPath="/automation/refund"
      agentId="refund"
      overviewHref="/automation"
      overviewLabel="Your automation"
      sections={SECTIONS}
      rightPanel={rightPanel}
    >
      <SectionBlock id="fundamentals" title="Platform defaults">
        <OwnerFundamentalsCard agent="refund" />
      </SectionBlock>

      <SectionBlock id="policy" title="Refund policy (admin)" description="These limits apply to your store. Ask your admin to change them.">
        <div className="scale-card space-y-3 text-[13px]">
          <div className="flex justify-between border-b border-[#E4E4E8] pb-2">
            <span className="text-[#6B6B80]">Refund window</span>
            <span className="font-medium text-[#1A1A3E]">{p.refundWindowDays} days</span>
          </div>
          <div className="flex justify-between border-b border-[#E4E4E8] pb-2">
            <span className="text-[#6B6B80]">Auto-approve up to</span>
            <span className="font-medium text-[#1A1A3E]">{p.autoApproveMaxDzd.toLocaleString()} DZD</span>
          </div>
          <div className="flex justify-between border-b border-[#E4E4E8] pb-2">
            <span className="text-[#6B6B80]">Proof of purchase</span>
            <span className="font-medium text-[#1A1A3E]">{p.proofOfPurchaseRequired ? 'Required' : 'Optional'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B6B80]">Partial refunds</span>
            <span className="font-medium text-[#1A1A3E]">{p.partialRefundsAllowed ? 'Allowed' : 'Not allowed'}</span>
          </div>
          <InfoBlock>Rule logic (IF / THEN) and API keys are configured by your admin. You tune voice and customer-facing wording below.</InfoBlock>
        </div>
      </SectionBlock>

      <SectionBlock id="personality" title="Tone & prompts">
        <div className="scale-card space-y-4">
          <FieldGroup label="Agent name">
            <input className="scale-input w-48" value={agentName} onChange={e => setAgentName(e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Tone">
            <RadioCards options={TONE_OPTIONS} value={tone} onChange={setTone} />
          </FieldGroup>
          <FieldGroup label="System prompt" help="Stays within admin model and token limits.">
            <div className="relative">
              <textarea className="scale-input w-full" rows={6} value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} />
              <span className="absolute bottom-2 right-2 text-[11px] text-[#9999AA]">{systemPrompt.length}</span>
            </div>
          </FieldGroup>
          <FieldGroup label="Never promise" help="If customer pushes for these, escalate.">
            <TagInput value={forbiddenPhrases} onChange={setForbiddenPhrases} restrictive placeholder="Add + Enter" />
          </FieldGroup>
        </div>
      </SectionBlock>

      <SectionBlock id="messages" title="Customer messages" description="Templates for automated replies; amounts and decisions still follow admin rules.">
        <div className="scale-card space-y-4">
          <FieldGroup label="Manager review SLA text" help="Shown inside hold message as {{owner_response_sla}}">
            <input className="scale-input w-64" value={ownerSla} onChange={e => setOwnerSla(e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Escalation / hold message">
            <textarea className="scale-input w-full" rows={3} value={holdMessage} onChange={e => setHoldMessage(e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Auto-approve confirmation" help="When admin rules allow instant approval.">
            <textarea className="scale-input w-full" rows={2} value={confirmAuto} onChange={e => setConfirmAuto(e.target.value)} />
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
