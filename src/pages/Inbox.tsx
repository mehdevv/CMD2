import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MOCK_CONVERSATIONS } from '@/lib/mock-data';
import type { Conversation } from '@/lib/types';
import { ConversationListPanel, type ConversationListTab } from '@/components/conversations/ConversationListPanel';
import { ThreadHeader } from '@/components/conversations/ThreadHeader';
import { ConversationThread } from '@/components/conversations/ConversationThread';

export default function InboxPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<ConversationListTab>('all');
  const [selected, setSelected] = useState<Conversation | null>(MOCK_CONVERSATIONS[0]);
  const [message, setMessage] = useState('');
  const [takenOver, setTakenOver] = useState(false);

  return (
    <AppShell title="Inbox" noPadding>
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        <ConversationListPanel
          search={search}
          onSearchChange={setSearch}
          tab={tab}
          onTabChange={setTab}
          conversations={MOCK_CONVERSATIONS}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
          {selected ? (
            <>
              <ThreadHeader
                conversation={selected}
                takenOver={takenOver}
                onTakeoverToggle={() => setTakenOver(v => !v)}
              />
              <ConversationThread
                variant="plain"
                fillParent
                composeMode="input"
                messages={selected.messages}
                message={message}
                onMessageChange={setMessage}
                takenOver={takenOver}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-[15px] font-medium text-[#1A1A3E]">Select a conversation</p>
                <p className="mt-1 text-[14px] text-[#6B6B80]">Choose a conversation from the list to start.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
