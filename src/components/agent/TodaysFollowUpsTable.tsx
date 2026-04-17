import { DataTable } from '@/components/ui/DataTable';
import { ChannelDot } from '@/components/ui/ChannelDot';
import type { Channel } from '@/lib/types';

export interface TodaysFollowUpRow {
  contact: string;
  preview: string;
  channel: Channel;
  time: string;
  status: string;
}

export interface TodaysFollowUpsTableProps {
  rows: TodaysFollowUpRow[];
}

export function TodaysFollowUpsTable({ rows }: TodaysFollowUpsTableProps) {
  return (
    <DataTable
      columns={[
        { key: 'contact', header: 'Contact' },
        { key: 'preview', header: 'Preview', className: 'max-w-xs' },
        { key: 'channel', header: 'Channel' },
        { key: 'time', header: 'Time' },
        { key: 'status', header: 'Status' },
      ]}
      rows={rows.map((f, i) => ({
        id: String(i),
        cells: [
          <span key="c" className="text-[14px] font-medium text-[#1A1A3E]">
            {f.contact}
          </span>,
          <span key="p" className="max-w-xs truncate text-[13px] text-[#6B6B80]">
            {f.preview}
          </span>,
          <ChannelDot key="ch" channel={f.channel} showLabel />,
          <span key="t" className="text-[13px] text-[#6B6B80]">
            {f.time}
          </span>,
          <span
            key="s"
            className={`text-[13px] ${f.status === 'Sent' ? 'text-[#16A34A]' : 'text-[#D97706]'}`}
          >
            {f.status}
          </span>,
        ],
      }))}
    />
  );
}
