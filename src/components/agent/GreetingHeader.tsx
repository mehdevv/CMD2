export interface GreetingHeaderProps {
  firstName: string;
  subtitle: string;
  className?: string;
}

export function GreetingHeader({ firstName, subtitle, className }: GreetingHeaderProps) {
  return (
    <div className={className}>
      <h2 className="text-[18px] font-semibold text-[#1A1A3E]">Good morning, {firstName}</h2>
      <p className="mt-0.5 text-[13px] text-[#6B6B80]">{subtitle}</p>
    </div>
  );
}
