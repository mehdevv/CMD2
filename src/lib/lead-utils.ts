import type { Lead } from './types';

export function assignedNameToOwnerId(assignedTo: string): string {
  const map: Record<string, string> = {
    'Mehdi Kaci': 'agent-1',
    'Sara Boukhalfa': 'agent-2',
    'Nassim Rahmani': 'agent-3',
  };
  return map[assignedTo] ?? 'agent-1';
}

/** Deterministic mock enrichment from email domain (no network). */
export function mockAssistantEnrichment(lead: Lead): Partial<Lead> {
  const email = lead.email?.trim();
  if (!email || !email.includes('@')) {
    return {
      industry: 'Services',
      companySize: '2-10',
      painPoints: ['Response time', 'Team coordination'],
      enrichedAt: new Date().toISOString(),
    };
  }
  const domain = email.split('@')[1]?.split('.')[0] ?? 'prospect';
  const title = domain.charAt(0).toUpperCase() + domain.slice(1);
  return {
    company: lead.company ?? `${title} Group`,
    industry: 'Retail & e-commerce',
    companySize: lead.companySize ?? '11-50',
    painPoints: lead.painPoints?.length
      ? lead.painPoints
      : ['Slow customer replies', 'Limited reporting on conversations'],
    enrichedAt: new Date().toISOString(),
  };
}

export function isEnrichmentIncomplete(lead: Lead): boolean {
  if (!lead.enrichedAt) return true;
  if (!lead.email?.trim() && !lead.company?.trim()) return true;
  return false;
}
