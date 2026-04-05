import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { Bot, Bell, ArrowRight } from 'lucide-react';

const AGENTS = [
  {
    id: 'followup',
    name: 'Lead Follow-Up',
    desc: 'Contacts new leads automatically across all channels.',
    stats: [
      { label: 'Sequences active', value: '12' },
      { label: 'Reply rate', value: '34%' },
      { label: 'Avg steps to reply', value: '2.1' },
    ],
    lastEdited: '2 hours ago',
    route: '/admin/agents/followup',
  },
  {
    id: 'chat',
    name: 'Client Chat',
    desc: 'Handles inbound messages 24/7 and qualifies leads.',
    stats: [
      { label: 'Messages handled', value: '248' },
      { label: 'Escalation rate', value: '8%' },
      { label: 'Avg response time', value: '3s' },
    ],
    lastEdited: '1 day ago',
    route: '/admin/agents/chat',
  },
  {
    id: 'tracking',
    name: 'Order Tracking',
    desc: 'Sends proactive delivery updates from your carrier API.',
    stats: [
      { label: 'Updates sent', value: '57' },
      { label: 'Delivery API status', value: 'Connected' },
      { label: 'Unsatisfied flagged', value: '3' },
    ],
    lastEdited: '3 days ago',
    route: '/admin/agents/tracking',
  },
  {
    id: 'refund',
    name: 'Refund',
    desc: 'Handles refund requests, auto-approves or escalates to owner.',
    stats: [
      { label: 'Requests handled', value: '18' },
      { label: 'Auto-approved', value: '11' },
      { label: 'Pending owner review', value: '3' },
    ],
    lastEdited: '5 hours ago',
    route: '/admin/agents/refund',
  },
];

export default function AdminAgentsOverview() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    followup: true,
    chat: true,
    tracking: true,
    refund: false,
  });

  const toggle = (id: string) => setEnabled(p => ({ ...p, [id]: !p[id] }));

  return (
    <AppShell title="Automation Agents">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1A1A3E]">Automation Agents</h1>
          <p className="text-[13px] text-[#6B6B80] mt-0.5">4 agents · Last 7 days</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/automation/triggers">
            <a className="scale-btn-ghost text-[13px]">Triggers</a>
          </Link>
          <Link href="/admin/automation/intervention">
            <a className="scale-btn-ghost text-[13px]">Human intervention</a>
          </Link>
          <Link href="/admin/automation/activity">
            <a className="scale-btn-ghost text-[13px]">Activity log</a>
          </Link>
          <Link href="/admin/agents/workspace">
            <a className="scale-btn-ghost text-[13px]">Classic workspace</a>
          </Link>
          <Link href="/admin/automation/intervention">
            <a className="scale-btn-secondary flex items-center gap-2">
              <Bell size={14} />
              Intervention alerts
            </a>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {AGENTS.map(agent => (
          <div key={agent.id} className="scale-card">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EEF3FD] flex items-center justify-center">
                  <Bot size={18} style={{ color: '#2B62E8' }} />
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-[#1A1A3E]">{agent.name} Agent</div>
                  <div className="text-[12px] text-[#6B6B80] mt-0.5">{agent.desc}</div>
                </div>
              </div>
              <button
                onClick={() => toggle(agent.id)}
                className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-1"
                style={{ background: enabled[agent.id] ? '#2B62E8' : '#E4E4E8' }}
              >
                <span className="absolute top-0.5 rounded-full w-4 h-4 bg-white transition-transform" style={{ left: enabled[agent.id] ? '22px' : '2px' }} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {agent.stats.map(s => (
                <div key={s.label} className="bg-[#F7F7F8] rounded-md p-2.5">
                  <div className="text-[18px] font-semibold text-[#1A1A3E] leading-none">{s.value}</div>
                  <div className="text-[11px] text-[#9999AA] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#9999AA]">Edited {agent.lastEdited}</span>
              <Link href={agent.route}>
                <a className="scale-btn-primary flex items-center gap-1.5 text-[13px] py-1.5 px-3">
                  Configure
                  <ArrowRight size={12} />
                </a>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
