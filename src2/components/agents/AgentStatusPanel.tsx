import { useState } from 'react';

interface StatRow {
  label: string;
  value: string;
}

interface AgentStatusPanelProps {
  agentId: string;
  stats: StatRow[];
  lastEdited?: string;
  onTest?: () => void;
  extraStats?: ReactNode;
}

import { ReactNode } from 'react';

export function AgentStatusPanel({ agentId, stats, lastEdited, onTest, extraStats }: AgentStatusPanelProps) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="scale-card">
      {/* Enable toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-medium text-[#1A1A3E]">Agent status</span>
        <button
          onClick={() => setEnabled(v => !v)}
          className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
          style={{ background: enabled ? '#2B62E8' : '#E4E4E8' }}
          data-testid={`toggle-agent-${agentId}`}
        >
          <span
            className="absolute top-0.5 rounded-full w-4 h-4 bg-white transition-transform"
            style={{ left: enabled ? '22px' : '2px' }}
          />
        </button>
      </div>
      <div className="text-[12px] mb-4" style={{ color: enabled ? '#16A34A' : '#9999AA' }}>
        {enabled ? '● Active' : '● Paused'}
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        {stats.map(s => (
          <div key={s.label} className="flex items-center justify-between border-b border-[#E4E4E8] pb-2 last:border-0 last:pb-0">
            <span className="text-[12px] text-[#6B6B80]">{s.label}</span>
            <span className="text-[13px] font-medium text-[#1A1A3E]">{s.value}</span>
          </div>
        ))}
      </div>

      {extraStats}

      {lastEdited && (
        <div className="text-[11px] text-[#9999AA] mb-3">Last edited: {lastEdited}</div>
      )}

      {onTest && (
        <button onClick={onTest} className="scale-btn-secondary w-full justify-center text-[13px]" data-testid={`button-test-${agentId}`}>
          Test agent
        </button>
      )}
    </div>
  );
}
