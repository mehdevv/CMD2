import { useState } from 'react';
import { Plus, GripVertical, X } from 'lucide-react';
import { AgentConfigShell, SectionBlock, FieldGroup } from '@/components/agents/AgentConfigShell';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { OwnerFundamentalsCard } from '@/components/automation/OwnerFundamentalsCard';
import { RadioCards } from '@/components/ui/RadioCards';
import { TagInput } from '@/components/ui/TagInput';
import { InlineDuration } from '@/components/ui/InlineDuration';
import { TimeRange } from '@/components/ui/TimeRange';

const SECTIONS = [
  { id: 'fundamentals', label: 'Platform defaults' },
  { id: 'personality', label: 'Agent & prompts' },
  { id: 'sequence', label: 'Follow-up sequence' },
  { id: 'assignment', label: 'Assignment' },
  { id: 'triggers', label: 'When to start' },
  { id: 'handoff', label: 'Escalation messages' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', desc: 'Formal, respectful' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm, conversational' },
  { value: 'direct', label: 'Direct', desc: 'Short and clear' },
  { value: 'custom', label: 'Custom', desc: 'You define in the prompt' },
];

const MESSAGE_MODES = [
  { value: 'template', label: 'Template', desc: 'Approved template text' },
  { value: 'ai_generated', label: 'Automation draft', desc: 'Uses your instructions + system prompt' },
  { value: 'hybrid', label: 'Hybrid', desc: 'Template + personalized line' },
];

const TRIGGER_OPTIONS = [
  { value: 'new_lead_any', label: 'New lead from any channel' },
  { value: 'new_lead_whatsapp', label: 'New lead from WhatsApp only' },
  { value: 'new_lead_instagram', label: 'New lead from Instagram only' },
  { value: 'new_lead_facebook', label: 'New lead from Facebook only' },
  { value: 'stage_change', label: 'Lead moves to a specific stage' },
  { value: 'tag_added', label: 'A tag is added to the lead' },
];

interface StepState {
  id: number;
  delayValue: number;
  delayUnit: string;
  mode: string;
  template: string;
  instruction: string;
  channels: string[];
  sendFrom: string;
  sendTo: string;
}

function OwnerStepCard({ step, index, onRemove, onChange }: { step: StepState; index: number; onRemove: () => void; onChange: (s: StepState) => void }) {
  const toggleChannel = (c: string) => {
    const next = step.channels.includes(c) ? step.channels.filter(x => x !== c) : [...step.channels, c];
    onChange({ ...step, channels: next });
  };

  return (
    <div className="flex gap-3 mb-3">
      <div className="flex flex-col items-center pt-4">
        <div className="cursor-grab text-[#9999AA]"><GripVertical size={14} /></div>
        <div className="w-px flex-1 mt-2 bg-[#E4E4E8]" />
      </div>
      <div className="flex-1 scale-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-semibold text-[#1A1A3E]">Step {index + 1}</span>
          {index > 0 && (
            <button type="button" onClick={onRemove} className="text-[#9999AA] hover:text-[#DC2626]">
              <X size={14} />
            </button>
          )}
        </div>
        <FieldGroup label="Send after">
          <InlineDuration value={step.delayValue} unit={step.delayUnit} onValueChange={v => onChange({ ...step, delayValue: v })} onUnitChange={u => onChange({ ...step, delayUnit: u })} />
        </FieldGroup>
        <FieldGroup label="Message type">
          <RadioCards options={MESSAGE_MODES} value={step.mode} onChange={v => onChange({ ...step, mode: v })} cols={3} />
        </FieldGroup>
        {(step.mode === 'template' || step.mode === 'hybrid') && (
          <FieldGroup label="Template">
            <select value={step.template} onChange={e => onChange({ ...step, template: e.target.value })} className="scale-input w-full">
              <option value="">Select…</option>
              <option value="welcome">Welcome — Hello {'{{name}}'}</option>
              <option value="followup">Follow-up — Checking in</option>
              <option value="final">Final reminder</option>
            </select>
          </FieldGroup>
        )}
        {(step.mode === 'ai_generated' || step.mode === 'hybrid') && (
          <FieldGroup label="Instruction for this step" help="Combined with your system prompt; stays within admin token limit.">
            <textarea value={step.instruction} onChange={e => onChange({ ...step, instruction: e.target.value })} className="scale-input w-full" rows={3} />
          </FieldGroup>
        )}
        <FieldGroup label="Channels for this step">
          <div className="flex gap-3">
            {['WhatsApp', 'Instagram', 'Facebook'].map(c => (
              <label key={c} className="flex items-center gap-1.5 text-[13px] cursor-pointer">
                <input type="checkbox" checked={step.channels.includes(c)} onChange={() => toggleChannel(c)} className="w-3.5 h-3.5" />
                {c}
              </label>
            ))}
          </div>
        </FieldGroup>
        <FieldGroup label="Send between">
          <TimeRange from={step.sendFrom} to={step.sendTo} onFromChange={v => onChange({ ...step, sendFrom: v })} onToChange={v => onChange({ ...step, sendTo: v })} />
        </FieldGroup>
      </div>
    </div>
  );
}

