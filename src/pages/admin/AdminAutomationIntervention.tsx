import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FieldGroup } from '@/components/agents/AgentConfigShell';
import { TagInput } from '@/components/ui/TagInput';
import { ScaleSlider } from '@/components/ui/ScaleSlider';
import { InfoBlock } from '@/components/ui/InfoBlock';
import { Link } from 'wouter';

const DEFAULT_KEYWORDS = ['complaint', 'urgent', 'manager', 'scam', 'fraud'];

export default function AdminAutomationIntervention() {
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
  const [confidence, setConfidence] = useState(0.55);
  const [saved, setSaved] = useState(false);
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell title="Human intervention">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-[22px] font-semibold text-[#1A1A3E]">Human intervention</h1>
        <p className="text-[13px] text-[#6B6B80] mt-1">
          Global defaults for escalations, urgent notifications, and takeover behavior. Per-agent overrides live on each automation agent page.
        </p>
      </div>

      <div className="max-w-3xl space-y-8">
        <section className="scale-card space-y-4">
          <h2 className="text-[15px] font-semibold text-[#1A1A3E]">Global escalation</h2>
          <FieldGroup label="Escalate when (any agent)" help="Checked options apply across agents unless disabled locally.">
            <div className="space-y-2">
              {[
                'Automation confidence below threshold',
                'Negative sentiment detected',
                'Message outside knowledge base (chat)',
                'Customer explicitly asks for a person',
                'Max consecutive automation messages without reply',
                'Forbidden topic mentioned',
                'Refund or legal threat',
              ].map(label => (
                <label key={label} className="flex items-center gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                  {label}
                </label>
              ))}
            </div>
          </FieldGroup>
          <FieldGroup label="Default confidence threshold" help="Below this score, flag for human review (where confidence is computed).">
            <div className="w-full max-w-md">
              <ScaleSlider value={confidence} min={0} max={1} step={0.05} onChange={setConfidence} labels={{ left: 'Strict', right: 'Loose' }} />
            </div>
          </FieldGroup>
          <FieldGroup label="Instant escalation keywords" help="If the customer message contains any of these, send an urgent alert and pause automation on the thread.">
            <TagInput value={keywords} onChange={setKeywords} placeholder="Add keyword + Enter" restrictive examples={['urgent', 'manager']} />
          </FieldGroup>
        </section>

        <section className="scale-card space-y-4">
          <h2 className="text-[15px] font-semibold text-[#1A1A3E]">Notifications</h2>
          <FieldGroup label="Default notify via">
            <div className="space-y-2">
              {['In-app (bell) — urgent styling', 'Email', 'WhatsApp to assigned sales'].map(ch => (
                <label key={ch} className="flex items-center gap-2 text-[13px] text-[#1A1A3E] cursor-pointer">
                  <input type="checkbox" defaultChecked={ch.includes('In-app')} className="w-3.5 h-3.5" />
                  {ch}
                </label>
              ))}
            </div>
          </FieldGroup>
          <FieldGroup label="Default recipient pool" help="Who receives alerts when no assignee is set.">
            <select className="scale-input w-full max-w-md">
              <option>Round-robin — all sales</option>
              <option>Business owner only</option>
              <option>Owner + admins</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Urgent in-app template" help="Variables: {{contact_name}}, {{channel}}, {{conversation_link}}, {{escalation_reason}}, {{automation_agent}}">
            <textarea
              className="scale-input w-full"
              rows={3}
              defaultValue="Urgent: {{contact_name}} on {{channel}} needs a person. Reason: {{escalation_reason}}. Thread: {{conversation_link}}"
            />
          </FieldGroup>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-[13px] font-medium text-[#1A1A3E]">Pause automation after escalation</div>
              <div className="text-[12px] text-[#9999AA]">Recommended: no further automated messages until the thread is resolved or resumed.</div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </section>

        <section className="scale-card space-y-4">
          <h2 className="text-[15px] font-semibold text-[#1A1A3E]">Take over</h2>
          <InfoBlock>
            When a sales agent taps <strong>Take over</strong> in Inbox or on a contact, automation stops for that conversation immediately. The agent sees full history including automation messages. When the conversation is marked resolved, you can allow follow-up automation to resume (below).
          </InfoBlock>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-[13px] font-medium text-[#1A1A3E]">Allow Lead Follow-Up to resume after resolve</div>
              <div className="text-[12px] text-[#9999AA]">If off, automation stays paused until manually re-enabled on the lead.</div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <FieldGroup label="Cooldown before automation can resume (hours)">
            <input type="number" defaultValue={24} className="scale-input w-28" />
          </FieldGroup>
        </section>

        <div className="flex items-center justify-between pb-8">
          <span className="text-[13px] text-[#16A34A]">{saved ? '✓ Changes saved' : ''}</span>
          <div className="flex gap-2">
            <Link href="/admin/automation/activity">
              <a className="scale-btn-secondary text-[13px]">View activity log</a>
            </Link>
            <button type="button" onClick={save} className="scale-btn-primary">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
