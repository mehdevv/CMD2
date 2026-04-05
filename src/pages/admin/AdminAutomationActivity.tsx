import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';

type LogType = 'sequence' | 'escalation' | 'refund' | 'tracking' | 'chat';

interface LogRow {
  id: string;
  time: string;
  type: LogType;
  agent: string;
  contact: string;
  summary: string;
}

const MOCK_LOG: LogRow[] = [
  { id: '1', time: 'Today 14:32', type: 'escalation', agent: 'Client Chat', contact: 'Yasmine B.', summary: 'Confidence 0.42 — escalated to Mehdi K.' },
  { id: '2', time: 'Today 14:18', type: 'sequence', agent: 'Lead Follow-Up', contact: 'Omar T.', summary: 'Sequence stopped — lead replied (step 2 skipped)' },
  { id: '3', time: 'Today 13:55', type: 'tracking', agent: 'Order Tracking', contact: 'Leïla M.', summary: 'Status shipped → message sent (WhatsApp)' },
  { id: '4', time: 'Today 12:40', type: 'refund', agent: 'Refund', contact: 'Karim H.', summary: 'Auto-approved — 1,200 DZD within policy' },
  { id: '5', time: 'Today 11:02', type: 'escalation', agent: 'Refund', contact: 'Samir K.', summary: 'Escalated to owner — value 18,500 DZD' },
  { id: '6', time: 'Yesterday 18:22', type: 'chat', agent: 'Client Chat', contact: 'Nadia R.', summary: 'FAQ match — delivery times (98% confidence)' },
  { id: '7', time: 'Yesterday 16:10', type: 'sequence', agent: 'Lead Follow-Up', contact: 'Hichem A.', summary: 'Step 3 sent — +1 day delay' },
  { id: '8', time: 'Yesterday 09:45', type: 'tracking', agent: 'Order Tracking', contact: 'Amel S.', summary: 'Dissatisfied reply — Refund agent triggered + owner notified' },
];

const TYPE_LABEL: Record<LogType, string> = {
  sequence: 'Sequence',
  escalation: 'Escalation',
  refund: 'Refund',
  tracking: 'Tracking',
  chat: 'Chat',
};

const TYPE_STYLE: Record<LogType, string> = {
  sequence: 'bg-[#EEF3FD] text-[#1E3A8A]',
  escalation: 'bg-[#FEF2F2] text-[#B91C1C]',
  refund: 'bg-[#F7F7F8] text-[#1A1A3E]',
  tracking: 'bg-[#F0FDF4] text-[#166534]',
  chat: 'bg-[#FFFBEB] text-[#B45309]',
};

export default function AdminAutomationActivity() {
  const [q, setQ] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<LogType | ''>('');

  const filtered = useMemo(() => {
    return MOCK_LOG.filter(row => {
      if (q && !row.contact.toLowerCase().includes(q.toLowerCase()) && !row.summary.toLowerCase().includes(q.toLowerCase())) return false;
      if (agentFilter && row.agent !== agentFilter) return false;
      if (typeFilter && row.type !== typeFilter) return false;
      return true;
    });
  }, [q, agentFilter, typeFilter]);

  const agents = [...new Set(MOCK_LOG.map(r => r.agent))];

  return (
    <AppShell title="Automation activity">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1A1A3E]">Activity log</h1>
        <p className="text-[13px] text-[#6B6B80] mt-1">Automation events, escalations, refund decisions, and sequence stops (sample data).</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          placeholder="Search contact or summary…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="scale-input flex-1 min-w-[200px] max-w-md"
        />
        <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} className="scale-input w-44">
          <option value="">All agents</option>
          {agents.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as LogType | '')} className="scale-input w-40">
          <option value="">All types</option>
          {(Object.keys(TYPE_LABEL) as LogType[]).map(t => (
            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
          ))}
        </select>
      </div>

      <div className="scale-card p-0 overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="bg-[#F7F7F8] border-b border-[#E4E4E8]">
              <th className="py-3 px-4 font-medium text-[#6B6B80]">Time</th>
              <th className="py-3 px-4 font-medium text-[#6B6B80]">Type</th>
              <th className="py-3 px-4 font-medium text-[#6B6B80]">Agent</th>
              <th className="py-3 px-4 font-medium text-[#6B6B80]">Contact</th>
              <th className="py-3 px-4 font-medium text-[#6B6B80]">Summary</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id} className="border-b border-[#E4E4E8] last:border-0">
                <td className="py-3 px-4 text-[#6B6B80] whitespace-nowrap">{row.time}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_STYLE[row.type]}`}>
                    {TYPE_LABEL[row.type]}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#1A1A3E]">{row.agent}</td>
                <td className="py-3 px-4 text-[#1A1A3E] font-medium">{row.contact}</td>
                <td className="py-3 px-4 text-[#6B6B80]">{row.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-[#9999AA]">No events match your filters.</div>
        )}
      </div>
    </AppShell>
  );
}
