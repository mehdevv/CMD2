import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export interface RecentMeetingItem {
  id: string;
  name: string;
  date: string;
  summary: string;
  notesHref?: string;
}

export interface RecentMeetingListProps {
  items: RecentMeetingItem[];
}

export function RecentMeetingList({ items }: RecentMeetingListProps) {
  return (
    <div className="space-y-0">
      {items.map((m, i) => (
        <div
          key={m.id}
          className={cn('flex items-start gap-4 py-3', i < items.length - 1 && 'border-b border-[#E4E4E8]')}
        >
          <div className="flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#1A1A3E]">{m.name}</span>
              <span className="text-[12px] text-[#9999AA]">·</span>
              <span className="text-[12px] text-[#9999AA]">{m.date}</span>
            </div>
            <p className="line-clamp-1 truncate text-[13px] text-[#6B6B80]" title={m.summary}>
              {m.summary}
            </p>
          </div>
          <Link href={m.notesHref ?? `/meetings/notes/${m.id}`}>
            <a className="whitespace-nowrap text-[13px] text-[#2B62E8] hover:underline">View</a>
          </Link>
        </div>
      ))}
    </div>
  );
}
