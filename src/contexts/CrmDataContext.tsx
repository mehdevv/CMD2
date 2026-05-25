import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AnalyticsReport, Channel, Conversation, Lead, Message, Opportunity, User } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { listLeads, insertLead, updateLead } from '@/lib/db/leads';
import { listOpportunities, insertOpportunity, syncOpportunity } from '@/lib/db/opportunities';
import { listReports, insertReport, updateReport } from '@/lib/db/reports';
import { listConversations, insertMessage, setConversationTakeover } from '@/lib/db/conversations';
import { fetchOrgProfiles } from '@/lib/db/profiles';
import { derivePaymentStatus } from '@/lib/pipeline';
import { isDemoUser } from '@/lib/demo-auth';
import {
  demoAddLead,
  demoAddOpportunity,
  demoAddReport,
  demoListConversations,
  demoListLeads,
  demoListOpportunities,
  demoListReports,
  demoListTeam,
  demoSendMessage,
  demoSetConversationTakeover,
  demoSyncOpportunity,
  demoUpdateLead,
  demoUpdateReport,
} from '@/lib/demo-crm-store';

export type AddLeadPayload = {
  name: string;
  phone: string;
  channel: Channel;
  source?: string;
};

interface CrmDataContextValue {
  leads: Lead[];
  opportunities: Opportunity[];
  reports: AnalyticsReport[];
  conversations: Conversation[];
  teamMembers: User[];
  crmLoading: boolean;
  crmError: Error | null;
  refetchCrm: () => Promise<void>;
  patchLead: (id: string, patch: Partial<Lead>) => Promise<void>;
  addLead: (input: AddLeadPayload) => Promise<string>;
  patchOpportunity: (id: string, patch: Partial<Opportunity>) => Promise<void>;
  addOpportunity: (o: Opportunity) => Promise<string>;
  addReport: (r: AnalyticsReport) => Promise<string>;
  patchReport: (id: string, patch: Partial<AnalyticsReport>) => Promise<void>;
  sendMessage: (conversationId: string, msg: Omit<Message, 'id'>) => Promise<void>;
  setConversationTakeover: (
    conversationId: string,
    opts: { automationPaused: boolean; assignedToUserId: string | null }
  ) => Promise<void>;
}

const CrmDataContext = createContext<CrmDataContextValue | null>(null);

const qk = {
  leads: ['crm', 'leads'] as const,
  opportunities: ['crm', 'opportunities'] as const,
  reports: ['crm', 'reports'] as const,
  conversations: ['crm', 'conversations'] as const,
  team: ['crm', 'team'] as const,
};

function invalidateLeadActivity(qc: ReturnType<typeof useQueryClient>, leadId?: string) {
  void qc.invalidateQueries({ queryKey: ['automation', 'lead'] });
  if (leadId) {
    void qc.invalidateQueries({ queryKey: ['automation', 'lead', leadId] });
  }
}

