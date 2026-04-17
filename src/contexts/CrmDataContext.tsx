import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AnalyticsReport, Lead, Opportunity } from '@/lib/types';
import { MOCK_LEADS } from '@/lib/mock-data';
import { MOCK_OPPORTUNITIES_SEED } from '@/lib/mock-opportunities-seed';
import { MOCK_REPORTS_SEED } from '@/lib/mock-reports-seed';
import { derivePaymentStatus } from '@/lib/pipeline';

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

interface CrmDataContextValue {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  patchLead: (id: string, patch: Partial<Lead>) => void;
  addLead: (lead: Lead) => void;
  opportunities: Opportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
  patchOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  addOpportunity: (o: Opportunity) => void;
  reports: AnalyticsReport[];
  setReports: React.Dispatch<React.SetStateAction<AnalyticsReport[]>>;
  addReport: (r: AnalyticsReport) => void;
  patchReport: (id: string, patch: Partial<AnalyticsReport>) => void;
}

const CrmDataContext = createContext<CrmDataContextValue | null>(null);

export function CrmDataProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() => clone(MOCK_LEADS));
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => clone(MOCK_OPPORTUNITIES_SEED));
  const [reports, setReports] = useState<AnalyticsReport[]>(() => clone(MOCK_REPORTS_SEED));

  const patchLead = useCallback((id: string, patch: Partial<Lead>) => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const addLead = useCallback((lead: Lead) => {
    setLeads(prev => [lead, ...prev]);
  }, []);

  const patchOpportunity = useCallback((id: string, patch: Partial<Opportunity>) => {
    setOpportunities(prev =>
      prev.map(o => {
        if (o.id !== id) return o;
        const next = { ...o, ...patch };
        if (patch.payments) next.paymentStatus = derivePaymentStatus(next.payments);
        return next;
      })
    );
  }, []);

  const addOpportunity = useCallback((o: Opportunity) => {
    setOpportunities(prev => [...prev, o]);
  }, []);

  const addReport = useCallback((r: AnalyticsReport) => {
    setReports(prev => [r, ...prev]);
  }, []);

  const patchReport = useCallback((id: string, patch: Partial<AnalyticsReport>) => {
    setReports(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const value = useMemo(
    () => ({
      leads,
      setLeads,
      patchLead,
      addLead,
      opportunities,
      setOpportunities,
      patchOpportunity,
      addOpportunity,
      reports,
      setReports,
      addReport,
      patchReport,
    }),
    [leads, patchLead, addLead, opportunities, patchOpportunity, addOpportunity, reports, addReport, patchReport]
  );

  return <CrmDataContext.Provider value={value}>{children}</CrmDataContext.Provider>;
}

export function useCrmData(): CrmDataContextValue {
  const ctx = useContext(CrmDataContext);
  if (!ctx) throw new Error('useCrmData must be used within CrmDataProvider');
  return ctx;
}
