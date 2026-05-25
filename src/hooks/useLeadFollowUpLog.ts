import { useQuery } from '@tanstack/react-query';
import { listLeadAutomationActivity } from '@/lib/db/automation';

export function useLeadFollowUpLog(leadId: string | undefined) {
  return useQuery({
    queryKey: ['automation', 'lead', leadId],
    queryFn: () => listLeadAutomationActivity(leadId!),
    enabled: Boolean(leadId),
  });
}
