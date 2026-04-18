import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { useCrmData } from '@/contexts/CrmDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnrichmentCard } from '@/components/leads/EnrichmentCard';
import { ConvertToOpportunityDialog } from '@/components/leads/ConvertToOpportunityDialog';
import { ContactHeader } from '@/components/leads/ContactHeader';
import { DealAsideCard } from '@/components/leads/DealAsideCard';
import { MeetingShortcutsCard } from '@/components/leads/MeetingShortcutsCard';
import { HistoryCard } from '@/components/leads/HistoryCard';
import { FollowUpLog } from '@/components/leads/FollowUpLog';
import { ConversationThread } from '@/components/conversations/ConversationThread';

export default function ContactDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { leads, patchLead, conversations, sendMessage, setConversationTakeover } = useCrmData();
  const lead = leads.find(l => l.id === id);
  const conversation = useMemo(() => conversations.find(c => c.leadId === id) ?? null, [conversations, id]);

  const [takenOver, setTakenOver] = useState(false);
  const [message, setMessage] = useState('');
  const [showFollowUpLog, setShowFollowUpLog] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  useEffect(() => {
    if (!conversation) {
      queueMicrotask(() => setTakenOver(false));
      return;
    }
    queueMicrotask(() => setTakenOver(Boolean(conversation.automationPaused)));
  }, [conversation]);

  const handleTakeoverToggle = useCallback(async () => {
    if (!conversation || !user) {
      setTakenOver(v => !v);
      return;
    }
    const next = !takenOver;
    await setConversationTakeover(conversation.id, {
      automationPaused: next,
      assignedToUserId: next ? user.id : null,
    });
    setTakenOver(next);
  }, [conversation, user, takenOver, setConversationTakeover]);

  const handleSend = useCallback(async () => {
    if (!conversation || !message.trim() || !user) return;
    await sendMessage(conversation.id, {
      sender: 'agent',
      senderName: user.name,
      content: message.trim(),
      status: 'sent',
      timestamp: new Date().toISOString(),
    });
    setMessage('');
  }, [conversation, message, user, sendMessage]);

  if (!lead) {
    return (
      <AppShell title="Contact">
        <p className="text-[14px] text-[#6B6B80]">Contact not found.</p>
        <Link href="/leads">
          <a className="mt-2 inline-block text-[14px] text-[#2B62E8]">Back to Leads</a>
        </Link>
      </AppShell>
    );
  }

  const messages = conversation?.messages ?? [];

  return (
    <AppShell title={lead.name}>
      <ContactHeader
        lead={lead}
        takenOver={takenOver}
        onTakeoverToggle={() => void handleTakeoverToggle()}
        onStageChange={stage => void patchLead(lead.id, { stage })}
        onConvertClick={() => setConvertOpen(true)}
      />

      <ConvertToOpportunityDialog open={convertOpen} onOpenChange={setConvertOpen} lead={lead} />

      <div className="flex gap-6" style={{ minHeight: 600 }}>
        <div className="flex flex-col" style={{ flex: '0 0 55%' }}>
          <ConversationThread
            messages={messages}
            message={message}
            onMessageChange={setMessage}
            takenOver={takenOver}
            threadAiStatus={lead.aiStatus}
            onRequestTakeover={() => void handleTakeoverToggle()}
            betweenMessagesAndCompose={
              <FollowUpLog open={showFollowUpLog} onOpenChange={setShowFollowUpLog} />
            }
            onSend={() => void handleSend()}
          />
        </div>

        <div className="scale-scroll max-h-[600px] flex-1 space-y-0 overflow-y-auto overscroll-contain rounded-lg border border-[#E4E4E8] bg-white">
          <EnrichmentCard lead={lead} onPatch={patch => void patchLead(lead.id, patch)} />
          <DealAsideCard lead={lead} />
          <MeetingShortcutsCard leadId={lead.id} />
          <HistoryCard />
        </div>
      </div>
    </AppShell>
  );
}
