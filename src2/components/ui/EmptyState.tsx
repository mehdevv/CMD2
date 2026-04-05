import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  heading?: string;
  subtext?: string;
}

export function EmptyState({ icon, heading = 'Nothing here yet', subtext = 'Items will appear here once added.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-[#E4E4E8] mb-3">
        {icon ?? <Inbox size={32} />}
      </div>
      <p className="text-[15px] font-medium text-[#1A1A3E]">{heading}</p>
      <p className="text-[14px] text-[#6B6B80] mt-1 max-w-xs">{subtext}</p>
    </div>
  );
}
