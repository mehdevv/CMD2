import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import type { Conversation } from '@/lib/types';
import { ConversationListPanel, type ConversationListTab } from '@/components/conversations/ConversationListPanel';
import { ThreadHeader } from '@/components/conversations/ThreadHeader';
import { ConversationThread } from '@/components/conversations/ConversationThread';
import { useCrmData } from '@/contexts/CrmDataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function InboxPage() {
  const { user } = useAuth();
  const { conversations, sendMessage, setConversationTakeover } = useCrmData();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<ConversationListTab>('all');
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [takenOver, setTakenOver] = useState(false);

  useEffect(() => {
    if (conversations.length === 0) {
      queueMicrotask(() => setSelected(null));
      return;
    }
    queueMicrotask(() => {
      setSelected(prev => {
        if (prev && conversations.some(c => c.id === prev.id)) return prev;
        return conversations[0] ?? null;
      });
    });
  }, [conversations]);

  useEffect(() => {
    if (!selected) {
      queueMicrotask(() => setTakenOver(false));
      return;
    }
    queueMicrotask(() => setTakenOver(Boolean(selected.automationPaused)));
  }, [selected]);

  const handleTakeoverToggle = useCallback(async () => {
    if (!selected || !user) return;
    const next = !takenOver;
    await setConversationTakeover(selected.id, {
      automationPaused: next,
      assignedToUserId: next ? user.id : null,
    });
    setTakenOver(next);
  }, [selected, user, takenOver, setConversationTakeover]);

  const handleSend = useCallback(async () => {
    if (!selected || !message.trim() || !user) return;
    await sendMessage(selected.id, {
      sender: 'agent',
      senderName: user.name,
      content: message.trim(),
      status: 'sent',
      timestamp: new Date().toISOString(),
    });
    setMessage('');
  }, [selected, message, user, sendMessage]);

  return (
    <AppShell title="Inbox" noPadding>
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        <ConversationListPanel
          search={search}
          onSearchChange={setSearch}
          tab={tab}
          onTabChange={setTab}
          conversations={conversations}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
          {selected ? (
            <>
              <ThreadHeader
                conversation={selected}
                takenOver={takenOver}
                onTakeoverToggle={() => void handleTakeoverToggle()}
              />
              <ConversationThread
                variant="plain"
                fillParent
                composeMode="input"
                messages={selected.messages}
                message={message}
                onMessageChange={setMessage}
                takenOver={takenOver}
                onSend={() => void handleSend()}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-[15px] font-medium text-[#1A1A3E]">No conversations yet</p>
                <p className="mt-1 text-[14px] text-[#6B6B80]">Add a lead to open a thread, or check back after inbound messages arrive.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
