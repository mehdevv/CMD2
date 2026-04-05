import { useState } from 'react';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showTestButton?: boolean;
}

export function PasswordInput({ value, onChange, placeholder = '••••••••', showTestButton }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTest = () => {
    if (!value) return;
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult('success');
    }, 1500);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="scale-input pr-9"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9999AA] hover:text-[#6B6B80]"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {showTestButton && (
        <button
          type="button"
          onClick={handleTest}
          disabled={!value || testing}
          className="scale-btn-secondary text-[13px] py-1.5 px-3 flex-shrink-0 flex items-center gap-1.5"
        >
          {testing ? (
            <span className="text-[#9999AA]">Testing...</span>
          ) : testResult === 'success' ? (
            <><Check size={12} className="text-[#16A34A]" /><span className="text-[#16A34A]">Connected</span></>
          ) : testResult === 'error' ? (
            <><AlertCircle size={12} className="text-[#DC2626]" /><span className="text-[#DC2626]">Failed</span></>
          ) : (
            'Test connection'
          )}
        </button>
      )}
    </div>
  );
}
