import type { Lead } from './types';

/** Owner profile id for a new opportunity: explicit assignee on the lead, else current user. */
export function leadAssigneeOwnerId(lead: Lead, fallbackUserId: string): string {
  return lead.assignedToUserId ?? fallbackUserId;
}

/** Whether this lead is assigned to the given profile id (RLS-safe). */
export function leadOwnedByUser(lead: Lead, userId: string): boolean {
  return lead.assignedToUserId === userId;
}

/** Deterministic demo enrichment from email domain (no network). */
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
