import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export interface StageEditorShellProps {
  opportunityId: string;
  children: ReactNode;
}

export function StageEditorShell({ opportunityId, children }: StageEditorShellProps) {
  return (
    <div>
      <Link href={`/opportunities/${opportunityId}`}>
        <a className="mb-4 inline-flex items-center gap-1 text-[13px] text-[#2B62E8]">
          <ChevronLeft size={14} /> Back to opportunity
        </a>
      </Link>
      {children}
    </div>
  );
}
