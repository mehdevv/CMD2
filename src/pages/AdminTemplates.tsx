import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { SearchField } from '@/components/ui/SearchField';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { TemplateBadge } from '@/components/ui/ScaleBadge';
import { MOCK_TEMPLATES } from '@/lib/mock-data';
import { Template } from '@/lib/types';

export default function AdminTemplatesPage() {
  const [templates] = useState<Template[]>(MOCK_TEMPLATES);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editName, setEditName] = useState('');
  const [editChannel, setEditChannel] = useState('whatsapp');
  const [editBody, setEditBody] = useState('');

  const filtered = templates.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (channelFilter && t.channel !== channelFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <AppShell title="Templates">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="max-w-xs flex-1">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search templates…"
            inputTestId="input-search-templates"
          />
        </div>
        <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} className="scale-input w-36" data-testid="select-filter-channel">
          <option value="">All channels</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="scale-input w-36" data-testid="select-filter-status">
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={() => setShowEditor(true)} className="scale-btn-primary ml-auto" data-testid="button-new-template">
          <Plus size={14} /> New template
        </button>
      </div>

      {/* Table */}
      <div className="scale-card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Name</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Preview</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Channel</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Status</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Used in</th>
              <th className="py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-[#E4E4E8] last:border-0 hover:bg-[#F7F7F8]" style={{ height: 48 }} data-testid={`row-template-${t.id}`}>
                <td className="px-4 text-[14px] font-medium text-[#1A1A3E]">{t.name}</td>
                <td className="px-4 text-[13px] text-[#6B6B80] max-w-xs">{t.body.slice(0, 60)}{t.body.length > 60 ? '…' : ''}</td>
                <td className="px-4"><ChannelDot channel={t.channel} showLabel /></td>
                <td className="px-4"><TemplateBadge status={t.status} /></td>
                <td className="px-4 text-[13px] text-[#6B6B80]">{t.usedIn} sequences</td>
                <td className="px-4">
                  <div className="flex items-center gap-3 justify-end">
                    <button className="text-[13px] text-[#6B6B80] hover:text-[#1A1A3E]">Edit</button>
                    <button className="text-[13px] text-[#6B6B80] hover:text-[#1A1A3E]">Duplicate</button>
                    <button className="text-[13px] text-[#DC2626] hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="bg-white border border-[#E4E4E8] rounded-lg overflow-hidden w-full max-w-[640px] flex">
            {/* Form */}
            <div className="flex-1 p-6 border-r border-[#E4E4E8]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[17px] font-semibold text-[#1A1A3E]">New template</h3>
                <button onClick={() => setShowEditor(false)} className="text-[#9999AA] hover:text-[#6B6B80]"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Template name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="e.g. Lead Welcome WA" className="scale-input" data-testid="input-template-name" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Channel</label>
                  <select value={editChannel} onChange={e => setEditChannel(e.target.value)} className="scale-input" data-testid="select-template-channel">
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Message body</label>
                  <textarea
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    placeholder="Type your message here... Use {{name}}, {{product}}, {{company}}"
                    className="scale-input resize-none py-2 w-full"
                    style={{ height: 120 }}
                    data-testid="textarea-template-body"
                  />
                  <p className="text-[12px] text-[#9999AA] mt-1">Variables: {'{{name}}'}, {'{{product}}'}, {'{{company}}'}, {'{{agent_name}}'}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="scale-btn-primary flex-1 justify-center" data-testid="button-submit-template">Submit for review</button>
                  <button onClick={() => setShowEditor(false)} className="scale-btn-secondary">Cancel</button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="w-56 p-6 bg-[#F7F7F8] flex flex-col items-center">
              <p className="text-[12px] text-[#9999AA] mb-4 text-center">Preview</p>
              <div className="w-36 bg-[#E4E4E8] rounded-xl p-3" style={{ minHeight: 200 }}>
                <div className="bg-[#DCF8C6] rounded-lg p-2 text-[11px] text-[#1A1A3E] leading-snug">
                  {editBody || 'Your message preview will appear here...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
