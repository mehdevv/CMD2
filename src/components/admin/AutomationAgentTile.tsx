import { Link } from 'wouter';
import { Bot, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGENT_BRAND, type AgentId } from '@/lib/agent-brand';
import { AgentEnableToggle } from '@/components/admin/AgentEnableToggle';

export type AutomationAgentTileScope = 'admin' | 'owner';

export interface AutomationAgentStat {
  label: string;
  value: string;
}

export interface AutomationAgentTileProps {
  scope: AutomationAgentTileScope;
  agentId: AgentId;
  title: string;
  description: string;
  stats?: AutomationAgentStat[];
  lastEdited?: string;
  configureHref: string;
  enabled: boolean;
  onToggle: () => void;
}

export function AutomationAgentTile({
  scope,
  agentId,
  title,
  description,
  stats,
  lastEdited,
  configureHref,
  enabled,
  onToggle,
}: AutomationAgentTileProps) {
  const brand = AGENT_BRAND[agentId];
  const displayTitle = scope === 'admin' ? `${title} Agent` : title;

  return (
    <div
      className="overflow-hidden rounded-lg border border-[#E4E4E8] bg-white p-5 border-l-[6px]"
      style={{ borderLeftColor: brand.solid }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 bg-white"
            style={{ borderColor: brand.solid, backgroundColor: brand.tint }}
          >
            <Bot size={20} style={{ color: brand.solid }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold text-[#1A1A3E]" title={displayTitle}>
              {displayTitle}
            </div>
            <div className="mt-0.5 truncate text-[12px] text-[#6B6B80]" title={description}>
              {description}
            </div>
          </div>
        </div>
        <AgentEnableToggle enabled={enabled} onToggle={onToggle} aria-label={`Enable ${title}`} />
      </div>

      {scope === 'admin' && stats && stats.length > 0 ? (
        <div className="mb-4 grid grid-cols-3 gap-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-md border border-[#E4E4E8] bg-[#F7F7F8] p-2.5">
              <div className="truncate text-[18px] font-semibold leading-none text-[#1A1A3E]" title={s.value}>
                {s.value}
              </div>
              <div className="mt-1 truncate text-[11px] text-[#9999AA]" title={s.label}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          'flex items-center',
          scope === 'admin' && lastEdited ? 'justify-between' : 'justify-end'
        )}
      >
        {scope === 'admin' && lastEdited ? (
          <span className="truncate text-[11px] text-[#9999AA]" title={`Edited ${lastEdited}`}>
            Edited {lastEdited}
          </span>
        ) : null}
        <Link href={configureHref}>
          <a className="scale-btn-primary flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 text-[13px]">
            Configure
            <ArrowRight size={12} />
          </a>
        </Link>
      </div>
    </div>
  );
}