export function CrmDataProvider({ children }: { children: ReactNode }) {
  const { user, authDisabled } = useAuth();
  const qc = useQueryClient();
  const demoMode = isDemoUser(user);
  const supabaseEnabled = Boolean(user?.orgId) && !authDisabled && isSupabaseConfigured && !demoMode;
  const demoEnabled = demoMode && Boolean(user?.orgId);

  const leadsQuery = useQuery({
    queryKey: [...qk.leads, demoMode ? 'demo' : 'live'],
    queryFn: demoMode ? demoListLeads : listLeads,
    enabled: supabaseEnabled || demoEnabled,
  });

  const oppsQuery = useQuery({
    queryKey: [...qk.opportunities, demoMode ? 'demo' : 'live'],
    queryFn: demoMode ? demoListOpportunities : listOpportunities,
    enabled: supabaseEnabled || demoEnabled,
  });

  const reportsQuery = useQuery({
    queryKey: [...qk.reports, demoMode ? 'demo' : 'live'],
    queryFn: demoMode ? demoListReports : listReports,
    enabled: supabaseEnabled || demoEnabled,
  });

  const convQuery = useQuery({
    queryKey: [...qk.conversations, demoMode ? 'demo' : 'live'],
    queryFn: demoMode ? demoListConversations : listConversations,
    enabled: supabaseEnabled || demoEnabled,
  });

  const teamQuery = useQuery({
    queryKey: [...qk.team, demoMode ? 'demo' : 'live'],
    queryFn: demoMode ? demoListTeam : fetchOrgProfiles,
    enabled: supabaseEnabled || demoEnabled,
  });

  const crmLoading =
    (supabaseEnabled || demoEnabled) &&
    (leadsQuery.isLoading || oppsQuery.isLoading || reportsQuery.isLoading || convQuery.isLoading || teamQuery.isLoading);

  const crmError =
    (leadsQuery.error as Error | null) ||
    (oppsQuery.error as Error | null) ||
    (reportsQuery.error as Error | null) ||
    (convQuery.error as Error | null) ||
    (teamQuery.error as Error | null) ||
    null;

  const refetchCrm = useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: qk.leads }),
      qc.invalidateQueries({ queryKey: qk.opportunities }),
      qc.invalidateQueries({ queryKey: qk.reports }),
      qc.invalidateQueries({ queryKey: qk.conversations }),
      qc.invalidateQueries({ queryKey: qk.team }),
    ]);
  }, [qc]);

  const patchLead = useCallback(
    async (id: string, patch: Partial<Lead>) => {
      if (demoMode) {
        demoUpdateLead(id, patch);
        await qc.invalidateQueries({ queryKey: qk.leads });
        await qc.invalidateQueries({ queryKey: qk.conversations });
        invalidateLeadActivity(qc, id);
        return;
      }
      if (!supabaseEnabled) return;
      await updateLead(id, patch);
      await qc.invalidateQueries({ queryKey: qk.leads });
      await qc.invalidateQueries({ queryKey: qk.conversations });
      invalidateLeadActivity(qc, id);
    },
    [demoMode, supabaseEnabled, qc]
  );

  const addLead = useCallback(
    async (input: AddLeadPayload): Promise<string> => {
      if (!user?.orgId) throw new Error('No organization');
      if (demoMode) {
        const id = demoAddLead(input, user.id);
        await qc.invalidateQueries({ queryKey: qk.leads });
        await qc.invalidateQueries({ queryKey: qk.conversations });
        invalidateLeadActivity(qc, id);
        return id;
      }
      const id = await insertLead(user.orgId, {
        name: input.name,
        phone: input.phone,
        channel: input.channel,
        source: input.source,
        assignedToUserId: user.id,
      });
      await qc.invalidateQueries({ queryKey: qk.leads });
      await qc.invalidateQueries({ queryKey: qk.conversations });
      invalidateLeadActivity(qc, id);
      return id;
    },
    [user, demoMode, qc]
  );

  const patchOpportunity = useCallback(
    async (id: string, patch: Partial<Opportunity>) => {
      const opps = qc.getQueryData<Opportunity[]>([...qk.opportunities, demoMode ? 'demo' : 'live']) ?? [];
      const current = opps.find(o => o.id === id);
      if (!current) return;
      const next: Opportunity = { ...current, ...patch };
      if (patch.payments !== undefined) {
        next.paymentStatus = derivePaymentStatus(next.payments ?? []);
      }
      next.updatedAt = new Date().toISOString();
      if (demoMode) {
        demoSyncOpportunity(next);
        await qc.invalidateQueries({ queryKey: qk.opportunities });
        await qc.invalidateQueries({ queryKey: qk.leads });
        invalidateLeadActivity(qc, next.leadId);
        return;
      }
      if (!supabaseEnabled) return;
      await syncOpportunity(next);
      await qc.invalidateQueries({ queryKey: qk.opportunities });
      invalidateLeadActivity(qc, next.leadId);
    },
    [demoMode, supabaseEnabled, qc]
  );

  const addOpportunity = useCallback(
    async (o: Opportunity) => {
      if (!user?.orgId) throw new Error('No organization');
      if (demoMode) {
        const id = demoAddOpportunity(o);
        await qc.invalidateQueries({ queryKey: qk.opportunities });
        invalidateLeadActivity(qc, o.leadId);
        return id;
      }
      const id = await insertOpportunity(user.orgId, o);
      await qc.invalidateQueries({ queryKey: qk.opportunities });
      return id;
    },
    [user, demoMode, qc]
  );

  const addReport = useCallback(
    async (r: AnalyticsReport) => {
      if (!user?.orgId) throw new Error('No organization');
      if (demoMode) {
        const id = demoAddReport(r);
        await qc.invalidateQueries({ queryKey: qk.reports });
        return id;
      }
      const id = await insertReport(user.orgId, r, user.id);
      await qc.invalidateQueries({ queryKey: qk.reports });
      return id;
    },
    [user, demoMode, qc]
  );

  const patchReport = useCallback(
    async (id: string, patch: Partial<AnalyticsReport>) => {
      if (demoMode) {
        demoUpdateReport(id, patch);
        await qc.invalidateQueries({ queryKey: qk.reports });
        return;
      }
      if (!supabaseEnabled) return;
      await updateReport(id, patch);
      await qc.invalidateQueries({ queryKey: qk.reports });
    },
    [demoMode, supabaseEnabled, qc]
  );

  const sendMessage = useCallback(
    async (conversationId: string, msg: Omit<Message, 'id'>) => {
      if (!user?.orgId) throw new Error('No organization');
      if (demoMode) {
        demoSendMessage(conversationId, msg);
        await qc.invalidateQueries({ queryKey: qk.conversations });
        return;
      }
      await insertMessage(conversationId, user.orgId, msg);
      await qc.invalidateQueries({ queryKey: qk.conversations });
    },
    [user, demoMode, qc]
  );

  const setConversationTakeoverCb = useCallback(
    async (conversationId: string, opts: { automationPaused: boolean; assignedToUserId: string | null }) => {
      const convs = qc.getQueryData<Conversation[]>([...qk.conversations, demoMode ? 'demo' : 'live']) ?? [];
      const leadId = convs.find(c => c.id === conversationId)?.leadId;
      if (demoMode) {
        demoSetConversationTakeover(conversationId, opts);
        await qc.invalidateQueries({ queryKey: qk.conversations });
        await qc.invalidateQueries({ queryKey: qk.leads });
        invalidateLeadActivity(qc, leadId);
        return;
      }
      await setConversationTakeover(conversationId, opts);
      await qc.invalidateQueries({ queryKey: qk.conversations });
      invalidateLeadActivity(qc, leadId);
    },
    [demoMode, qc]
  );

  const value = useMemo(
    () => ({
      leads: leadsQuery.data ?? [],
      opportunities: oppsQuery.data ?? [],
      reports: reportsQuery.data ?? [],
      conversations: convQuery.data ?? [],
      teamMembers: teamQuery.data ?? [],
      crmLoading,
      crmError,
      refetchCrm,
      patchLead,
      addLead,
      patchOpportunity,
      addOpportunity,
      addReport,
      patchReport,
      sendMessage,
      setConversationTakeover: setConversationTakeoverCb,
    }),
    [
      leadsQuery.data,
      oppsQuery.data,
      reportsQuery.data,
      convQuery.data,
      teamQuery.data,
      crmLoading,
      crmError,
      refetchCrm,
      patchLead,
      addLead,
      patchOpportunity,
      addOpportunity,
      addReport,
      patchReport,
      sendMessage,
      setConversationTakeoverCb,
    ]
  );

  return <CrmDataContext.Provider value={value}>{children}</CrmDataContext.Provider>;
}

export function useCrmData(): CrmDataContextValue {
  const ctx = useContext(CrmDataContext);
  if (!ctx) throw new Error('useCrmData must be used within CrmDataProvider');
  return ctx;
}
