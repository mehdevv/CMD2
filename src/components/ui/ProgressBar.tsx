interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValues?: boolean;
}

export function ProgressBar({ value, max, label, showValues }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      {(label || showValues) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-[13px] text-[#6B6B80]">{label}</span>}
          {showValues && <span className="text-[13px] text-[#1A1A3E] font-medium">{value.toLocaleString()} / {max.toLocaleString()}</span>}
        </div>
      )}
      <div className="h-1 rounded-full bg-[#E4E4E8] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#2B62E8]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
