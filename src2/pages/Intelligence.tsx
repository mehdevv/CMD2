import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MOCK_INTELLIGENCE, MOCK_LEADS } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const objections = MOCK_INTELLIGENCE.filter(i => i.type === 'objection');
const opportunities = MOCK_INTELLIGENCE.filter(i => i.type === 'opportunity');
const risks = MOCK_INTELLIGENCE.filter(i => i.type === 'risk');

const objectionChartData = objections.map(o => ({
  name: o.headline.length > 30 ? o.headline.slice(0, 30) + '…' : o.headline,
  count: o.frequency ?? 0,
}));

const BEST_RESPONSES = [
  '"Notre ROI moyen est de 3x en 90 jours. Je peux vous envoyer le cas client."',
  '"On peut commencer avec un pilot à 200 unités — risque zéro pour votre équipe."',
  '"Voici 3 clients similaires à votre secteur avec leurs résultats."',
];

const SCRIPT_IMPROVEMENTS = [
  'Introduce social proof earlier — ideally in Step 2 of the follow-up sequence',
  'Add a specific ROI number to the initial outreach message',
  'Create a "pilot offer" template for objection handling',
  'Shorten the refund policy message — current version loses attention after line 3',
];

const FUNNEL_DATA = [
  { stage: 'New', count: 6, conversion: '100%' },
  { stage: 'Contacted', count: 4, conversion: '67%' },
  { stage: 'Qualified', count: 3, conversion: '75%' },
  { stage: 'Proposal', count: 3, conversion: '100%' },
  { stage: 'Closed', count: 3, conversion: '100%' },
];

type Tab = 'objections' | 'opportunities' | 'risk';

export default function IntelligencePage() {
  const [tab, setTab] = useState<Tab>('objections');

  const atRisk = MOCK_LEADS.filter(l => l.aiStatus === 'escalated' || l.lastContact.includes('14d') || l.lastContact.includes('7d'));

  return (
    <AppShell title="Intelligence">
      {/* Controls */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          {(['objections', 'opportunities', 'risk'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[14px] pb-1 transition-colors ${tab === t ? 'text-[#1A1A3E] font-medium border-b-2 border-[#1A1A3E]' : 'text-[#6B6B80] hover:text-[#1A1A3E]'}`}
              data-testid={`button-tab-${t}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select className="scale-input w-36" data-testid="select-date-range">
            <option>This week</option>
            <option>This month</option>
            <option>Last 30 days</option>
          </select>
          <select className="scale-input w-36" data-testid="select-agent-filter">
            <option>All agents</option>
            <option>Mehdi Kaci</option>
            <option>Sara Boukhalfa</option>
            <option>Nassim Rahmani</option>
          </select>
        </div>
      </div>

      {/* Objections Tab */}
      {tab === 'objections' && (
        <div className="space-y-6">
          <div className="scale-card">
            <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Top objections by frequency</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={objectionChartData} layout="vertical" barSize={16}>
                <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={200} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: '1px solid #E4E4E8', borderRadius: 6, boxShadow: 'none' }}
                  cursor={{ fill: '#F7F7F8' }}
                />
                <Bar dataKey="count" fill="#2B62E8" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="scale-card">
              <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Best responses that worked</h3>
              <div className="space-y-3">
                {BEST_RESPONSES.map((r, i) => (
                  <div key={i} className="text-[13px] text-[#1A1A3E] font-mono bg-[#F7F7F8] px-3 py-2 rounded-md leading-relaxed border-l-2 border-[#2B62E8]">
                    {r}
                  </div>
                ))}
              </div>
            </div>

            <div className="scale-card">
              <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Script improvements</h3>
              <ol className="space-y-2.5">
                {SCRIPT_IMPROVEMENTS.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[12px] font-semibold text-[#2B62E8] mt-0.5 flex-shrink-0">{i + 1}.</span>
                    <p className="text-[13px] text-[#6B6B80]">{imp}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Opportunities Tab */}
      {tab === 'opportunities' && (
        <div className="space-y-6">
          <div className="scale-card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
                  <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Contact</th>
                  <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Signal detected</th>
                  <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Last interaction</th>
                  <th className="py-2 px-4" />
                </tr>
              </thead>
              <tbody>
                {opportunities.map(opp => (
                  <tr key={opp.id} className="border-b border-[#E4E4E8] last:border-0 hover:bg-[#F7F7F8]" style={{ height: 48 }}>
                    <td className="px-4 text-[14px] font-medium text-[#1A1A3E]">{opp.headline.split(' ')[0]}</td>
                    <td className="px-4 text-[13px] text-[#6B6B80] max-w-xs">{opp.detail}</td>
                    <td className="px-4 text-[13px] text-[#6B6B80]">2h ago</td>
                    <td className="px-4">
                      <button className="scale-btn-primary text-[13px] py-1.5 px-3">Reach out</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="scale-card">
            <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Stage conversion rates</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2 text-[12px] font-medium text-[#6B6B80]">Stage</th>
                  <th className="text-left py-2 text-[12px] font-medium text-[#6B6B80]">Leads</th>
                  <th className="text-left py-2 text-[12px] font-medium text-[#6B6B80]">Conversion to next</th>
                </tr>
              </thead>
              <tbody>
                {FUNNEL_DATA.map(row => (
                  <tr key={row.stage} className="border-t border-[#E4E4E8]" style={{ height: 44 }}>
                    <td className="text-[14px] font-medium text-[#1A1A3E]">{row.stage}</td>
                    <td className="text-[13px] text-[#6B6B80]">{row.count}</td>
                    <td className="text-[13px] text-[#16A34A]">{row.conversion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Risk Tab */}
      {tab === 'risk' && (
        <div className="space-y-6">
          <div className="scale-card p-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-[#E4E4E8]">
              <h3 className="text-[15px] font-medium text-[#1A1A3E]">At-risk accounts</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
                  <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Contact</th>
                  <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Days silent</th>
                  <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Deal value</th>
                  <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Agent</th>
                  <th className="py-2 px-4" />
                </tr>
              </thead>
              <tbody>
                {risks.map(risk => (
                  <tr key={risk.id} className="border-b border-[#E4E4E8] last:border-0 hover:bg-[#F7F7F8]" style={{ height: 48 }}>
                    <td className="px-4 text-[14px] font-medium text-[#DC2626]">{risk.headline.split(' ')[0]} {risk.headline.split(' ')[1]}</td>
                    <td className="px-4 text-[13px] text-[#DC2626]">14d</td>
                    <td className="px-4 text-[13px] text-[#1A1A3E]">9,500 DZD</td>
                    <td className="px-4 text-[13px] text-[#6B6B80]">Mehdi Kaci</td>
                    <td className="px-4">
                      <button className="text-[13px] text-[#2B62E8] hover:underline">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="scale-card">
            <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Weak follow-up patterns</h3>
            <ol className="space-y-2.5">
              {['Leads assigned to Mehdi Kaci have 31% lower Step 3 completion rate than team average', 'Facebook leads are not receiving follow-up messages on weekends', 'Post-meeting notes are missing for 40% of meetings this month', '3 agents have not sent any manual messages in 5+ days'].map((p, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-[12px] font-semibold text-[#D97706] mt-0.5">{i + 1}.</span>
                  <p className="text-[13px] text-[#6B6B80]">{p}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </AppShell>
  );
}
