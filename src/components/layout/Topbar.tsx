import { useState } from 'react';
import { useLocation } from 'wouter';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { roleLabel } from '@/lib/utils';
import { getAgentBrandSolidForPathname } from '@/lib/agent-brand';
import { SearchField } from '@/components/ui/SearchField';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopbarProps {
  title: string;
  /** Optional override for the bottom accent (defaults from route for agent pages). */
  accentColor?: string;
}

export function Topbar({ title, accentColor: accentOverride }: TopbarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  const accentColor = accentOverride ?? getAgentBrandSolidForPathname(location);

  return (
    <header
      className="fixed right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[#E4E4E8] bg-white px-6"
      style={{ left: 220 }}
    >
      <span className="min-w-0 flex-1 truncate pr-4 text-[15px] font-semibold text-[#1A1A3E]" title={title}>
        {title}
      </span>
      <div className="flex flex-shrink-0 items-center gap-3">
        <div className="w-48 flex-shrink-0">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search…"
            inputTestId="input-search-topbar"
          />
        </div>
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded text-[#6B6B80] transition-colors hover:bg-[#F7F7F8] hover:text-[#1A1A3E]"
          data-testid="button-notifications"
        >
          <Bell size={16} />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#2B62E8]" />
        </button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#EEF3FD] text-[11px] font-semibold text-[#2B62E8] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#2B62E8]"
                data-testid="button-user-menu"
                aria-label="Account menu"
              >
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <div className="truncate text-[13px] font-medium text-[#1A1A3E]" title={user.name}>
                  {user.name}
                </div>
                <div className="truncate text-[11px] text-[#9999AA]" title={roleLabel(user.role)}>
                  {roleLabel(user.role)}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-[13px]"
                onSelect={() => logout()}
                data-testid="button-logout"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      {accentColor ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1"
          style={{ backgroundColor: accentColor }}
          aria-hidden
        />
      ) : null}
    </header>
  );
}
