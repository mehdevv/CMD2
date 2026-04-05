import { useState } from 'react';
import { Plus, GripVertical, X } from 'lucide-react';
import { AgentConfigShell, SectionBlock, FieldGroup } from '@/components/agents/AgentConfigShell';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { LLMConfigSection } from '@/components/agents/LLMConfigSection';
import { RadioCards } from '@/components/ui/RadioCards';
import { TagInput } from '@/components/ui/TagInput';
import { InlineDuration } from '@/components/ui/InlineDuration';
import { TimeRange } from '@/components/ui/TimeRange';

const SECTIONS = [
  { id: 'llm', label: 'LLM configuration' },
  { id: 'personality', label: 'Agent personality' },
  { id: 'sequence', label: 'Follow-up sequence' },
  { id: 'assignment', label: 'Assignment rules' },
  { id: 'triggers', label: 'Triggers' },
  { id: 'handoff', label: 'Human intervention' },
  { id: 'metrics', label: 'Tracked metrics' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', desc: 'Formal, respectful, clear' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm, conversational, approachable' },
  { value: 'direct', label: 'Direct', desc: 'Short, no fluff, gets to the point' },
  { value: 'custom', label: 'Custom', desc: 'Define your own tone below' },
];

const MESSAGE_MODES = [
  { value: 'template', label: 'Fixed template', desc: 'Use an approved template. Required for WhatsApp first contact.' },
  { value: 'ai_generated', label: 'Automation generated', desc: 'Agent writes the message using the system prompt and conversation context.' },
  { value: 'hybrid', label: 'Template + personalization', desc: 'Start with a template, personalize the last sentence.' },
];

const TRIGGER_OPTIONS = [
  { value: 'new_lead_any', label: 'New lead added from any channel' },
  { value: 'new_lead_whatsapp', label: 'New lead added via WhatsApp only' },
  { value: 'new_lead_instagram', label: 'New lead added via Instagram only' },
  { value: 'new_lead_facebook', label: 'New lead added via Facebook only' },
  { value: 'stage_change', label: 'Lead moves to a specific stage' },
  { value: 'manual_trigger', label: 'Agent manually triggers from lead record' },
  { value: 'tag_added', label: 'A specific tag is added to the lead' },
];

const ESCALATION_OPTIONS = [
  { value: 'negative_sentiment', label: 'Customer message has negative sentiment' },
  { value: 'complaint_keyword', label: 'Customer uses a complaint keyword' },
  { value: 'out_of_scope', label: 'Confidence is low — question outside scope' },
  { value: 'asks_for_human', label: 'Customer explicitly asks for a person' },
  { value: 'price_negotiation', label: 'Customer asks to negotiate price' },
  { value: 'high_value', label: 'Lead deal value exceeds threshold' },
  { value: 'no_reply_after_sequence', label: 'Full sequence completed with no reply' },
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
  stopConditions: string[];
}

const STOP_CONDITIONS = [
  'Lead replied to any previous step',
  'Lead was manually marked as Contacted',
  'Agent has taken over the conversation',
  'Lead was marked as Lost',
];

