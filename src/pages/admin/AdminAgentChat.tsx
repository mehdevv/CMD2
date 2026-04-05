import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { AgentConfigShell, SectionBlock, FieldGroup } from '@/components/agents/AgentConfigShell';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { LLMConfigSection } from '@/components/agents/LLMConfigSection';
import { RadioCards } from '@/components/ui/RadioCards';
import { TagInput } from '@/components/ui/TagInput';
import { ScaleSlider } from '@/components/ui/ScaleSlider';
import type { LLMConfig } from '@/components/agents/LLMConfigSection';

const SECTIONS = [
  { id: 'llm', label: 'LLM configuration' },
  { id: 'personality', label: 'Personality & mood' },
  { id: 'faq', label: 'Knowledge base' },
  { id: 'response_rules', label: 'Response rules' },
  { id: 'triggers', label: 'Triggers' },
  { id: 'handoff', label: 'Human intervention' },
  { id: 'metrics', label: 'Tracked metrics' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', desc: 'Clear, respectful, no slang' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm, uses light emojis, casual phrasing' },
  { value: 'direct', label: 'Direct', desc: 'Short answers, no filler, efficient' },
  { value: 'empathetic', label: 'Empathetic', desc: 'Validates customer feelings before answering' },
];

const ESCALATION_OPTIONS = [
  'Customer explicitly asks for a person',
  'Negative sentiment detected',
  'Complaint keyword detected',
  'Customer sends an image or document',
  'Confidence below threshold',
  'Max consecutive automation messages reached',
  'Customer asks about refund or return',
  'Customer mentions a specific order number',
  'Conversation idle for more than X minutes after agent message',
];

interface FaqEntry { q: string; a: string; }

