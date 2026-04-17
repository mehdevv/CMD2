import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  inputTestId?: string;
  /** Show clear control when non-empty. Default true. */
  showClear?: boolean;
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  inputClassName,
  inputTestId,
  showClear = true,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('relative min-h-9 w-full', className)}>
      <Search
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-[#9999AA]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-7 top-1/2 z-[1] h-4 w-px -translate-y-1/2 bg-[#E4E4E8]"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Escape') onChange('');
        }}
        placeholder={placeholder}
        className={cn(
          'scale-input h-9 min-h-9 w-full pl-[36px] text-[13px]',
          showClear && value ? 'pr-9' : 'pr-3',
          inputClassName
        )}
        data-testid={inputTestId}
      />
      {showClear && value ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 z-[1] -translate-y-1/2 rounded p-0.5 text-[#9999AA] hover:bg-[#F7F7F8] hover:text-[#6B6B80]"
          aria-label="Clear search"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
