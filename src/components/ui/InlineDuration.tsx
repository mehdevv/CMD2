interface InlineDurationProps {
  value: number;
  unit: string;
  onValueChange: (v: number) => void;
  onUnitChange: (u: string) => void;
}

export function InlineDuration({ value, unit, onValueChange, onUnitChange }: InlineDurationProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={e => onValueChange(Number(e.target.value))}
        className="scale-input w-20"
      />
      <select
        value={unit}
        onChange={e => onUnitChange(e.target.value)}
        className="scale-input w-32"
      >
        <option value="minutes">minutes</option>
        <option value="hours">hours</option>
        <option value="days">days</option>
      </select>
      {value === 0 && unit === 'minutes' && (
        <span className="text-[12px] text-[#9999AA]">(immediately)</span>
      )}
    </div>
  );
}