function ChatTestModal({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{ from: 'user' | 'agent'; text: string; confidence?: number }[]>([
    { from: 'agent', text: "Hi! 👋 I'm Sara, your assistant. How can I help you today?", confidence: 0.98 },
  ]);
  const [input, setInput] = useState('');

  const MOCK_REPLIES: Record<string, string> = {
    default: "That's a great question! Let me check that for you. Could you give me a moment?",
    prix: "Our prices start at 3,500 DZD for standard orders. Would you like more details about what's included?",
    price: "Our prices start at 3,500 DZD for standard orders. Would you like more details about what's included?",
    livraison: "We deliver nationwide — typically 2–4 business days for Algiers and 3–6 for other wilayas. 📦",
    delivery: "We deliver nationwide — typically 2–4 business days for Algiers and 3–6 for other wilayas. 📦",
    human: "Of course! Let me connect you with a team member right away. They'll be with you shortly.",
    agent: "Of course! Let me connect you with a team member right away. They'll be with you shortly.",
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user' as const, text: input };
    const lc = input.toLowerCase();
    const replyText = Object.entries(MOCK_REPLIES).find(([k]) => lc.includes(k))?.[1] ?? MOCK_REPLIES.default;
    const agentMsg = { from: 'agent' as const, text: replyText, confidence: 0.72 + Math.random() * 0.25 };
    setMessages(prev => [...prev, userMsg, agentMsg]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm w-full max-w-lg flex flex-col" style={{ height: 540 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E8]">
          <h3 className="text-[15px] font-semibold text-[#1A1A3E]">Test Chat Agent</h3>
          <button onClick={onClose} className="text-[#9999AA] hover:text-[#1A1A3E]"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-[13px] ${m.from === 'user' ? 'bg-[#2B62E8] text-white' : 'bg-[#F7F7F8] text-[#1A1A3E]'}`}>
                {m.text}
                {m.from === 'agent' && m.confidence !== undefined && (
                  <div className="text-[10px] mt-1 opacity-60">Confidence: {Math.round(m.confidence * 100)}%</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-[#E4E4E8] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            className="scale-input flex-1"
            placeholder="Type a customer message…"
          />
          <button onClick={send} className="scale-btn-primary px-3"><Send size={14} /></button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAgentChat() {
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: 'OpenAI',
    apiKey: '',
    model: 'gpt-4o',
    temperature: 0.5,
    maxTokens: 200,
    responseTimeout: 8,
    holdingMessage: "Just a moment, let me check that for you! 🙏",
  });
  const [agentName, setAgentName] = useState('Sara');
  const [tone, setTone] = useState('friendly');
  const [language, setLanguage] = useState('Detect from customer and match');
  const [emojiUsage, setEmojiUsage] = useState('Minimal — 1 per message max');
  const [moodAdaptation, setMoodAdaptation] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState("You are Sara, a customer support assistant. You help customers with questions about our products, pricing, availability, and delivery. You are friendly but professional. Always answer accurately — if you don't know something, say so and offer to connect the customer with a team member.");
  const [openingMessage, setOpeningMessage] = useState("Hi! 👋 I'm Sara, your assistant. How can I help you today?");
  const [faqEntries, setFaqEntries] = useState<FaqEntry[]>([
    { q: 'What are your delivery times?', a: '2–4 business days for Algiers, 3–6 days for other wilayas.' },
    { q: 'What payment methods do you accept?', a: 'Cash on delivery, CCP transfer, and Baridimob.' },
    { q: 'Can I return a product?', a: 'Yes, within 7 days of delivery if unused and in original packaging.' },
    { q: 'Do you ship to all wilayas?', a: 'Yes, we deliver nationwide across all 58 wilayas.' },
  ]);
  const [autoQualify, setAutoQualify] = useState(true);
  const [qualifyingQ, setQualifyingQ] = useState("What product are you interested in?\nWhat's your approximate budget?\nIs this for personal use or business?");
  const [keywordTriggers, setKeywordTriggers] = useState<string[]>(['prix', 'order', 'livraison', 'available', 'كم', 'سعر']);
  const [escalations, setEscalations] = useState<string[]>(['Customer explicitly asks for a person', 'Negative sentiment detected', 'Customer asks about refund or return']);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);
  const [complaintKeywords, setComplaintKeywords] = useState<string[]>(['scam', 'fraud', 'problem']);
  const [afterHours, setAfterHours] = useState('Keep agent running 24/7');
  const [faqFallback, setFaqFallback] = useState(true);
  const [forbiddenTopics, setForbiddenTopics] = useState<string[]>(['competitor pricing', 'unofficial resellers']);
  const [showTest, setShowTest] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const rightPanel = (
    <AgentStatusPanel
      agentId="chat"
      stats={[
        { label: 'Messages today', value: '42' },
        { label: 'Active conversations', value: '7' },
        { label: 'Escalation rate (7d)', value: '8%' },
        { label: 'Avg response time', value: '3s' },
      ]}
      lastEdited="1 day ago"
      onTest={() => setShowTest(true)}
    />
  );

  return (
    <>
      <AgentConfigShell agentName="Client Chat Agent" agentPath="/admin/agents/chat" sections={SECTIONS} rightPanel={rightPanel}>
        <LLMConfigSection config={llmConfig} onChange={setLlmConfig} showChatExtras />

        <SectionBlock id="personality" title="Personality & mood" description="Define the agent's voice, tone, and emotional style.">
          <div className="scale-card space-y-4">
            <div className="flex gap-4">
              <FieldGroup label="Agent name" help="Name shown in conversations.">
                <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)} className="scale-input w-40" placeholder="Sara" />
              </FieldGroup>
              <FieldGroup label="Avatar initial" help="Single letter shown in chat interface.">
                <input type="text" value={agentName[0] ?? 'S'} readOnly className="scale-input w-16 text-center" maxLength={1} />
              </FieldGroup>
            </div>
            <FieldGroup label="Tone">
              <RadioCards options={TONE_OPTIONS} value={tone} onChange={setTone} />
            </FieldGroup>
            <FieldGroup label="Emoji usage">
              <select value={emojiUsage} onChange={e => setEmojiUsage(e.target.value)} className="scale-input w-64">
                {['None — never use emojis', 'Minimal — 1 per message max', 'Natural — when appropriate'].map(o => <option key={o}>{o}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Primary language">
              <select value={language} onChange={e => setLanguage(e.target.value)} className="scale-input w-72">
                {['Arabic', 'French', 'English', 'Arabic + French (Darija mix)', 'French + English', 'Detect from customer and match'].map(l => <option key={l}>{l}</option>)}
              </select>
            </FieldGroup>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-[13px] font-medium text-[#1A1A3E]">Adapt mood to customer</div>
                <div className="text-[12px] text-[#9999AA]">Mirror the customer's energy — more formal if formal, warmer if casual.</div>
              </div>
              <button onClick={() => setMoodAdaptation(v => !v)} className="relative w-10 h-5 rounded-full transition-colors" style={{ background: moodAdaptation ? '#2B62E8' : '#E4E4E8' }}>
                <span className="absolute top-0.5 rounded-full w-4 h-4 bg-white transition-transform" style={{ left: moodAdaptation ? '22px' : '2px' }} />
              </button>
            </div>
            <FieldGroup label="System prompt" help="Core instructions. This runs before every single message. Be specific.">
              <div className="relative">
                <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} className="scale-input w-full" rows={10} />
                <span className="absolute bottom-2 right-2 text-[11px] text-[#9999AA]">{systemPrompt.length}</span>
              </div>
            </FieldGroup>
            <FieldGroup label="Greeting message" help="Sent automatically when a customer opens a conversation for the first time.">
              <textarea value={openingMessage} onChange={e => setOpeningMessage(e.target.value)} className="scale-input w-full" rows={2} />
            </FieldGroup>
            <FieldGroup label="Never discuss" help="If the customer brings these up, escalate to a person.">
              <TagInput value={forbiddenTopics} onChange={setForbiddenTopics} placeholder="Add topic + Enter" restrictive examples={['legal threat']} />
            </FieldGroup>
          </div>
        </SectionBlock>

        <SectionBlock id="faq" title="Knowledge base" description="Pre-loaded answers to common questions. The agent matches customer questions and uses these as ground truth.">
          <div className="scale-card">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E4E4E8]">
              <div>
                <div className="text-[13px] font-medium text-[#1A1A3E]">Use automation when no FAQ match</div>
                <div className="text-[12px] text-[#9999AA]">If off, send a fallback message and escalate instead of generating an answer.</div>
              </div>
              <button type="button" onClick={() => setFaqFallback(v => !v)} className="relative w-10 h-5 rounded-full transition-colors" style={{ background: faqFallback ? '#2B62E8' : '#E4E4E8' }}>
                <span className="absolute top-0.5 rounded-full w-4 h-4 bg-white transition-transform" style={{ left: faqFallback ? '22px' : '2px' }} />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              {faqEntries.map((entry, i) => (
                <div key={i} className="border border-[#E4E4E8] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-[#9999AA] uppercase tracking-wide">Q{i + 1}</span>
                    <button onClick={() => setFaqEntries(prev => prev.filter((_, j) => j !== i))} className="text-[#9999AA] hover:text-[#DC2626]"><X size={12} /></button>
                  </div>
                  <input type="text" value={entry.q} onChange={e => setFaqEntries(prev => prev.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} className="scale-input w-full mb-2" placeholder="Question" />
                  <textarea value={entry.a} onChange={e => setFaqEntries(prev => prev.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} className="scale-input w-full" rows={2} placeholder="Answer" />
                </div>
              ))}
            </div>
            <button onClick={() => setFaqEntries(prev => [...prev, { q: '', a: '' }])} className="scale-btn-secondary flex items-center gap-2 text-[13px]">
              + Add FAQ entry
            </button>
          </div>
        </SectionBlock>

        <SectionBlock id="response_rules" title="Response rules" description="Define specific guardrails for how the agent responds.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Max consecutive automation messages" help="If agent sends this many messages without a reply, escalate to human.">
              <input type="number" defaultValue={5} className="scale-input w-24" />
            </FieldGroup>
            <FieldGroup label="When customer sends an image or file">
              <select defaultValue="Acknowledge and escalate to human" className="scale-input w-full">
                {['Acknowledge and escalate to human', "Acknowledge only: 'Thanks, a team member will review this'", 'Ignore silently'].map(o => <option key={o}>{o}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="After hours">
              <select value={afterHours} onChange={e => setAfterHours(e.target.value)} className="scale-input w-full">
                {['Keep agent running 24/7', 'Send an after-hours message + queue for morning', 'Disable agent outside business hours'].map(o => <option key={o}>{o}</option>)}
              </select>
            </FieldGroup>
            {afterHours !== 'Keep agent running 24/7' && (
              <FieldGroup label="After-hours message">
                <input type="text" className="scale-input w-full" defaultValue="We're currently closed. We'll get back to you first thing tomorrow morning! 🌙" />
              </FieldGroup>
            )}
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-[13px] font-medium text-[#1A1A3E]">Auto-qualify leads</div>
                <div className="text-[12px] text-[#9999AA]">Agent asks qualifying questions and moves the lead stage based on answers.</div>
              </div>
              <button onClick={() => setAutoQualify(v => !v)} className="relative w-10 h-5 rounded-full transition-colors" style={{ background: autoQualify ? '#2B62E8' : '#E4E4E8' }}>
                <span className="absolute top-0.5 rounded-full w-4 h-4 bg-white transition-transform" style={{ left: autoQualify ? '22px' : '2px' }} />
              </button>
            </div>
            {autoQualify && (
              <FieldGroup label="Qualifying questions" help="Agent weaves these into the conversation naturally. Order matters.">
                <textarea value={qualifyingQ} onChange={e => setQualifyingQ(e.target.value)} className="scale-input w-full" rows={4} />
              </FieldGroup>
            )}
          </div>
        </SectionBlock>

        <SectionBlock id="triggers" title="Triggers" description="When the chat agent activates and how it handles incoming messages.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Agent responds to">
              <div className="space-y-2">
                {['All inbound messages from new contacts', 'All inbound messages from existing leads', 'Only messages on conversations not owned by a person', 'Only during business hours'].map(o => (
                  <label key={o} className="flex items-center gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                    <input type="checkbox" defaultChecked={o.includes('new contacts') || o.includes('existing leads')} className="w-3.5 h-3.5" />
                    {o}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Instant-response keywords" help="When these appear in a message, respond immediately.">
              <TagInput value={keywordTriggers} onChange={setKeywordTriggers} examples={['price', 'order', 'delivery', 'available', 'كم', 'سعر']} />
            </FieldGroup>
            <FieldGroup label="Move lead to stage when customer replies">
              <select defaultValue="Contacted" className="scale-input w-40">
                {['No change', 'Contacted', 'Qualified'].map(o => <option key={o}>{o}</option>)}
              </select>
            </FieldGroup>
          </div>
        </SectionBlock>

        <SectionBlock id="handoff" title="Human intervention" description="When the agent stops and escalates to a person.">
          <div className="scale-card space-y-4">
            <FieldGroup label="Escalate when">
              <div className="space-y-2">
                {ESCALATION_OPTIONS.map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                    <input type="checkbox" checked={escalations.includes(opt)} onChange={() => setEscalations(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])} className="w-3.5 h-3.5 flex-shrink-0" />
                    {opt}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Confidence threshold" help="Below this score, reply is flagged as uncertain and escalated.">
              <div className="w-64">
                <ScaleSlider value={confidenceThreshold} min={0} max={1} step={0.05} onChange={setConfidenceThreshold} labels={{ left: 'Low', right: 'High' }} />
              </div>
            </FieldGroup>
            <FieldGroup label="Complaint keywords">
              <TagInput value={complaintKeywords} onChange={setComplaintKeywords} examples={['scam', 'fraud', 'problem', 'angry']} restrictive />
            </FieldGroup>
            <FieldGroup label="Escalate if customer doesn't reply after">
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={30} className="scale-input w-24" />
                <span className="text-[13px] text-[#6B6B80]">minutes</span>
              </div>
            </FieldGroup>
            <FieldGroup label="Notify via">
              <div className="space-y-1.5">
                {['In-app notification', 'Email', 'WhatsApp to agent'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                    <input type="checkbox" defaultChecked={opt.includes('In-app')} className="w-3.5 h-3.5" />
                    {opt}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Notification text">
              <textarea className="scale-input w-full" rows={2} defaultValue="⚡ Human needed: {{contact_name}} on {{channel}} — {{escalation_reason}}" />
            </FieldGroup>
          </div>
        </SectionBlock>

        <SectionBlock id="metrics" title="Tracked metrics" description="Performance for Client Chat (sample values).">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Questions answered by automation', value: '214 / 248', hint: 'Last 7 days' },
              { label: 'Escalation rate', value: '8%', hint: '→ human takeover' },
              { label: 'Avg resolution time', value: '2m 18s', hint: 'Automation-handled threads' },
            ].map(m => (
              <div key={m.label} className="scale-card">
                <div className="text-[11px] text-[#9999AA] uppercase tracking-wide mb-1">{m.label}</div>
                <div className="text-[22px] font-semibold text-[#1A1A3E]">{m.value}</div>
                <div className="text-[12px] text-[#6B6B80] mt-1">{m.hint}</div>
              </div>
            ))}
          </div>
        </SectionBlock>

        <div className="sticky bottom-0 bg-white border-t border-[#E4E4E8] -mx-10 px-10 py-4 flex items-center justify-between">
          <span className="text-[13px] text-[#16A34A]">{saved ? '✓ Changes saved' : ''}</span>
          <button onClick={save} className="scale-btn-primary">Save changes</button>
        </div>
      </AgentConfigShell>

      {showTest && <ChatTestModal onClose={() => setShowTest(false)} />}
    </>
  );
}
