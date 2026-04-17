import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { OwnerAutomationExplainer } from '@/components/automation/OwnerAutomationExplainer';
import { AutomationAgentTile } from '@/components/admin/AutomationAgentTile';
import type { AgentId } from '@/lib/agent-brand';

const AGENTS = [
  {
    id: 'followup',
    name: 'Lead Follow-Up',
    desc: 'Your follow-up messages and sequence for new leads.',
    route: '/automation/followup',
  },
  {
    id: 'chat',
    name: 'Client Chat',
    desc: 'Knowledge base, greeting, and tone for inbound chat.',
    route: '/automation/chat',
  },
  {
    id: 'tracking',
    name: 'Order Tracking',
    desc: 'Customer-facing status messages (carrier is connected by admin).',
    route: '/automation/tracking',
  },
  {
    id: 'refund',
    name: 'Refund',
    desc: 'Tone and messages; policy limits are set by admin.',
    route: '/automation/refund',
  },
];

export default function OwnerAutomationOverview() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    followup: true,
    chat: true,
    tracking: true,
    refund: true,
  });

  return (
    <AppShell title="Automation">
      <OwnerAutomationExplainer />

      <div className="grid grid-cols-2 gap-5">
        {AGENTS.map(agent => (
          <AutomationAgentTile
            key={agent.id}
            scope="owner"
            agentId={agent.id as AgentId}
            title={agent.name}
            description={agent.desc}
            configureHref={agent.route}
            enabled={!!enabled[agent.id]}
            onToggle={() => setEnabled(p => ({ ...p, [agent.id]: !p[agent.id] }))}
          />
        ))}
      </div>
    </AppShell>
  );
}
