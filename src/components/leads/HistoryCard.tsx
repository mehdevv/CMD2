import { TimelineItem } from '@/components/ui/TimelineItem';

export interface HistoryCardItem {
  date: string;
  type: string;
  snippet: string;
}

const DEFAULT_ITEMS: HistoryCardItem[] = [
  { date: '2h ago', type: 'Automation message', snippet: 'Step 2 follow-up sent' },
  { date: '4h ago', type: 'Lead created', snippet: 'From WhatsApp Ad' },
  { date: '1d ago', type: 'Stage change', snippet: 'New → Contacted' },
];

export interface HistoryCardProps {
  items?: HistoryCardItem[];
}

/** History section for contact aside (inside parent `scale-card`). */
export function HistoryCard({ items = DEFAULT_ITEMS }: HistoryCardProps) {
  return (
    <div className="p-5">
      <h4 className="mb-3 text-[13px] font-medium text-[#1A1A3E]">History</h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <TimelineItem
            key={i}
            meta={
              <>
                <span>{item.date}</span>
                <span>·</span>
                <span>{item.type}</span>
              </>
            }
            description={item.snippet}
          />
        ))}
      </div>
    </div>
  );
}
