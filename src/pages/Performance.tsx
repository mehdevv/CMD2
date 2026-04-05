import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MOCK_AI_AGENT_METRICS as rawMetrics, MOCK_LEADERBOARD } from '@/lib/mock-data';

export default function PerformancePage() {
  const [digestDay, setDigestDay] = useState('Monday');
  const [digestEmail, setDigestEmail] = useState('');
  const [includes, setIncludes] = useState({ kpis: true, intelligence: true, agentStats: true });

  return (
    <AppShell title="Performance">
      {/* AI Agent Metrics */}
      <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-4">AI agent performance</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {rawMetrics.map((agent) => (
          <div key={agent.name} className="scale-card">
            <h4 className="text-[15px] font-medium text-[#1A1A3E] mb-4">{agent.name}</h4>
            <div className="space-y-3">
              {[
                { label: agent.metric1Label, value: agent.metric1Value },
                { label: agent.metric2Label, value: agent.metric2Value },
                { label: agent.metric3Label, value: agent.metric3Value },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between border-b border-[#E4E4E8] pb-2 last:border-0 last:pb-0">
                  <span className="text-[13px] text-[#6B6B80]">{m.label}</span>
                  <span className="text-[14px] font-medium text-[#1A1A3E]">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-4">Sales agent leaderboard</h2>
      <div className="scale-card p-0 overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Rank</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Agent</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Leads</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Response rate</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Closed</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADERBOARD.map(row => (
              <tr key={row.rank} className="border-b border-[#E4E4E8] last:border-0 hover:bg-[#F7F7F8]" style={{ height: 48 }} data-testid={`row-leaderboard-${row.rank}`}>
                <td className="px-4 text-[14px] font-medium text-[#9999AA]">#{row.rank}</td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#F0F0F2] flex items-center justify-center text-[11px] font-semibold text-[#1A1A3E]">
                      {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-[14px] font-medium text-[#1A1A3E]">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 text-[13px] text-[#6B6B80]">{row.leads}</td>
                <td className="px-4 text-[13px] text-[#1A1A3E]">{row.responseRate}</td>
                <td className="px-4 text-[13px] text-[#1A1A3E]">{row.closed}</td>
                <td className="px-4 text-[13px] text-[#16A34A]">{row.conversion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Weekly Digest */}
      <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-4">Weekly digest</h2>
      <div className="scale-card max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Send day</label>
            <select value={digestDay} onChange={e => setDigestDay(e.target.value)} className="scale-input w-40" data-testid="select-digest-day">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Sunday'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Include</label>
            <div className="space-y-2">
              {([['kpis', 'KPI summary'], ['intelligence', 'Intelligence highlights'], ['agentStats', 'Agent stats']] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includes[key]}
                    onChange={e => setIncludes(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded"
                    data-testid={`checkbox-digest-${key}`}
                  />
                  <span className="text-[13px] text-[#1A1A3E]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Recipients</label>
            <input
              type="email"
              value={digestEmail}
              onChange={e => setDigestEmail(e.target.value)}
              placeholder="email@company.dz"
              className="scale-input"
              data-testid="input-digest-email"
            />
          </div>

          <button className="scale-btn-primary" data-testid="button-save-digest">Save settings</button>
        </div>
      </div>
    </AppShell>
  );
}
