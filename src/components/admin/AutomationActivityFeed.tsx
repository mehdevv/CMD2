import { ActivityRow } from '@/components/ui/ActivityRow';
import { getAgentBrandForLabel } from '@/lib/agent-brand';
import type { Channel } from '@/lib/types';

export interface ActivityFeedItem {
  id: string;
  agent: string;
  action: string;
  time: string;
  channel: Channel;
}

export interface AutomationActivityFeedProps {
  items: ActivityFeedItem[];
}

export function AutomationActivityFeed({ items }: AutomationActivityFeedProps) {
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <ActivityRow
          key={item.id}
          channel={item.channel}
          primary={item.agent}
          secondary={item.action}
          trailing={item.time}
          showDivider={i < items.length - 1}
          leftAccentColor={getAgentBrandForLabel(item.agent)?.solid ?? null}
        />
      ))}
    </div>
  );
}
