interface RadioOption {
  value: string;
  label: string;
  desc?: string;
}

interface RadioCardsProps {
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
  cols?: number;
}

export function RadioCards({ options, value, onChange, cols = 2 }: RadioCardsProps) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="text-left rounded-lg border p-3 transition-colors"
          style={{
            borderColor: value === opt.value ? '#2B62E8' : '#E4E4E8',
            background: value === opt.value ? '#EEF3FD' : '#FFFFFF',
          }}
        >
          <div className="text-[13px] font-medium text-[#1A1A3E]">{opt.label}</div>
          {opt.desc && <div className="text-[12px] text-[#6B6B80] mt-0.5">{opt.desc}</div>}
        </button>
      ))}
    </div>
  );
}
