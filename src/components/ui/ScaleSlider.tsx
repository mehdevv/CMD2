interface ScaleSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  labels?: { left?: string; center?: string; right?: string };
}

export function ScaleSlider({ value, min = 0, max = 1, step = 0.1, onChange, labels }: ScaleSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #2B62E8 ${pct}%, #E4E4E8 ${pct}%)`,
          }}
        />
        <span className="text-[13px] font-medium text-[#1A1A3E] w-8 text-right">{value}</span>
      </div>
      {labels && (
        <div className="flex justify-between text-[11px] text-[#9999AA] mt-1">
          <span>{labels.left}</span>
          {labels.center && <span>{labels.center}</span>}
          <span>{labels.right}</span>
        </div>
      )}
    </div>
  );
}
