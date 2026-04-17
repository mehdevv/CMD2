import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { StickySaveBar } from '@/components/layout/StickySaveBar';
import { FieldGroup } from '@/components/agents/AgentConfigShell';
import { TagInput } from '@/components/ui/TagInput';
import { ScaleSlider } from '@/components/ui/ScaleSlider';
import { InfoBlock } from '@/components/ui/InfoBlock';
import { Link } from 'wouter';

const DEFAULT_KEYWORDS = ['complaint', 'urgent', 'manager', 'scam', 'fraud'];

export default function AdminAutomationIntervention() {
  const [keywords, setKeywords] = useState<string[]>(() => [...DEFAULT_KEYWORDS]);
  const [confidence, setConfidence] = useState(0.55);
  const [saved, setSaved] = useState({ keywords: [...DEFAULT_KEYWORDS], confidence: 0.55 });
  const [savedToast, setSavedToast] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(keywords) !== JSON.stringify(saved.keywords) || confidence !== saved.confidence,
    [keywords, confidence, saved]
  );

  const save = () => {
    setSaved({ keywords: [...keywords], confidence });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const discard = () => {
    setKeywords([...saved.keywords]);
    setConfidence(saved.confidence);
  };

  return (
    <AppShell title="Human intervention">
      <div className={dirty ? 'pb-24' : undefined}>
        <PageHeader
          title="Human intervention"
          subtitle="Global defaults for escalations, urgent notifications, and takeover behavior. Per-agent overrides live on each automation agent page."
        />

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
                  <label key={label} className="flex cursor-pointer items-center gap-2 text-[13px] text-[#1A1A3E]">
                    <input type="checkbox" defaultChecked className="h-3.5 w-3.5" />
                    {label}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup
              label="Default confidence threshold"
              help="Below this score, flag for human review (where confidence is computed)."
            >
              <div className="w-full max-w-md">
                <ScaleSlider
                  value={confidence}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={setConfidence}
                  labels={{ left: 'Strict', right: 'Loose' }}
                />
              </div>
            </FieldGroup>
            <FieldGroup
              label="Instant escalation keywords"
              help="If the customer message contains any of these, send an urgent alert and pause automation on the thread."
            >
              <TagInput
                value={keywords}
                onChange={setKeywords}
                placeholder="Add keyword + Enter"
                restrictive
                examples={['urgent', 'manager']}
              />
            </FieldGroup>
          </section>

          <section className="scale-card space-y-4">
            <h2 className="text-[15px] font-semibold text-[#1A1A3E]">Notifications</h2>
            <FieldGroup label="Default notify via">
              <div className="space-y-2">
                {['In-app (bell) — urgent styling', 'Email', 'WhatsApp to assigned sales'].map(ch => (
                  <label key={ch} className="flex cursor-pointer items-center gap-2 text-[13px] text-[#1A1A3E]">
                    <input type="checkbox" defaultChecked={ch.includes('In-app')} className="h-3.5 w-3.5" />
                    {ch}
                  </label>
                ))}
              </div>
            </FieldGroup>
            <FieldGroup label="Default recipient pool" help="Who receives alerts when no assignee is set.">
              <select className="scale-input max-w-md w-full">
                <option>Round-robin — all sales</option>
                <option>Business owner only</option>
                <option>Owner + admins</option>
              </select>
            </FieldGroup>
            <FieldGroup
              label="Urgent in-app template"
              help="Variables: {{contact_name}}, {{channel}}, {{conversation_link}}, {{escalation_reason}}, {{automation_agent}}"
            >
              <textarea
                className="scale-input w-full"
                rows={3}
                defaultValue="Urgent: {{contact_name}} on {{channel}} needs a person. Reason: {{escalation_reason}}. Thread: {{conversation_link}}"
              />
            </FieldGroup>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-[13px] font-medium text-[#1A1A3E]">Pause automation after escalation</div>
                <div className="text-[12px] text-[#9999AA]">
                  Recommended: no further automated messages until the thread is resolved or resumed.
                </div>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
          </section>

          <section className="scale-card space-y-4">
            <h2 className="text-[15px] font-semibold text-[#1A1A3E]">Take over</h2>
            <InfoBlock>
              When a sales agent taps <strong>Take over</strong> in Inbox or on a contact, automation stops for that
              conversation immediately. The agent sees full history including automation messages. When the conversation
              is marked resolved, you can allow follow-up automation to resume (below).
            </InfoBlock>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-[13px] font-medium text-[#1A1A3E]">Allow Lead Follow-Up to resume after resolve</div>
                <div className="text-[12px] text-[#9999AA]">
                  If off, automation stays paused until manually re-enabled on the lead.
                </div>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <FieldGroup label="Cooldown before automation can resume (hours)">
              <input type="number" defaultValue={24} className="scale-input w-28" />
            </FieldGroup>
          </section>

          <div className="flex items-center justify-between pb-8">
            <span className="text-[13px] text-[#16A34A]">{savedToast ? '✓ Changes saved' : ''}</span>
            <Link href="/admin/automation/activity">
              <a className="scale-btn-secondary text-[13px]">View activity log</a>
            </Link>
          </div>
        </div>
      </div>

      <StickySaveBar dirty={dirty} onSave={save} onDiscard={discard} />
    </AppShell>
  );
}
