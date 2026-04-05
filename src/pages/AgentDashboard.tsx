import { Link } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { MOCK_LEADS, MOCK_CONVERSATIONS } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';

const ESCALATED = MOCK_LEADS.filter(l => l.aiStatus === 'escalated').slice(0, 3);
const AI_DRAFTS = MOCK_CONVERSATIONS.slice(0, 3);

const TODAY_FOLLOWUPS = [
  { contact: 'Mohamed Benali', preview: 'Hey, just following up — are you still interested?', channel: 'whatsapp' as const, time: '10:00 AM', status: 'Scheduled' },
  { contact: 'Sofiane Meziane', preview: 'Bonjour, je ne veux pas que vous passiez à côté...', channel: 'facebook' as const, time: '2:00 PM', status: 'Scheduled' },
  { contact: 'Nadia Hamdi', preview: 'Last message from me, let me know when you\'re ready!', channel: 'whatsapp' as const, time: '11:30 AM', status: 'Sent' },
];

export default function AgentDashboard() {
  const { user } = useAuth();
  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <AppShell title="Dashboard">
      {/* Greeting */}
      <div className="mb-8" style={{ paddingTop: 0 }}>
        <h1 className="text-[22px] font-semibold text-[#1A1A3E]">Good morning, {firstName}</h1>
        <p className="text-[14px] text-[#6B6B80] mt-1">5 leads need your attention today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="My active leads" value="12" />
        <StatCard label="Follow-ups today" value="5" />
        <StatCard label="Messages to approve" value="3" />
      </div>

      {/* Attention + Drafts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="scale-card">
          <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Needs attention</h3>
          {ESCALATED.length === 0 ? (
            <p className="text-[13px] text-[#9999AA]">No escalations right now.</p>
          ) : (
            <div className="space-y-0">
              {ESCALATED.map((lead, i) => (
                <div key={lead.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < ESCALATED.length - 1 ? '1px solid #E4E4E8' : 'none' }}>
                  <ChannelDot channel={lead.channel} />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[#1A1A3E]">{lead.name}</p>
                    <p className="text-[12px] text-[#DC2626]">AI escalated — needs human review</p>
                  </div>
                  <Link href={`/leads/${lead.id}`}>
                    <a className="text-[13px] text-[#2B62E8] hover:underline">Open</a>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="scale-card">
          <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Messages to approve</h3>
          <div className="space-y-0">
            {AI_DRAFTS.map((conv, i) => (
              <div key={conv.id} className="flex items-start gap-3 py-2.5" style={{ borderBottom: i < AI_DRAFTS.length - 1 ? '1px solid #E4E4E8' : 'none' }}>
                <ChannelDot channel={conv.channel} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#1A1A3E]">{conv.leadName}</p>
                  <p className="text-[12px] text-[#6B6B80] truncate">{conv.lastMessage}</p>
                </div>
                <Link href={`/leads/${conv.leadId}`}>
                  <a className="text-[13px] text-[#2B62E8] hover:underline whitespace-nowrap">Review</a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Follow-ups */}
      <div className="scale-card">
        <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Today's automated follow-ups</h3>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
              <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Contact</th>
              <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Preview</th>
              <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Channel</th>
              <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Time</th>
              <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Status</th>
            </tr>
          </thead>
          <tbody>
            {TODAY_FOLLOWUPS.map((f, i) => (
              <tr key={i} className="border-b border-[#E4E4E8] last:border-0 hover:bg-[#F7F7F8]" style={{ height: 48 }}>
                <td className="px-3 text-[14px] font-medium text-[#1A1A3E]">{f.contact}</td>
                <td className="px-3 text-[13px] text-[#6B6B80] max-w-xs truncate">{f.preview}</td>
                <td className="px-3"><ChannelDot channel={f.channel} showLabel /></td>
                <td className="px-3 text-[13px] text-[#6B6B80]">{f.time}</td>
                <td className="px-3">
                  <span className={`text-[13px] ${f.status === 'Sent' ? 'text-[#16A34A]' : 'text-[#D97706]'}`}>{f.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
