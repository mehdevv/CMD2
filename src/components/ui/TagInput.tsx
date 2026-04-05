import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  examples?: string[];
  restrictive?: boolean;
}

export function TagInput({ value, onChange, placeholder = 'Add and press Enter', examples, restrictive }: TagInputProps) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const remove = (tag: string) => onChange(value.filter(t => t !== tag));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 p-2 border border-[#E4E4E8] rounded-md bg-white min-h-[36px]">
        {value.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[12px] font-medium"
            style={{
              background: restrictive ? '#FEF2F2' : '#F0F0F2',
              color: restrictive ? '#DC2626' : '#1A1A3E',
              borderLeft: restrictive ? '2px solid #DC2626' : undefined,
            }}
          >
            {tag}
            <button type="button" onClick={() => remove(tag)} className="opacity-50 hover:opacity-100">
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none text-[13px] text-[#1A1A3E] placeholder:text-[#9999AA] bg-transparent"
        />
      </div>
      {examples && examples.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {examples.filter(e => !value.includes(e)).map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange([...value, ex])}
              className="text-[11px] text-[#6B6B80] border border-dashed border-[#E4E4E8] rounded px-1.5 py-0.5 hover:border-[#C8C8D0] transition-colors"
            >
              + {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
