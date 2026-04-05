import type { AutomationAgentKey } from '@/lib/automation-fundamentals';
import { ORG_AUTOMATION_FUNDAMENTALS } from '@/lib/automation-fundamentals';
import { InfoBlock } from '@/components/ui/InfoBlock';

interface OwnerFundamentalsCardProps {
  agent: AutomationAgentKey;
}

export function OwnerFundamentalsCard({ agent }: OwnerFundamentalsCardProps) {
  const f = ORG_AUTOMATION_FUNDAMENTALS[agent];

  return (
    <div className="mb-6 space-y-3">
      <InfoBlock>
        Your admin configures the model, API access, and safety limits for the whole organization. You customize prompts, knowledge, sequences, and customer-facing messages below.
      </InfoBlock>
      <div className="scale-card space-y-3">
        <h3 className="text-[14px] font-semibold text-[#1A1A3E]">Platform defaults (read-only)</h3>
        <dl className="grid gap-2 text-[13px]">
          <div className="flex justify-between gap-4 border-b border-[#E4E4E8] pb-2">
            <dt className="text-[#6B6B80]">Provider</dt>
            <dd className="text-[#1A1A3E] font-medium">{f.provider}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#E4E4E8] pb-2">
            <dt className="text-[#6B6B80]">Model</dt>
            <dd className="text-[#1A1A3E] font-medium">{f.model}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#E4E4E8] pb-2">
            <dt className="text-[#6B6B80]">Max message length (tokens)</dt>
            <dd className="text-[#1A1A3E] font-medium">{f.maxTokens}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#E4E4E8] pb-2">
            <dt className="text-[#6B6B80]">Creativity limit</dt>
            <dd className="text-[#1A1A3E] font-medium">{f.creativityCap}</dd>
          </div>
        </dl>
        {f.extraNotes && <p className="text-[12px] text-[#9999AA]">{f.extraNotes}</p>}
        <p className="text-[12px] text-[#6B6B80]">Need a different model or higher limits? Contact your organization admin.</p>
      </div>
    </div>
  );
}
