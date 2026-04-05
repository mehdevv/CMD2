import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { ChevronRight, Send, FileText, Mic } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { StageBadge } from '@/components/ui/ScaleBadge';
import { AIStatusLabel } from '@/components/ui/AIStatusLabel';
import { MOCK_LEADS, MOCK_CONVERSATIONS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function ContactDetailPage() {
  const { id } = useParams();
  const lead = MOCK_LEADS.find(l => l.id === id) ?? MOCK_LEADS[0];
  const conversation = MOCK_CONVERSATIONS.find(c => c.leadId === lead.id) ?? MOCK_CONVERSATIONS[0];

  const [takenOver, setTakenOver] = useState(false);
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState(lead.stage);
  const [showFollowUpLog, setShowFollowUpLog] = useState(false);

  return (
    <AppShell title={lead.name}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-[13px] text-[#6B6B80] mb-3">
          <Link href="/leads"><a className="hover:text-[#1A1A3E]">Leads</a></Link>
          <ChevronRight size={13} />
          <span className="text-[#1A1A3E]">{lead.name}</span>
        </div>

        <div className="flex items-start justify-between pb-4 border-b border-[#E4E4E8]">
          <div>
            <h1 className="text-[22px] font-semibold text-[#1A1A3E] mb-1">{lead.name}</h1>
            <div className="flex items-center gap-3 text-[14px] text-[#6B6B80]">
              <ChannelDot channel={lead.channel} showLabel />
              <span>{lead.phone}</span>
              {lead.source && <span className="text-[13px] bg-[#F0F0F2] text-[#6B6B80] px-2 py-0.5 rounded text-xs">{lead.source}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/meetings/brief/${lead.id}`}>
              <a className="scale-btn-ghost gap-1.5">
                <FileText size={14} /> Generate brief
              </a>
            </Link>
            <button
              onClick={() => setTakenOver(v => !v)}
              className={cn('scale-btn-secondary', takenOver && 'border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2]')}
              data-testid="button-take-over"
            >
              {takenOver ? 'Release to AI' : 'Take over'}
            </button>
            <select
              value={stage}
              onChange={e => setStage(e.target.value as typeof stage)}
              className="scale-input w-36"
              data-testid="select-stage"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="flex gap-6" style={{ minHeight: 600 }}>
        {/* Conversation Thread (55%) */}
        <div className="flex flex-col" style={{ flex: '0 0 55%' }}>
          <div className="scale-card flex-1 p-0 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: 480 }}>
              {conversation.messages.map(msg => (
                <div key={msg.id} className={cn('flex flex-col gap-1', msg.sender === 'agent' ? 'items-end' : 'items-start')}>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#9999AA]">
                    <span>{msg.senderName}</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className="rounded-md px-3 py-2 max-w-sm text-[14px]"
                    style={{
                      background: msg.sender === 'ai' ? '#F7F7F8' : msg.sender === 'agent' ? '#EEF3FD' : '#FFFFFF',
                      border: msg.sender === 'contact' ? '1px solid #E4E4E8' : 'none',
                      color: '#1A1A3E',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Follow-up log */}
            <div className="border-t border-[#E4E4E8]">
              <button
                onClick={() => setShowFollowUpLog(v => !v)}
                className="w-full text-left px-5 py-2.5 text-[13px] text-[#6B6B80] hover:bg-[#F7F7F8] transition-colors flex items-center justify-between"
                data-testid="button-toggle-followup-log"
              >
                <span>AI follow-up log</span>
                <ChevronRight size={13} className={cn('transition-transform', showFollowUpLog && 'rotate-90')} />
              </button>
              {showFollowUpLog && (
                <div className="px-5 pb-4 space-y-2">
                  {[
                    { step: 1, preview: 'Bonjour Mohamed, merci de nous avoir contacté...', time: '2h ago', status: 'read' },
                    { step: 2, preview: 'Hey, just following up — are you still interested?', time: '5h ago', status: 'delivered' },
                  ].map(log => (
                    <div key={log.step} className="flex items-center gap-3 text-[13px]">
                      <span className="text-[#9999AA] w-12">Step {log.step}</span>
                      <span className="text-[#6B6B80] flex-1 truncate">{log.preview}</span>
                      <span className="text-[#9999AA]">{log.time}</span>
                      <span className={`text-[12px] ${log.status === 'read' ? 'text-[#16A34A]' : 'text-[#D97706]'}`}>● {log.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Compose */}
            <div className="border-t border-[#E4E4E8] p-4">
              <div className="flex gap-2">
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={takenOver ? 'Write a message...' : 'AI is handling this conversation. Take over to write manually.'}
                  disabled={!takenOver}
                  className="scale-input resize-none py-2 flex-1 h-20"
                  style={{ height: 72 }}
                  data-testid="textarea-compose"
                />
                <button className="scale-btn-primary px-3 self-end" disabled={!takenOver || !message} data-testid="button-send">
                  <Send size={14} />
                </button>
              </div>
              {!takenOver && (
                <p className="text-[12px] text-[#9999AA] mt-2 flex items-center gap-1">
                  <AIStatusLabel status={lead.aiStatus} /> · 
                  <button className="text-[#2B62E8] hover:underline" onClick={() => setTakenOver(true)}>Take over</button> to send manually
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Aside (30%) */}
        <div className="flex-1 space-y-0 scale-card p-0 overflow-y-auto" style={{ maxHeight: 600 }}>
          {/* Deal */}
          <div className="p-5 border-b border-[#E4E4E8]">
            <h4 className="text-[13px] font-medium text-[#1A1A3E] mb-3">Deal</h4>
            <div className="space-y-2.5">
              <div>
                <label className="block text-[12px] text-[#6B6B80] mb-1">Stage</label>
                <StageBadge stage={lead.stage} />
              </div>
              <div>
                <label className="block text-[12px] text-[#6B6B80] mb-1">Value</label>
                <input type="text" defaultValue={lead.dealValue ? `${lead.dealValue.toLocaleString()} DZD` : ''} className="scale-input" data-testid="input-deal-value" />
              </div>
              <div>
                <label className="block text-[12px] text-[#6B6B80] mb-1">Close date</label>
                <input type="date" className="scale-input" data-testid="input-close-date" />
              </div>
              <div>
                <label className="block text-[12px] text-[#6B6B80] mb-1">Notes</label>
                <textarea className="scale-input resize-none py-2" style={{ height: 64 }} placeholder="Deal notes..." defaultValue={lead.notes} data-testid="textarea-notes" />
              </div>
            </div>
          </div>

          {/* Meeting */}
          <div className="p-5 border-b border-[#E4E4E8]">
            <h4 className="text-[13px] font-medium text-[#1A1A3E] mb-3">Meeting</h4>
            <div className="space-y-2">
              <Link href={`/meetings/brief/${lead.id}`}>
                <a className="scale-btn-secondary w-full justify-center text-[13px]">
                  <FileText size={13} /> Pre-meeting brief
                </a>
              </Link>
              <Link href={`/meetings/notes/${lead.id}`}>
                <a className="scale-btn-secondary w-full justify-center text-[13px]">
                  <Mic size={13} /> Post-meeting note
                </a>
              </Link>
            </div>
          </div>

          {/* History */}
          <div className="p-5">
            <h4 className="text-[13px] font-medium text-[#1A1A3E] mb-3">History</h4>
            <div className="space-y-2">
              {[
                { date: '2h ago', type: 'AI message', snippet: 'Step 2 follow-up sent' },
                { date: '4h ago', type: 'Lead created', snippet: 'From WhatsApp Ad' },
                { date: '1d ago', type: 'Stage change', snippet: 'New → Contacted' },
              ].map((item, i) => (
                <div key={i} className="text-[13px]">
                  <div className="flex items-center gap-1.5 text-[#9999AA]">
                    <span>{item.date}</span>
                    <span>·</span>
                    <span>{item.type}</span>
                  </div>
                  <p className="text-[#6B6B80] mt-0.5">{item.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