function StepCard({ step, index, onRemove, onChange }: { step: StepState; index: number; onRemove: () => void; onChange: (s: StepState) => void }) {
  const toggleChannel = (c: string) => {
    const next = step.channels.includes(c) ? step.channels.filter(x => x !== c) : [...step.channels, c];
    onChange({ ...step, channels: next });
  };
  const toggleStop = (c: string) => {
    const next = step.stopConditions.includes(c) ? step.stopConditions.filter(x => x !== c) : [...step.stopConditions, c];
    onChange({ ...step, stopConditions: next });
  };

  return (
    <div className="flex gap-3 mb-3">
      <div className="flex flex-col items-center pt-4">
        <div className="cursor-grab text-[#9999AA] hover:text-[#6B6B80]"><GripVertical size={14} /></div>
        <div className="w-px flex-1 mt-2 bg-[#E4E4E8]" />
      </div>
      <div className="flex-1 scale-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-semibold text-[#1A1A3E]">Step {index + 1}</span>
          {index > 0 && <button onClick={onRemove} className="text-[#9999AA] hover:text-[#DC2626]"><X size={14} /></button>}
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
              <option value="">Select a template…</option>
              <option value="welcome">Welcome — Hello {'{{name}}'}</option>
              <option value="followup">Follow-up — Checking in on your interest</option>
              <option value="final">Final reminder — Last message</option>
            </select>
          </FieldGroup>
        )}

        {(step.mode === 'ai_generated' || step.mode === 'hybrid') && (
          <FieldGroup label="Message instruction" help="Step-specific instruction combined with the system prompt.">
            <textarea value={step.instruction} onChange={e => onChange({ ...step, instruction: e.target.value })} className="scale-input w-full" rows={3} placeholder="Remind the lead about the product they asked about. End with a question." />
          </FieldGroup>
        )}

        <FieldGroup label="Send on" help="If the lead came from Instagram, only Instagram will be used.">
          <div className="flex gap-3">
            {['WhatsApp', 'Instagram', 'Facebook'].map(c => (
              <label key={c} className="flex items-center gap-1.5 text-[13px] text-[#1A1A3E] cursor-pointer">
                <input type="checkbox" checked={step.channels.includes(c)} onChange={() => toggleChannel(c)} className="w-3.5 h-3.5" />
                {c}
              </label>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Only send between" help="If delay lands outside this window, it shifts to the next valid time.">
          <TimeRange from={step.sendFrom} to={step.sendTo} onFromChange={v => onChange({ ...step, sendFrom: v })} onToChange={v => onChange({ ...step, sendTo: v })} />
        </FieldGroup>

        <FieldGroup label="Stop this step if">
          <div className="space-y-1.5">
            {STOP_CONDITIONS.map(c => (
              <label key={c} className="flex items-start gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                <input type="checkbox" checked={step.stopConditions.includes(c)} onChange={() => toggleStop(c)} className="mt-0.5 w-3.5 h-3.5 flex-shrink-0" />
                {c}
              </label>
            ))}
          </div>
        </FieldGroup>
      </div>
    </div>
  );
}

interface TestModalProps {
  onClose: () => void;
}

function TestModal({ onClose }: TestModalProps) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('WhatsApp');
  const [message, setMessage] = useState('');
  const [ran, setRan] = useState(false);

  const simulate = () => { if (name && message) setRan(true); };

  const steps = [
    { delay: 'Immediately', text: `Hi ${name || '[Name]'}! 👋 Merci pour votre intérêt. Je suis Sara, assistante de l'équipe commerciale. Comment puis-je vous aider?` },
    { delay: '2 hours', text: `Bonjour ${name || '[Name]'}, je voulais simplement vérifier si vous avez eu le temps de réfléchir à notre offre. Des questions?` },
    { delay: '1 day', text: `${name || '[Name]'}, notre stock est limité cette semaine. Souhaitez-vous qu'on discute de votre commande?` },
    { delay: '3 days', text: `Dernier message de notre part, ${name || '[Name]'}. Si jamais vous changez d'avis, n'hésitez pas à nous recontacter. 🙏` },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E8]">
          <h3 className="text-[15px] font-semibold text-[#1A1A3E]">Test Follow-Up Agent</h3>
          <button onClick={onClose} className="text-[#9999AA] hover:text-[#1A1A3E]"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          {!ran ? (
            <>
              <FieldGroup label="Contact name">
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="scale-input" placeholder="e.g. Fatima Benali" />
              </FieldGroup>
              <FieldGroup label="Channel">
                <select value={channel} onChange={e => setChannel(e.target.value)} className="scale-input w-40">
                  {['WhatsApp', 'Instagram', 'Facebook'].map(c => <option key={c}>{c}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Opening message">
                <textarea value={message} onChange={e => setMessage(e.target.value)} className="scale-input" rows={2} placeholder="Bonjour, je suis intéressé par votre produit" />
              </FieldGroup>
              <button onClick={simulate} disabled={!name || !message} className="scale-btn-primary w-full justify-center">Simulate sequence</button>
            </>
          ) : (
            <div>
              <p className="text-[13px] text-[#6B6B80] mb-4">Sequence that would run for <strong>{name}</strong> via <strong>{channel}</strong>:</p>
              <div className="space-y-0">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-[#2B62E8] text-white text-[11px] flex items-center justify-center flex-shrink-0">{i + 1}</div>
                      {i < steps.length - 1 && <div className="w-px flex-1 bg-[#E4E4E8] my-1" />}
                    </div>
                    <div className="pb-4">
                      <div className="text-[11px] text-[#9999AA] mb-1">{s.delay}</div>
                      <div className="bg-[#F7F7F8] rounded-lg p-2.5 text-[13px] text-[#1A1A3E]">{s.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setRan(false)} className="scale-btn-secondary w-full justify-center mt-2">Test again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminAgentFollowUp() {
  const [llmConfig, setLlmConfig] = useState({
    provider: 'OpenAI', apiKey: '', model: 'gpt-4o-mini', temperature: 0.4, maxTokens: 180,
  });
  const [agentName, setAgentName] = useState('Sara');
  const [tone, setTone] = useState('friendly');
  const [language, setLanguage] = useState('French');
  const [systemPrompt, setSystemPrompt] = useState('You are Sara, a friendly sales assistant. Follow up with leads who expressed interest in our products. Keep messages short and natural. Always end with a question to keep the conversation going.');
  const [forbiddenTopics, setForbiddenTopics] = useState<string[]>(['competitor pricing', 'delivery guarantees']);
  const [businessContext, setBusinessContext] = useState('');
  const [steps, setSteps] = useState<StepState[]>([
    { id: 1, delayValue: 0, delayUnit: 'minutes', mode: 'template', template: '', instruction: '', channels: ['WhatsApp'], sendFrom: '08:00', sendTo: '21:00', stopConditions: ['Lead replied to any previous step'] },
    { id: 2, delayValue: 2, delayUnit: 'hours', mode: 'ai_generated', template: '', instruction: 'Follow up warmly, reference their earlier interest.', channels: ['WhatsApp', 'Instagram'], sendFrom: '08:00', sendTo: '21:00', stopConditions: ['Lead replied to any previous step'] },
  ]);
  const [triggers, setTriggers] = useState<string[]>(['new_lead_any']);
  const [escalations, setEscalations] = useState<string[]>(['negative_sentiment', 'asks_for_human']);
  const [complaintKeywords, setComplaintKeywords] = useState<string[]>(['scam', 'fraud', 'problem']);
  const [showTest, setShowTest] = useState(false);
  const [saved, setSaved] = useState(false);

  const addStep = () => {
    setSteps(prev => [...prev, { id: Date.now(), delayValue: 1, delayUnit: 'day', mode: 'ai_generated', template: '', instruction: '', channels: ['WhatsApp'], sendFrom: '08:00', sendTo: '21:00', stopConditions: ['Lead replied to any previous step'] }]);
  };

  const toggleList = (list: string[], setList: (v: string[]) => void, val: string) => {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  };

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const rightPanel = (
    <AgentStatusPanel
      agentId="followup"
      stats={[
        { label: 'Active sequences', value: '12' },
        { label: 'Reply rate (7d)', value: '34%' },
        { label: 'Avg steps to reply', value: '2.1' },
        { label: 'Last triggered', value: '4 min ago' },
      ]}
      lastEdited="2 hours ago"
      onTest={() => setShowTest(true)}
    />
  );

  return (
    <>
      <AgentConfigShell agentName="Lead Follow-Up Agent" agentPath="/admin/agents/followup" sections={SECTIONS} rightPanel={rightPanel}>
        <LLMConfigSection config={llmConfig} onChange={setLlmConfig} />

        {/* Personality */}
        <SectionBlock id="personality" title="Agent personality" description="Define how the agent sounds. This becomes part of the system prompt.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Agent name" help="The name the agent introduces itself as. Used in {{agent_name}} variable.">
              <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)} className="scale-input w-48" placeholder="e.g. Sara" />
            </FieldGroup>
            <FieldGroup label="Tone">
              <RadioCards options={TONE_OPTIONS} value={tone} onChange={setTone} />
            </FieldGroup>
            <FieldGroup label="Primary language" help="The agent will generate messages in this language by default.">
              <select value={language} onChange={e => setLanguage(e.target.value)} className="scale-input w-64">
                {['Arabic', 'French', 'English', 'Arabic + French (Darija mix)', 'French + English'].map(l => <option key={l}>{l}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="System prompt" help="Sent to the model before every message. Be specific about your business.">
              <div className="relative">
                <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} className="scale-input w-full" rows={8} />
                <span className="absolute bottom-2 right-2 text-[11px] text-[#9999AA]">{systemPrompt.length}</span>
              </div>
            </FieldGroup>
            <FieldGroup label="Never discuss" help="Topics the agent must never bring up. If mentioned by customer, agent escalates.">
              <TagInput value={forbiddenTopics} onChange={setForbiddenTopics} placeholder="Add topic and press Enter" examples={['competitor pricing', 'delivery guarantees', 'refund terms']} restrictive />
            </FieldGroup>
            <FieldGroup label="Business context" help="Background the model uses to make messages relevant.">
              <textarea value={businessContext} onChange={e => setBusinessContext(e.target.value)} className="scale-input w-full" rows={4} placeholder="We sell handmade leather bags. Our customers are mostly 25–45 year old women. Average order value is 3,500 DZD. We operate in Algiers and ship nationwide." />
            </FieldGroup>
          </div>
        </SectionBlock>

        {/* Sequence builder */}
        <SectionBlock id="sequence" title="Follow-up sequence" description="Define the exact steps the agent runs after a new lead comes in. The sequence stops the moment the lead replies.">
          {steps.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              onRemove={() => setSteps(prev => prev.filter(s => s.id !== step.id))}
              onChange={updated => setSteps(prev => prev.map(s => s.id === step.id ? updated : s))}
            />
          ))}
          <button onClick={addStep} className="scale-btn-secondary flex items-center gap-2 text-[13px]">
            <Plus size={14} /> Add step
          </button>

          <div className="scale-card mt-5">
            <h4 className="text-[13px] font-semibold text-[#1A1A3E] mb-4">Sequence settings</h4>
            <div className="space-y-3">
              <FieldGroup label="Max steps before stopping" help="Even if lead never replies, stop after this many messages.">
                <input type="number" defaultValue={4} className="scale-input w-24" />
              </FieldGroup>
              <FieldGroup label="Global send window">
                <TimeRange from="08:00" to="21:00" onFromChange={() => {}} onToChange={() => {}} />
              </FieldGroup>
              <FieldGroup label="Timezone">
                <select defaultValue="Africa/Algiers" className="scale-input w-56">
                  <option>Africa/Algiers</option>
                  <option>Europe/Paris</option>
                  <option>UTC</option>
                </select>
              </FieldGroup>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-[#1A1A3E]">Send on weekends</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-[#1A1A3E]">Restart if lead re-engages after 30 days</div>
                </div>
                <input type="checkbox" className="w-4 h-4" />
              </div>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock id="assignment" title="Assignment rules" description="How new leads are assigned when the sequence runs.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Assign leads using">
              <select className="scale-input w-full max-w-md" defaultValue="round_robin">
                <option value="round_robin">Round-robin across all active sales</option>
                <option value="channel">By source channel (route map below)</option>
                <option value="territory">By territory / tag rules</option>
                <option value="default">Always assign to default pool owner</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Default assignee pool" help="When strategy needs a fallback.">
              <select className="scale-input w-full max-w-md">
                <option>All sales — round robin</option>
                <option>Mehdi Kaci only</option>
                <option>Owner + agents (weighted)</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Re-assign if sales has paused automation" help="Skip assignees who turned off automation on their queue.">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </FieldGroup>
          </div>
        </SectionBlock>

        {/* Triggers */}
        <SectionBlock id="triggers" title="Triggers" description="Define exactly when the follow-up sequence starts.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Start sequence when">
              <div className="space-y-2">
                {TRIGGER_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                    <input type="checkbox" checked={triggers.includes(opt.value)} onChange={() => toggleList(triggers, setTriggers, opt.value)} className="w-3.5 h-3.5 flex-shrink-0" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </FieldGroup>
            {triggers.includes('stage_change') && (
              <FieldGroup label="Stage to trigger on">
                <select className="scale-input w-48">
                  {['New', 'Contacted', 'Qualified', 'Proposal'].map(s => <option key={s}>{s}</option>)}
                </select>
              </FieldGroup>
            )}
            {triggers.includes('tag_added') && (
              <FieldGroup label="Tag to trigger on">
                <input type="text" className="scale-input w-48" placeholder="e.g. hot-lead, re-engage" />
              </FieldGroup>
            )}
            <FieldGroup label="Do not trigger if">
              <div className="space-y-2">
                {['Lead already has an active sequence', 'Lead was contacted in the last 24 hours', 'Lead is assigned to an agent who has paused automation', 'Lead is marked as Unsubscribed or Blocked'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                    <input type="checkbox" defaultChecked={opt.includes('Unsubscribed')} className="w-3.5 h-3.5 flex-shrink-0" />
                    {opt}
                  </label>
                ))}
              </div>
            </FieldGroup>
          </div>
        </SectionBlock>

        {/* Human intervention */}
        <SectionBlock id="handoff" title="Human intervention" description="Define when the agent stops and a person is notified.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Escalate to human when">
              <div className="space-y-2">
                {ESCALATION_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                    <input type="checkbox" checked={escalations.includes(opt.value)} onChange={() => toggleList(escalations, setEscalations, opt.value)} className="w-3.5 h-3.5 flex-shrink-0" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Complaint keywords" help="Any of these in a customer message will immediately pause the agent.">
              <TagInput value={complaintKeywords} onChange={setComplaintKeywords} examples={['scam', 'fraud', 'problem', 'angry']} restrictive />
            </FieldGroup>
            {escalations.includes('high_value') && (
              <FieldGroup label="High-value deal threshold">
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={10000} className="scale-input w-32" />
                  <span className="text-[13px] text-[#6B6B80]">DZD</span>
                </div>
              </FieldGroup>
            )}
            <FieldGroup label="Notify via">
              <div className="space-y-1.5">
                {['In-app notification (bell icon)', 'Email', 'WhatsApp message to agent'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                    <input type="checkbox" defaultChecked={opt.includes('In-app')} className="w-3.5 h-3.5" />
                    {opt}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Notification message template" help="Variables: {{contact_name}}, {{escalation_reason}}, {{conversation_link}}, {{agent_name}}, {{channel}}">
              <textarea className="scale-input w-full" rows={2} defaultValue="URGENT: {{contact_name}} needs human help. Reason: {{escalation_reason}}. Open: {{conversation_link}}" />
            </FieldGroup>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-[13px] font-medium text-[#1A1A3E]">Pause agent after escalation</div>
                <div className="text-[12px] text-[#9999AA]">If off, the agent continues sending the next scheduled step.</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
          </div>
        </SectionBlock>

        <SectionBlock id="metrics" title="Tracked metrics" description="KPIs for this agent (connected to analytics when available).">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Sequence completion rate', value: '68%', hint: 'Reached final step or goal' },
              { label: 'Reply rate per step', value: 'Step1 41% · Step2 22%', hint: 'Last 7 days' },
              { label: 'Avg time to first response', value: '3h 12m', hint: 'After first outbound' },
            ].map(m => (
              <div key={m.label} className="scale-card">
                <div className="text-[11px] text-[#9999AA] uppercase tracking-wide mb-1">{m.label}</div>
                <div className="text-[22px] font-semibold text-[#1A1A3E]">{m.value}</div>
                <div className="text-[12px] text-[#6B6B80] mt-1">{m.hint}</div>
              </div>
            ))}
          </div>
        </SectionBlock>

        {/* Save bar */}
        <div className="sticky bottom-0 bg-white border-t border-[#E4E4E8] -mx-10 px-10 py-4 flex items-center justify-between">
          <span className="text-[13px] text-[#16A34A]">{saved ? '✓ Changes saved' : ''}</span>
          <button onClick={save} className="scale-btn-primary">Save changes</button>
        </div>
      </AgentConfigShell>

      {showTest && <TestModal onClose={() => setShowTest(false)} />}
    </>
  );
}
