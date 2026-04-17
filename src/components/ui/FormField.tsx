import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, help, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-[12px] text-[#6B6B80]">
        {label}
        {required ? <span className="text-[#DC2626]"> *</span> : null}
      </label>
      {children}
      {help ? <p className="text-[12px] text-[#9999AA]">{help}</p> : null}
      {error ? <p className="text-[12px] text-[#DC2626]">{error}</p> : null}
    </div>
  );
}
