import { cn } from '@/lib/utils';

export interface StickySaveBarProps {
  dirty: boolean;
  saving?: boolean;
  onSave: () => void;
  onDiscard?: () => void;
  hint?: string;
  className?: string;
}

export function StickySaveBar({ dirty, saving, onSave, onDiscard, hint, className }: StickySaveBarProps) {
  if (!dirty) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4E8] bg-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(26,26,62,0.08)] backdrop-blur',
        className
      )}
      role="region"
      aria-label="Unsaved changes"
    >
      <p className="text-[13px] text-[#6B6B80] min-w-0">{hint ?? 'You have unsaved changes.'}</p>
      <div className="flex flex-wrap items-center gap-2">
        {onDiscard ? (
          <button type="button" className="scale-btn-secondary text-[13px]" onClick={onDiscard} disabled={saving}>
            Discard
          </button>
        ) : null}
        <button type="button" className="scale-btn-primary text-[13px]" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
