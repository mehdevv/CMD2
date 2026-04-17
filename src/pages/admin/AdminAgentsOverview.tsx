import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Bell } from 'lucide-react';
import { AutomationAgentTile } from '@/components/admin/AutomationAgentTile';
import type { AgentId } from '@/lib/agent-brand';

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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <PageHeader className="mb-0" title="Automation Agents" subtitle="4 agents · Last 7 days" />
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
          <AutomationAgentTile
            key={agent.id}
            scope="admin"
            agentId={agent.id as AgentId}
            title={agent.name}
            description={agent.desc}
            stats={agent.stats}
            lastEdited={agent.lastEdited}
            configureHref={agent.route}
            enabled={!!enabled[agent.id]}
            onToggle={() => toggle(agent.id)}
          />
        ))}
      </div>
    </AppShell>
  );
}
