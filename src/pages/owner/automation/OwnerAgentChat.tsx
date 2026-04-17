import { useState } from 'react';
import { X } from 'lucide-react';
import { AgentConfigShell, SectionBlock, FieldGroup } from '@/components/agents/AgentConfigShell';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { OwnerFundamentalsCard } from '@/components/automation/OwnerFundamentalsCard';
import { RadioCards } from '@/components/ui/RadioCards';
import { TagInput } from '@/components/ui/TagInput';
import { ScaleSlider } from '@/components/ui/ScaleSlider';

const SECTIONS = [
  { id: 'fundamentals', label: 'Platform defaults' },
  { id: 'personality', label: 'Personality & greeting' },
  { id: 'faq', label: 'Knowledge base' },
  { id: 'response_rules', label: 'Response behavior' },
  { id: 'triggers', label: 'When automation replies' },
  { id: 'handoff', label: 'Escalation' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', desc: 'Clear and polite' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm, light emojis' },
  { value: 'direct', label: 'Direct', desc: 'Short answers' },
  { value: 'empathetic', label: 'Empathetic', desc: 'Validate first' },
];

interface FaqEntry {
  q: string;
  a: string;
}

export default function OwnerAgentChat() {
  const [agentName, setAgentName] = useState('Sara');
  const [tone, setTone] = useState('friendly');
  const [emojiUsage, setEmojiUsage] = useState('Minimal — 1 per message max');
  const [language, setLanguage] = useState('Detect from customer and match');
  const [moodAdaptation, setMoodAdaptation] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('You help customers with our products, pricing, and delivery. Be accurate; escalate if unsure.');
  const [openingMessage, setOpeningMessage] = useState("Hi! I'm Sara — how can I help you today?");
  const [forbiddenTopics, setForbiddenTopics] = useState<string[]>(['unauthorized resellers']);
  const [faqEntries, setFaqEntries] = useState<FaqEntry[]>([
    { q: 'Delivery times?', a: '2–4 business days in Algiers, 3–6 elsewhere.' },
    { q: 'Payment methods?', a: 'COD, CCP, Baridimob.' },
  ]);
  const [faqFallback, setFaqFallback] = useState(true);
  const [afterHours, setAfterHours] = useState('Keep automation running 24/7');
  const [autoQualify, setAutoQualify] = useState(false);
  const [qualifyingQ, setQualifyingQ] = useState('What product are you interested in?\nApproximate budget?');
  const [keywordTriggers, setKeywordTriggers] = useState<string[]>(['prix', 'price', 'livraison']);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.55);
  const [complaintKeywords, setComplaintKeywords] = useState<string[]>(['scam', 'problem']);
  const [saved, setSaved] = useState(false);
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const rightPanel = (
    <AgentStatusPanel
      agentId="owner-chat"
      stats={[
        { label: 'Handled today', value: '42' },
        { label: 'Escalation rate', value: '8%' },
        { label: 'Avg response', value: '3s' },
      ]}
      lastEdited="Today"
    />
  );

  return (
    <AgentConfigShell
      agentName="Client Chat"
      agentPath="/automation/chat"
      agentId="chat"
      overviewHref="/automation"
      overviewLabel="Your automation"
      sections={SECTIONS}
      rightPanel={rightPanel}
    >
      <SectionBlock id="fundamentals" title="Platform defaults">
        <OwnerFundamentalsCard agent="chat" />
      </SectionBlock>

      <SectionBlock id="personality" title="Personality & greeting">
        <div className="scale-card space-y-4">
          <div className="flex gap-4 flex-wrap">
            <FieldGroup label="Agent name">
              <input className="scale-input w-40" value={agentName} onChange={e => setAgentName(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Avatar initial">
              <input className="scale-input w-16 text-center" readOnly value={agentName[0] ?? 'S'} maxLength={1} />
            </FieldGroup>
          </div>
          <FieldGroup label="Tone">
            <RadioCards options={TONE_OPTIONS} value={tone} onChange={setTone} />
          </FieldGroup>
          <FieldGroup label="Emoji usage">
            <select className="scale-input w-64" value={emojiUsage} onChange={e => setEmojiUsage(e.target.value)}>
              {['None', 'Minimal — 1 per message max', 'Natural — when appropriate'].map(o => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </FieldGroup>
          <FieldGroup label="Primary language">
            <select className="scale-input w-72" value={language} onChange={e => setLanguage(e.target.value)}>
              {['Arabic', 'French', 'English', 'Detect from customer and match'].map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </FieldGroup>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-[13px] font-medium text-[#1A1A3E]">Adapt mood to customer</div>
              <div className="text-[12px] text-[#9999AA]">Mirror formality and warmth.</div>
            </div>
            <button
              type="button"
              onClick={() => setMoodAdaptation(v => !v)}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ background: moodAdaptation ? '#2B62E8' : '#E4E4E8' }}
            >
              <span className="absolute top-0.5 rounded-full w-4 h-4 bg-white" style={{ left: moodAdaptation ? '22px' : '2px' }} />
            </button>
          </div>
          <FieldGroup label="System prompt">
            <div className="relative">
              <textarea className="scale-input w-full" rows={8} value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} />
              <span className="absolute bottom-2 right-2 text-[11px] text-[#9999AA]">{systemPrompt.length}</span>
            </div>
          </FieldGroup>
          <FieldGroup label="Greeting message">
            <textarea className="scale-input w-full" rows={2} value={openingMessage} onChange={e => setOpeningMessage(e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Never discuss">
            <TagInput value={forbiddenTopics} onChange={setForbiddenTopics} restrictive placeholder="Add + Enter" />
          </FieldGroup>
        </div>
      </SectionBlock>

      <SectionBlock id="faq" title="Knowledge base">
        <div className="scale-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E8]">
            <div>
              <div className="text-[13px] font-medium text-[#1A1A3E]">Use automation when no FAQ match</div>
              <div className="text-[12px] text-[#9999AA]">Uses your system prompt within admin limits.</div>
            </div>
            <button
              type="button"
              onClick={() => setFaqFallback(v => !v)}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ background: faqFallback ? '#2B62E8' : '#E4E4E8' }}
            >
              <span className="absolute top-0.5 rounded-full w-4 h-4 bg-white" style={{ left: faqFallback ? '22px' : '2px' }} />
            </button>
          </div>
          <div className="space-y-3">
            {faqEntries.map((entry, i) => (
              <div key={i} className="border border-[#E4E4E8] rounded-lg p-3">
                <div className="flex justify-between mb-2">
                  <span className="text-[11px] text-[#9999AA]">Q{i + 1}</span>
                  <button type="button" onClick={() => setFaqEntries(prev => prev.filter((_, j) => j !== i))} className="text-[#9999AA] hover:text-[#DC2626]">
                    <X size={12} />
                  </button>
                </div>
                <input className="scale-input w-full mb-2" value={entry.q} onChange={e => setFaqEntries(prev => prev.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} placeholder="Question" />
                <textarea className="scale-input w-full" rows={2} value={entry.a} onChange={e => setFaqEntries(prev => prev.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} placeholder="Answer" />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setFaqEntries(prev => [...prev, { q: '', a: '' }])} className="scale-btn-secondary text-[13px]">
            + Add FAQ
          </button>
        </div>
      </SectionBlock>

      <SectionBlock id="response_rules" title="Response behavior">
        <div className="scale-card space-y-4">
          <FieldGroup label="Max messages without customer reply before escalation">
            <input type="number" className="scale-input w-24" defaultValue={5} />
          </FieldGroup>
          <FieldGroup label="After hours">
            <select className="scale-input w-full" value={afterHours} onChange={e => setAfterHours(e.target.value)}>
              {['Keep automation running 24/7', 'Send after-hours message', 'Pause outside business hours'].map(o => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </FieldGroup>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium text-[#1A1A3E]">Auto-qualify leads</div>
              <div className="text-[12px] text-[#9999AA]">Ask qualifying questions in chat.</div>
            </div>
            <button
              type="button"
              onClick={() => setAutoQualify(v => !v)}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ background: autoQualify ? '#2B62E8' : '#E4E4E8' }}
            >
              <span className="absolute top-0.5 rounded-full w-4 h-4 bg-white" style={{ left: autoQualify ? '22px' : '2px' }} />
            </button>
          </div>
          {autoQualify && (
            <FieldGroup label="Qualifying questions">
              <textarea className="scale-input w-full" rows={3} value={qualifyingQ} onChange={e => setQualifyingQ(e.target.value)} />
            </FieldGroup>
          )}
        </div>
      </SectionBlock>

      <SectionBlock id="triggers" title="When automation replies">
        <div className="scale-card space-y-4">
          <FieldGroup label="Also boost priority when message contains">
            <TagInput value={keywordTriggers} onChange={setKeywordTriggers} examples={['prix', 'order']} />
          </FieldGroup>
          <div className="space-y-2 text-[13px]">
            {['New inbound messages from leads', 'Threads not taken over by a person'].map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                {t}
              </label>
            ))}
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="handoff" title="Escalation">
        <div className="scale-card space-y-4">
          <FieldGroup label="Confidence threshold" help="Below this, prefer human handoff (within admin range).">
            <div className="max-w-md">
              <ScaleSlider value={confidenceThreshold} min={0} max={1} step={0.05} onChange={setConfidenceThreshold} labels={{ left: 'Stricter', right: 'Looser' }} />
            </div>
          </FieldGroup>
          <FieldGroup label="Complaint keywords">
            <TagInput value={complaintKeywords} onChange={setComplaintKeywords} restrictive />
          </FieldGroup>
          <FieldGroup label="Notify template">
            <textarea className="scale-input w-full" rows={2} defaultValue="Help needed: {{contact_name}} — {{channel}} — {{conversation_link}}" />
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
