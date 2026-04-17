import { DataTable } from '@/components/ui/DataTable';
import { ChannelDot } from '@/components/ui/ChannelDot';
import { TemplateBadge } from '@/components/ui/ScaleBadge';
import type { Channel } from '@/lib/types';

export interface PendingTemplateRow {
  id: string;
  name: string;
  channel: Channel;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PendingTemplatesTableProps {
  rows: PendingTemplateRow[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function PendingTemplatesTable({ rows, onApprove, onReject }: PendingTemplatesTableProps) {
  if (rows.length === 0) {
    return <p className="p-5 text-[13px] text-[#9999AA]">No pending templates.</p>;
  }

  return (
    <DataTable
      columns={[
        { key: 'name', header: 'Template' },
        { key: 'channel', header: 'Channel' },
        { key: 'status', header: 'Status' },
        { key: 'actions', header: 'Actions', className: 'text-right' },
      ]}
      rows={rows.map(t => ({
        id: t.id,
        cells: [
          <span key="n" className="text-[14px] font-medium text-[#1A1A3E]">
            {t.name}
          </span>,
          <ChannelDot key="c" channel={t.channel} showLabel />,
          <TemplateBadge key="s" status={t.status} />,
          <div key="a" className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="text-[13px] text-[#16A34A] hover:underline"
              onClick={() => onApprove?.(t.id)}
            >
              Approve
            </button>
            <button
              type="button"
              className="text-[13px] text-[#DC2626] hover:underline"
              onClick={() => onReject?.(t.id)}
            >
              Reject
            </button>
          </div>,
        ],
      }))}
    />
  );
}
