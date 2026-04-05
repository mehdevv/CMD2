import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { ChevronRight, Mic, MicOff, Check } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { MOCK_LEADS, MOCK_MEETING_NOTES } from '@/lib/mock-data';

export default function MeetingNotesPage() {
  const { id } = useParams();
  const lead = MOCK_LEADS.find(l => l.id === id) ?? MOCK_LEADS[3];
  const [recording, setRecording] = useState(false);
  const [showText, setShowText] = useState(false);
  const [textNotes, setTextNotes] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  const existingNote = MOCK_MEETING_NOTES[0];

  const startRecording = () => {
    setRecording(true);
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    setTimer(t);
  };

  const stopRecording = () => {
    setRecording(false);
    if (timer) clearInterval(timer);
    setTimer(null);
    setSubmitted(true);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <AppShell title="Meeting Notes">
      <div className="max-w-[680px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] text-[#6B6B80] mb-6">
          <Link href="/leads"><a className="hover:text-[#1A1A3E]">Leads</a></Link>
          <ChevronRight size={13} />
          <Link href={`/leads/${lead.id}`}><a className="hover:text-[#1A1A3E]">{lead.name}</a></Link>
          <ChevronRight size={13} />
          <span className="text-[#1A1A3E]">Post-meeting notes</span>
        </div>

        <h1 className="text-[22px] font-semibold text-[#1A1A3E] mb-6">{lead.name}</h1>

        {!submitted ? (
          <>
            {/* Recorder */}
            <div className="flex flex-col items-center py-12 scale-card mb-6">
              <button
                onClick={recording ? stopRecording : startRecording}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
                style={{ background: recording ? '#DC2626' : '#1A1A3E' }}
                data-testid="button-record"
              >
                {recording ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
              </button>
              <div className="mt-4 text-center">
                {recording ? (
                  <>
                    <div className="text-[24px] font-mono text-[#1A1A3E]">{formatTime(elapsed)}</div>
                    <p className="text-[14px] text-[#6B6B80] mt-1">Recording... tap to stop</p>
                  </>
                ) : (
                  <p className="text-[14px] text-[#6B6B80]">Tap to record</p>
                )}
              </div>

              {!recording && (
                <button
                  onClick={() => setShowText(v => !v)}
                  className="scale-btn-ghost text-[13px] mt-4"
                  data-testid="button-toggle-text-notes"
                >
                  Or type your notes
                </button>
              )}

              {showText && (
                <div className="w-full mt-4 px-6">
                  <textarea
                    value={textNotes}
                    onChange={e => setTextNotes(e.target.value)}
                    placeholder="Type your meeting notes here..."
                    className="scale-input resize-none py-3 w-full"
                    style={{ height: 120 }}
                    data-testid="textarea-manual-notes"
                  />
                  <button
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
            {/* AI Summary */}
            <div className="space-y-6 mb-8">
              <div>
                <div className="text-[11px] font-medium text-[#9999AA] tracking-wide mb-2">MEETING SUMMARY</div>
                <p className="text-[14px] text-[#1A1A3E] leading-relaxed">{existingNote.summary}</p>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#9999AA] tracking-wide mb-2">OBJECTIONS CAPTURED</div>
                <div className="space-y-1.5">
                  {existingNote.objections.map((o, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[14px] text-[#9999AA]">—</span>
                      <p className="text-[14px] text-[#1A1A3E]">{o}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#9999AA] tracking-wide mb-2">OPPORTUNITIES</div>
                <div className="space-y-1.5">
                  {existingNote.opportunities.map((o, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[14px] text-[#9999AA]">—</span>
                      <p className="text-[14px] text-[#1A1A3E]">{o}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#9999AA] tracking-wide mb-2">NEXT STEPS</div>
                <div className="space-y-1.5">
                  {existingNote.nextSteps.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[14px] text-[#9999AA]">—</span>
                      <p className="text-[14px] text-[#1A1A3E]">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Follow-up notice */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0]">
              <Check size={16} className="text-[#16A34A]" />
              <p className="text-[14px] text-[#16A34A] font-medium">Follow-up scheduled by AI — next touch in 24 hours.</p>
            </div>

            <div className="mt-6">
              <Link href={`/leads/${lead.id}`}>
                <a className="scale-btn-secondary">Back to contact</a>
              </Link>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
