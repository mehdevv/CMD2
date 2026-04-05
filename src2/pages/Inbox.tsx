import { useState } from 'react';
import { Search } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { AIStatusLabel } from '@/components/ui/AIStatusLabel';
import { MOCK_CONVERSATIONS } from '@/lib/mock-data';
import { Conversation } from '@/lib/types';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'ai' | 'human' | 'pending';
const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI Active' },
  { id: 'human', label: 'Human Active' },
  { id: 'pending', label: 'Pending' },
];

export default function InboxPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<FilterTab>('all');
  const [selected, setSelected] = useState<Conversation | null>(MOCK_CONVERSATIONS[0]);
  const [message, setMessage] = useState('');
  const [takenOver, setTakenOver] = useState(false);

  const filtered = MOCK_CONVERSATIONS.filter(c => {
    if (search && !c.leadName.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === 'ai' && c.aiStatus !== 'active') return false;
    if (tab === 'human' && c.aiStatus !== 'paused') return false;
    if (tab === 'pending' && c.aiStatus !== 'escalated') return false;
    return true;
  });

  return (
    <AppShell title="Inbox" noPadding>
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left Panel */}
        <div className="flex flex-col border-r border-[#E4E4E8] bg-white flex-shrink-0" style={{ width: 320 }}>
          {/* Search */}
          <div className="p-3 border-b border-[#E4E4E8]">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9999AA]" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="scale-input pl-8 text-[13px]"
                data-testid="input-search-inbox"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#E4E4E8]">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex-1 py-2 text-[12px] font-medium transition-colors',
                  tab === t.id ? 'text-[#1A1A3E] border-b-2 border-[#2B62E8]' : 'text-[#6B6B80] hover:text-[#1A1A3E]'
                )}
                data-testid={`button-tab-${t.id}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={cn(
                  'w-full text-left border-b border-[#E4E4E8] relative transition-colors',
                  selected?.id === conv.id ? 'bg-[#F7F8FF] border-l-2 border-l-[#2B62E8]' : 'hover:bg-[#F7F7F8]'
                )}
                style={{ padding: '12px 14px', minHeight: 72 }}
                data-testid={`row-conv-${conv.id}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#F0F0F2] flex items-center justify-center text-[13px] font-semibold text-[#1A1A3E] flex-shrink-0">
                    {conv.leadName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[14px] font-medium text-[#1A1A3E] truncate">{conv.leadName}</span>
                      <span className="text-[12px] text-[#9999AA] ml-2 flex-shrink-0">{conv.lastTime}</span>
                    </div>
                    <p className="text-[13px] text-[#6B6B80] truncate">{conv.lastMessage}</p>
                    <div className="flex items-center justify-between mt-1">
                      <AIStatusLabel status={conv.aiStatus} />
                      <ChannelDot channel={conv.channel} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col bg-white">
          {selected ? (
            <>
              {/* Thread header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#E4E4E8]">
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-medium text-[#1A1A3E]">{selected.leadName}</span>
                  <ChannelDot channel={selected.channel} showLabel />
                  <AIStatusLabel status={selected.aiStatus} />
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/leads/${selected.leadId}`} className="scale-btn-ghost text-[13px]">View contact</a>
                  <button
                    onClick={() => setTakenOver(v => !v)}
                    className={cn('scale-btn-secondary text-[13px]', takenOver && 'border-[#FCA5A5] text-[#DC2626]')}
                    data-testid="button-inbox-take-over"
                  >
                    {takenOver ? 'Release' : 'Take over'}
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selected.messages.map(msg => (
                  <div key={msg.id} className={cn('flex flex-col gap-1', msg.sender === 'agent' ? 'items-end' : 'items-start')}>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#9999AA]">
                      <span>{msg.senderName}</span>
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div
                      className="rounded-md px-4 py-2.5 max-w-md text-[14px]"
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

              {/* Compose */}
              <div className="border-t border-[#E4E4E8] p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={takenOver ? 'Write a message...' : 'Take over to send manually...'}
                    disabled={!takenOver}
                    className="scale-input flex-1"
                    data-testid="input-compose-inbox"
                  />
                  <button
                    className="scale-btn-primary px-4"
                    disabled={!takenOver || !message}
                    data-testid="button-send-inbox"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[15px] font-medium text-[#1A1A3E]">Select a conversation</p>
                <p className="text-[14px] text-[#6B6B80] mt-1">Choose a conversation from the list to start.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
