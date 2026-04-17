import { useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { Check } from 'lucide-react';
import type { MeetingNote } from '@/lib/types';
import { VoiceRecorder } from '@/components/meetings/VoiceRecorder';

export interface MeetingNotesShellProps {
  breadcrumb: ReactNode;
  title: string;
  existingNote: MeetingNote;
  leadId: string;
}

export function MeetingNotesShell({ breadcrumb, title, existingNote, leadId }: MeetingNotesShellProps) {
  const [showText, setShowText] = useState(false);
  const [textNotes, setTextNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-[680px]">
      <div className="mb-6 flex items-center gap-1.5 text-[13px] text-[#6B6B80]">{breadcrumb}</div>
      <h1 className="mb-6 text-[22px] font-semibold text-[#1A1A3E]">{title}</h1>

      {!submitted ? (
        <>
          <div className="scale-card mb-6">
            <VoiceRecorder onStop={() => setSubmitted(true)} />
            {!showText && (
              <button
                type="button"
                onClick={() => setShowText(v => !v)}
                className="scale-btn-ghost mx-auto mb-6 mt-0 block text-[13px]"
                data-testid="button-toggle-text-notes"
              >
                Or type your notes
              </button>
            )}

            {showText && (
              <div className="mt-4 w-full px-6 pb-6">
                <textarea
                  value={textNotes}
                  onChange={e => setTextNotes(e.target.value)}
                  placeholder="Type your meeting notes here..."
                  className="scale-input w-full resize-none py-3"
                  style={{ height: 120 }}
                  data-testid="textarea-manual-notes"
                />
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="scale-btn-primary mt-3"
                  disabled={!textNotes}
                  data-testid="button-submit-notes"
                >
                  Generate summary
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mb-8 space-y-6">
            <div>
              <div className="mb-2 text-[11px] font-medium tracking-wide text-[#9999AA]">MEETING SUMMARY</div>
              <p className="text-[14px] leading-relaxed text-[#1A1A3E]">{existingNote.summary}</p>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-medium tracking-wide text-[#9999AA]">OBJECTIONS CAPTURED</div>
              <div className="space-y-1.5">
                {existingNote.objections.map((o, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0 text-[14px] text-[#9999AA]">—</span>
                    <p className="text-[14px] text-[#1A1A3E]">{o}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-medium tracking-wide text-[#9999AA]">OPPORTUNITIES</div>
              <div className="space-y-1.5">
                {existingNote.opportunities.map((o, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0 text-[14px] text-[#9999AA]">—</span>
                    <p className="text-[14px] text-[#1A1A3E]">{o}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-medium tracking-wide text-[#9999AA]">NEXT STEPS</div>
              <div className="space-y-1.5">
                {existingNote.nextSteps.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0 text-[14px] text-[#9999AA]">—</span>
                    <p className="text-[14px] text-[#1A1A3E]">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-4">
            <Check size={16} className="text-[#16A34A]" />
            <p className="text-[14px] font-medium text-[#16A34A]">
              Follow-up scheduled by automation — next touch in 24 hours.
            </p>
          </div>

          <div className="mt-6">
            <Link href={`/leads/${leadId}`}>
              <a className="scale-btn-secondary">Back to contact</a>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
