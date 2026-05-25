import { cn } from '@/lib/utils';
import type { Conversation } from '@/lib/types';
import { ConversationListRow } from '@/components/conversations/ConversationListRow';
import { MotionStagger } from '@/components/motion';
import { SearchField } from '@/components/ui/SearchField';

export type ConversationListTab = 'all' | 'ai' | 'human' | 'pending';

const TABS: { id: ConversationListTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'Automation active' },
  { id: 'human', label: 'Human Active' },
  { id: 'pending', label: 'Pending' },
];

export interface ConversationListPanelProps {
  search: string;
  onSearchChange: (v: string) => void;
  tab: ConversationListTab;
  onTabChange: (t: ConversationListTab) => void;
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (c: Conversation) => void;
  className?: string;
}

export function ConversationListPanel({
  search,
  onSearchChange,
  tab,
  onTabChange,
  conversations,
  selectedId,
  onSelect,
  className,
}: ConversationListPanelProps) {
  const filtered = conversations.filter(c => {
    if (search && !c.leadName.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === 'ai' && c.aiStatus !== 'active') return false;
    if (tab === 'human' && c.aiStatus !== 'paused') return false;
    if (tab === 'pending' && c.aiStatus !== 'escalated') return false;
    return true;
  });

  return (
    <div
      className={cn(
        'flex w-full flex-shrink-0 flex-col border-r border-[#E4E4E8] bg-white md:w-[min(320px,40vw)]',
        className
      )}
    >
      <div className="border-b border-[#E4E4E8] p-3">
        <SearchField
          value={search}
          onChange={onSearchChange}
          placeholder="Search conversations…"
          inputTestId="input-search-inbox"
        />
      </div>

      <div className="flex overflow-x-auto border-b border-[#E4E4E8] md:overflow-visible">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={cn(
              'min-w-[4.5rem] flex-1 whitespace-nowrap px-1 py-2 text-[11px] font-medium transition-colors sm:text-[12px]',
              tab === t.id ? 'border-b-2 border-[#2B62E8] text-[#1A1A3E]' : 'text-[#6B6B80] hover:text-[#1A1A3E]'
            )}
            data-testid={`button-tab-${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <MotionStagger className="scale-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {filtered.map(c => (
          <ConversationListRow
            key={c.id}
            conversation={c}
            selected={selectedId === c.id}
            onSelect={() => onSelect(c)}
          />
        ))}
      </MotionStagger>
    </div>
  );
}
