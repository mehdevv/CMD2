import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { TemplateBadge } from '@/components/ui/ScaleBadge';
import { MOCK_ACTIVITY_FEED, MOCK_PENDING_TEMPLATES } from '@/lib/mock-data';

const channelHealth = [
  { channel: 'whatsapp' as const, name: 'WhatsApp Business', status: 'connected', msgsToday: 847 },
  { channel: 'instagram' as const, name: 'Instagram DMs', status: 'connected', msgsToday: 312 },
  { channel: 'facebook' as const, name: 'Facebook Messenger', status: 'connected', msgsToday: 198 },
];

const systemAlerts = [
  { id: 1, type: 'warning', text: 'WhatsApp template "Last Follow Up" was rejected by Meta. Review and resubmit.' },
  { id: 2, type: 'info', text: '2 escalated conversations have been waiting for human takeover for 2+ hours.' },
  { id: 3, type: 'info', text: 'Message volume at 84% of monthly limit (E-commerce plan).' },
];

export default function AdminDashboard() {
  return (
    <AppShell title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total leads" value="1,248" delta="+43 vs last week" deltaPositive />
        <StatCard label="Open deals" value="87" delta="-3 vs last week" deltaPositive={false} />
        <StatCard label="Closed this month" value="18" delta="+5 vs last month" deltaPositive />
        <StatCard label="AI messages sent (30d)" value="12,407" delta="+8% vs last month" deltaPositive />
      </div>

      {/* Two-col: Activity + Channel Health */}
      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Activity Feed */}
        <div className="scale-card">
          <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">AI agent activity</h3>
          <div className="space-y-0">
            {MOCK_ACTIVITY_FEED.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < MOCK_ACTIVITY_FEED.length - 1 ? '1px solid #E4E4E8' : 'none' }}>
                <ChannelDot channel={item.channel} />
                <span className="text-[13px] font-medium text-[#1A1A3E] min-w-[120px]">{item.agent}</span>
                <span className="text-[13px] text-[#6B6B80] flex-1">{item.action}</span>
                <span className="text-[12px] text-[#9999AA] whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Health */}
        <div className="scale-card">
          <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Channel health</h3>
          <div className="space-y-0">
            {channelHealth.map((ch, i) => (
              <div key={ch.channel} className="py-3" style={{ borderBottom: i < channelHealth.length - 1 ? '1px solid #E4E4E8' : 'none' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <ChannelDot channel={ch.channel} />
                    <span className="text-[14px] font-medium text-[#1A1A3E]">{ch.name}</span>
                  </div>
                  <a href="/admin/channels" className="text-[13px] text-[#2B62E8] hover:underline">Settings</a>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[12px] text-[#16A34A]">● Connected</span>
                  <span className="text-[12px] text-[#9999AA]">·</span>
                  <span className="text-[12px] text-[#6B6B80]">{ch.msgsToday.toLocaleString()} msgs today</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-col: Templates + Alerts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pending Templates */}
        <div className="scale-card">
          <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Pending template approvals</h3>
          {MOCK_PENDING_TEMPLATES.length === 0 ? (
            <p className="text-[13px] text-[#9999AA]">No pending templates.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
                  <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Template</th>
                  <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Channel</th>
                  <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Status</th>
                  <th className="py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PENDING_TEMPLATES.map(t => (
                  <tr key={t.id} className="border-b border-[#E4E4E8] last:border-0 hover:bg-[#F7F7F8]">
                    <td className="py-3 px-3 text-[14px] font-medium text-[#1A1A3E]">{t.name}</td>
                    <td className="py-3 px-3"><ChannelDot channel={t.channel} showLabel /></td>
                    <td className="py-3 px-3"><TemplateBadge status={t.status} /></td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="text-[13px] text-[#16A34A] hover:underline">Approve</button>
                        <button className="text-[13px] text-[#DC2626] hover:underline">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* System Alerts */}
        <div className="scale-card">
          <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">System alerts</h3>
          <div className="space-y-3">
            {systemAlerts.map(alert => (
              <div key={alert.id} className="flex items-start gap-2.5">
                <span className={`mt-0.5 text-[16px] ${alert.type === 'warning' ? 'text-[#D97706]' : 'text-[#2B62E8]'}`}>
                  {alert.type === 'warning' ? '⚠' : 'ℹ'}
                </span>
                <p className="text-[13px] text-[#6B6B80] leading-snug">{alert.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
