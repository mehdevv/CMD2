import { Link } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { StageBadge } from '@/components/ui/ScaleBadge';
import { AIStatusLabel } from '@/components/ui/AIStatusLabel';
import { MOCK_LEADS, MOCK_AGENTS } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';

const INTELLIGENCE = [
  { type: 'danger', label: 'Top objection', headline: '"Le prix est trop élevé" — 8 conversations this week', detail: 'Response rate drops 40% after this objection. Consider a script update.' },
  { type: 'success', label: 'Opportunity', headline: '5 Facebook leads reached Qualified in 48h', detail: 'This week\'s ad batch is converting 23% better than average.' },
  { type: 'warning', label: 'Risk', headline: '3 accounts silent for 14+ days', detail: 'Total open deal value at risk: 58,500 DZD. Immediate follow-up recommended.' },
];

const RECENT_MEETINGS = [
  { id: '1', name: 'Fatima Zahra Aït', date: 'Today 3:15 PM', summary: 'Interested in pilot program. Main concern is onboarding complexity. Wants revised proposal for 200-unit pack.' },
  { id: '2', name: 'Bilal Hadjadj', date: 'Yesterday 11:00 AM', summary: 'Positive outcome. Ready to sign. Needs final approval from CEO before committing.' },
];

export default function OwnerDashboard() {
  const { user } = useAuth();

  return (
    <AppShell title="Dashboard">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Response rate" value="94%" delta="+2% vs last week" deltaPositive />
        <StatCard label="Deals closed" value="18" delta="+5 vs last month" deltaPositive />
        <StatCard label="Churn rate" value="2.3%" delta="-0.4% vs last month" deltaPositive />
        <StatCard label="Conversion rate" value="14.2%" delta="+1.1% vs last month" deltaPositive />
      </div>

      {/* Intelligence cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {INTELLIGENCE.map((item, i) => (
          <div key={i} className="bg-white border border-[#E4E4E8] rounded-lg p-5 flex flex-col gap-2" style={{ borderLeft: `3px solid ${item.type === 'danger' ? '#DC2626' : item.type === 'success' ? '#16A34A' : '#D97706'}` }}>
            <span className="text-[11px] font-medium text-[#9999AA] tracking-wide">{item.label.toUpperCase()}</span>
            <p className="text-[15px] font-medium text-[#1A1A3E] leading-snug">{item.headline}</p>
            <p className="text-[13px] text-[#6B6B80]">{item.detail}</p>
            <Link href="/intelligence"><a className="text-[13px] text-[#2B62E8] hover:underline mt-auto">View details</a></Link>
          </div>
        ))}
      </div>

      {/* Pipeline Table */}
      <div className="scale-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-medium text-[#1A1A3E]">Team pipeline</h3>
          <select className="scale-input w-40 text-[13px]" style={{ height: 32 }}>
            <option>All agents</option>
            {MOCK_AGENTS.map(a => <option key={a.id}>{a.name}</option>)}
          </select>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
              <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Agent</th>
              <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Lead</th>
              <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Stage</th>
              <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Last contact</th>
              <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">AI status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADS.slice(0, 8).map(lead => (
              <tr key={lead.id} className="border-b border-[#E4E4E8] last:border-0 hover:bg-[#F7F7F8]" style={{ height: 48 }}>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F0F0F2] flex items-center justify-center text-[10px] font-semibold text-[#1A1A3E]">
                      {lead.assignedTo.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-[13px] text-[#6B6B80]">{lead.assignedTo}</span>
                  </div>
                </td>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    <ChannelDot channel={lead.channel} />
                    <Link href={`/leads/${lead.id}`}><a className="text-[14px] font-medium text-[#1A1A3E] hover:text-[#2B62E8]">{lead.name}</a></Link>
                  </div>
                </td>
                <td className="px-3"><StageBadge stage={lead.stage} /></td>
                <td className="px-3 text-[13px] text-[#6B6B80]">{lead.lastContact}</td>
                <td className="px-3"><AIStatusLabel status={lead.aiStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Meetings */}
      <div className="scale-card">
        <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Recent meeting summaries</h3>
        <div className="space-y-0">
          {RECENT_MEETINGS.map((m, i) => (
            <div key={m.id} className="flex items-start gap-4 py-3" style={{ borderBottom: i < RECENT_MEETINGS.length - 1 ? '1px solid #E4E4E8' : 'none' }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[14px] font-medium text-[#1A1A3E]">{m.name}</span>
                  <span className="text-[12px] text-[#9999AA]">·</span>
                  <span className="text-[12px] text-[#9999AA]">{m.date}</span>
                </div>
                <p className="text-[13px] text-[#6B6B80] line-clamp-2">{m.summary}</p>
              </div>
              <Link href={`/meetings/notes/${m.id}`}><a className="text-[13px] text-[#2B62E8] hover:underline whitespace-nowrap">View</a></Link>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
