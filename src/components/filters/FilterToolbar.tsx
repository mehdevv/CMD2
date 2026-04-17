import { cn } from '@/lib/utils';
import { SearchField } from '@/components/ui/SearchField';

export interface FilterToolbarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputTestId?: string;
}

export interface FilterToolbarProps {
  search?: FilterToolbarSearchProps;
  /** Extra selects / controls between search and `right`. */
  filters?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function FilterToolbar({ search, filters, right, className }: FilterToolbarProps) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-center justify-between gap-3', className)}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {search ? (
          <div className="max-w-md min-w-[12rem] flex-1">
            <SearchField
              value={search.value}
              onChange={search.onChange}
              placeholder={search.placeholder ?? 'Search…'}
              inputTestId={search.inputTestId}
            />
          </div>
        ) : null}
        {filters}
      </div>
      {right ? <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{right}</div> : null}
    </div>
  );
}