export default function OwnerAgentFollowUp() {
  const [agentName, setAgentName] = useState('Sara');
  const [tone, setTone] = useState('friendly');
  const [language, setLanguage] = useState('French');
  const [systemPrompt, setSystemPrompt] = useState('You represent our shop. Follow up with leads politely and end with a question.');
  const [forbiddenTopics, setForbiddenTopics] = useState<string[]>(['competitor pricing']);
  const [businessContext, setBusinessContext] = useState('We sell handmade leather goods in Algiers; AOV ~3,500 DZD.');
  const [steps, setSteps] = useState<StepState[]>([
    { id: 1, delayValue: 0, delayUnit: 'minutes', mode: 'template', template: 'welcome', instruction: '', channels: ['WhatsApp'], sendFrom: '08:00', sendTo: '21:00' },
    { id: 2, delayValue: 2, delayUnit: 'hours', mode: 'ai_generated', template: '', instruction: 'Warm check-in about their interest.', channels: ['WhatsApp'], sendFrom: '08:00', sendTo: '21:00' },
  ]);
  const [triggers, setTriggers] = useState<string[]>(['new_lead_any']);
  const [escalationNote, setEscalationNote] = useState('Your team: {{contact_name}} needs help on {{channel}}. {{conversation_link}}');
  const [showTest, setShowTest] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleList = (list: string[], setList: (v: string[]) => void, val: string) => {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  };

  const rightPanel = (
    <AgentStatusPanel
      agentId="owner-followup"
      stats={[
        { label: 'Active sequences', value: '12' },
        { label: 'Reply rate (7d)', value: '34%' },
        { label: 'Last triggered', value: '4 min ago' },
      ]}
      lastEdited="Today"
      onTest={() => setShowTest(true)}
    />
  );

  return (
    <>
      <AgentConfigShell
        agentName="Lead Follow-Up"
        agentPath="/automation/followup"
        agentId="followup"
        overviewHref="/automation"
        overviewLabel="Your automation"
        sections={SECTIONS}
        rightPanel={rightPanel}
      >
        <SectionBlock id="fundamentals" title="Platform defaults" description="Model and limits for your organization.">
          <OwnerFundamentalsCard agent="followup" />
        </SectionBlock>

        <SectionBlock id="personality" title="Agent & prompts" description="How automation represents your business.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Agent name" help="Shown as {{agent_name}} in messages.">
              <input className="scale-input w-48" value={agentName} onChange={e => setAgentName(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Tone">
              <RadioCards options={TONE_OPTIONS} value={tone} onChange={setTone} />
            </FieldGroup>
            <FieldGroup label="Primary language">
              <select className="scale-input w-64" value={language} onChange={e => setLanguage(e.target.value)}>
                {['Arabic', 'French', 'English', 'Arabic + French (Darija)', 'French + English'].map(l => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </FieldGroup>
            <FieldGroup label="System prompt" help="Core instructions for every generated step.">
              <div className="relative">
                <textarea className="scale-input w-full" rows={8} value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} />
                <span className="absolute bottom-2 right-2 text-[11px] text-[#9999AA]">{systemPrompt.length}</span>
              </div>
            </FieldGroup>
            <FieldGroup label="Never discuss" help="If the lead mentions these, hand off to your team.">
              <TagInput value={forbiddenTopics} onChange={setForbiddenTopics} placeholder="Add + Enter" restrictive />
            </FieldGroup>
            <FieldGroup label="Business context" help="What you sell, who you serve — improves message quality.">
              <textarea className="scale-input w-full" rows={4} value={businessContext} onChange={e => setBusinessContext(e.target.value)} />
            </FieldGroup>
          </div>
        </SectionBlock>

        <SectionBlock id="sequence" title="Follow-up sequence" description="Stops when the lead replies. Delays must fit admin limits.">
          {steps.map((step, i) => (
            <OwnerStepCard
              key={step.id}
              step={step}
              index={i}
              onRemove={() => setSteps(prev => prev.filter(s => s.id !== step.id))}
              onChange={updated => setSteps(prev => prev.map(s => (s.id === step.id ? updated : s)))}
            />
          ))}
          <button
            type="button"
            onClick={() => setSteps(prev => [...prev, { id: Date.now(), delayValue: 1, delayUnit: 'day', mode: 'ai_generated', template: '', instruction: '', channels: ['WhatsApp'], sendFrom: '08:00', sendTo: '21:00' }])}
            className="scale-btn-secondary flex items-center gap-2 text-[13px]"
          >
            <Plus size={14} /> Add step
          </button>
        </SectionBlock>

        <SectionBlock id="assignment" title="Assignment" description="How new leads are routed to your sales team.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Assign new leads using">
              <select className="scale-input w-full max-w-md" defaultValue="round_robin">
                <option value="round_robin">Round-robin among my sales team</option>
                <option value="channel">By channel</option>
                <option value="owner">Always assign to me first</option>
              </select>
            </FieldGroup>
          </div>
        </SectionBlock>

        <SectionBlock id="triggers" title="When to start" description="Choose what starts a sequence for your business.">
          <div className="scale-card space-y-3">
            {TRIGGER_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input type="checkbox" checked={triggers.includes(opt.value)} onChange={() => toggleList(triggers, setTriggers, opt.value)} className="w-3.5 h-3.5" />
                {opt.label}
              </label>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock id="handoff" title="Escalation messages" description="Template your team sees when automation escalates.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Internal note template" help="Variables: {{contact_name}}, {{channel}}, {{conversation_link}}, {{escalation_reason}}">
              <textarea className="scale-input w-full" rows={3} value={escalationNote} onChange={e => setEscalationNote(e.target.value)} />
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

      {showTest && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E4E4E8] w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#1A1A3E]">Preview sequence</h3>
              <button type="button" onClick={() => setShowTest(false)} className="text-[#9999AA]">
                <X size={18} />
              </button>
            </div>
            <p className="text-[13px] text-[#6B6B80]">Live simulation uses your admin-configured API key. If testing is disabled, contact your admin.</p>
            <button type="button" onClick={() => setShowTest(false)} className="scale-btn-secondary mt-4 text-[13px]">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
