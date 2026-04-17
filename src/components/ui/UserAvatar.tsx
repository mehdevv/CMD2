import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  /** When true, shows the full name next to the initials bubble. */
  showName?: boolean;
  className?: string;
}

const SIZES: Record<NonNullable<UserAvatarProps['size']>, string> = {
  sm: 'h-5 w-5 text-[9px]',
  md: 'h-6 w-6 text-[10px]',
  lg: 'h-8 w-8 text-[12px]',
};

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function UserAvatar({ name, size = 'md', showName, className }: UserAvatarProps) {
  const bubble = (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-[#F0F0F2] font-semibold text-[#1A1A3E]',
        SIZES[size],
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );

  if (!showName) {
    return bubble;
  }

  return (
    <div className="flex items-center gap-2">
      {bubble}
      <span className="text-[13px] text-[#6B6B80]">{name}</span>
    </div>
  );
}
