import { useState } from 'react';
import { Link } from 'wouter';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { StageBadge } from '@/components/ui/ScaleBadge';
import { AIStatusLabel } from '@/components/ui/AIStatusLabel';
import { MOCK_LEADS, MOCK_AGENTS } from '@/lib/mock-data';
import { Lead, Stage } from '@/lib/types';

const STAGES: Stage[] = ['new', 'contacted', 'qualified', 'proposal', 'closed'];
const STAGE_LABELS: Record<Stage, string> = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', proposal: 'Proposal', closed: 'Closed' };

export default function LeadsPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');

  const filtered = MOCK_LEADS.filter(l => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (stageFilter && l.stage !== stageFilter) return false;
    if (channelFilter && l.channel !== channelFilter) return false;
    return true;
  });

  const byStage = (stage: Stage) => filtered.filter(l => l.stage === stage);

  return (
    <AppShell title="Leads">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9999AA]" />
            <input
              type="search"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="scale-input pl-8 w-48"
              data-testid="input-search-leads"
            />
          </div>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="scale-input w-36" data-testid="select-filter-stage">
            <option value="">All stages</option>
            {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
          <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} className="scale-input w-36" data-testid="select-filter-channel">
            <option value="">All channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#E4E4E8] rounded-md overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] transition-colors ${view === 'kanban' ? 'bg-[#F0F0F2] text-[#1A1A3E] font-medium' : 'text-[#6B6B80] hover:bg-[#F7F7F8]'}`}
              data-testid="button-view-kanban"
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <div className="w-px h-6 bg-[#E4E4E8]" />
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] transition-colors ${view === 'list' ? 'bg-[#F0F0F2] text-[#1A1A3E] font-medium' : 'text-[#6B6B80] hover:bg-[#F7F7F8]'}`}
              data-testid="button-view-list"
            >
              <List size={14} /> List
            </button>
          </div>
          <button className="scale-btn-primary" data-testid="button-add-lead">
            <Plus size={14} /> Add lead
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        /* Kanban */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const leads = byStage(stage);
            return (
              <div key={stage} className="flex-shrink-0 w-56">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[13px] font-medium text-[#1A1A3E]">{STAGE_LABELS[stage]}</span>
                  <span className="text-[11px] text-[#9999AA] bg-[#F0F0F2] px-1.5 py-0.5 rounded-full">{leads.length}</span>
                </div>
                <div className="space-y-2">
                  {leads.map(lead => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <a className="block bg-white border border-[#E4E4E8] rounded-lg p-3 hover:border-[#C8C8D0] transition-colors cursor-pointer" data-testid={`card-lead-${lead.id}`}>
                        <div className="text-[14px] font-medium text-[#1A1A3E] mb-1.5">{lead.name}</div>
                        <ChannelDot channel={lead.channel} showLabel />
                        <div className="mt-1.5"><AIStatusLabel status={lead.aiStatus} /></div>
                        <div className="text-[12px] text-[#9999AA] mt-1">{lead.lastContact}</div>
                      </a>
                    </Link>
                  ))}
                  {leads.length === 0 && (
                    <div className="border border-dashed border-[#E4E4E8] rounded-lg p-4 text-center">
                      <p className="text-[12px] text-[#9999AA]">No leads</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List */
        <div className="scale-card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
                <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Name</th>
                <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Phone</th>
                <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Stage</th>
                <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">AI status</th>
                <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Agent</th>
                <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Last contact</th>
                <th className="py-2 px-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr
                  key={lead.id}
                  className="hover:bg-[#F7F7F8] transition-colors"
                  style={{ height: 48, borderBottom: '1px solid #E4E4E8', background: i % 2 === 1 ? '#F7F7F8' : undefined }}
                  data-testid={`row-lead-${lead.id}`}
                >
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <ChannelDot channel={lead.channel} />
                      <Link href={`/leads/${lead.id}`}><a className="text-[14px] font-medium text-[#1A1A3E] hover:text-[#2B62E8]">{lead.name}</a></Link>
                    </div>
                  </td>
                  <td className="px-4 text-[13px] text-[#6B6B80]">{lead.phone}</td>
                  <td className="px-4"><StageBadge stage={lead.stage} /></td>
                  <td className="px-4"><AIStatusLabel status={lead.aiStatus} /></td>
                  <td className="px-4 text-[13px] text-[#6B6B80]">{lead.assignedTo}</td>
                  <td className="px-4 text-[13px] text-[#6B6B80]">{lead.lastContact}</td>
                  <td className="px-4">
                    <button className="text-[#9999AA] hover:text-[#6B6B80] text-[16px]">···</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
