interface TimeRangeProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

export function TimeRange({ from, to, onFromChange, onToChange }: TimeRangeProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={from}
        onChange={e => onFromChange(e.target.value)}
        className="scale-input w-36"
      />
      <span className="text-[13px] text-[#9999AA]">–</span>
      <input
        type="time"
        value={to}
        onChange={e => onToChange(e.target.value)}
        className="scale-input w-36"
      />
    </div>
  );
}
