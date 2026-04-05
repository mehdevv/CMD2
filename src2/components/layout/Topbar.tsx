import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user } = useAuth();
  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <header
      className="fixed top-0 right-0 z-40 flex items-center justify-between h-14 px-6 bg-white border-b border-[#E4E4E8]"
      style={{ left: 220 }}
    >
      <span className="text-[15px] font-semibold text-[#1A1A3E]">{title}</span>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9999AA]" />
          <input
            type="search"
            placeholder="Search..."
            className="scale-input pl-8 w-48 text-[13px]"
            data-testid="input-search-topbar"
          />
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded text-[#6B6B80] hover:bg-[#F7F7F8] hover:text-[#1A1A3E] transition-colors relative" data-testid="button-notifications">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#2B62E8]" />
        </button>
        <div className="w-7 h-7 rounded-full bg-[#EEF3FD] flex items-center justify-center text-[11px] font-semibold text-[#2B62E8]">
          {initials}
        </div>
      </div>
    </header>
  );
}
