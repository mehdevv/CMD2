import { Link } from 'wouter';
import { cn } from '@/lib/utils';

export type IntelligenceTone = 'danger' | 'success' | 'warning';

export interface IntelligenceHighlightLink {
  href: string;
  label: string;
}

export interface IntelligenceHighlightCardProps {
  tone: IntelligenceTone;
  label: string;
  headline: string;
  detail: string;
  links?: IntelligenceHighlightLink[];
}

const TONE_BORDER: Record<IntelligenceTone, string> = {
  danger: 'border-l-[#DC2626]',
  success: 'border-l-[#16A34A]',
  warning: 'border-l-[#D97706]',
};

export function IntelligenceHighlightCard({
  tone,
  label,
  headline,
  detail,
  links,
}: IntelligenceHighlightCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-[#E4E4E8] bg-white p-5 border-l-4',
        TONE_BORDER[tone]
      )}
    >
      <span className="text-[11px] font-medium tracking-wide text-[#9999AA]">{label.toUpperCase()}</span>
      <p className="line-clamp-1 text-[15px] font-medium leading-snug text-[#1A1A3E]" title={headline}>
        {headline}
      </p>
      <p className="line-clamp-3 text-[13px] text-[#6B6B80]" title={detail}>
        {detail}
      </p>
      {links && links.length > 0 ? (
        <div className="mt-auto flex flex-wrap gap-3 pt-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}>
              <a className="text-[13px] text-[#2B62E8] hover:underline">{l.label}</a>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
