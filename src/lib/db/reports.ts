import { getSupabase } from '@/lib/supabase';
import type { AnalyticsReport } from '@/lib/types';

export async function listReports(): Promise<AnalyticsReport[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('analytics_reports').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    question: r.question as string,
    createdAt: r.created_at as string,
    createdBy: typeof r.created_by === 'string' ? String(r.created_by).slice(0, 8) + '…' : '—',
    filters: (r.filters as AnalyticsReport['filters']) ?? {},
    summary: (r.summary as string) ?? '',
    sections: (r.sections as AnalyticsReport['sections']) ?? [],
    recommendations: (r.recommendations as string[]) ?? [],
    status: r.status as AnalyticsReport['status'],
    source: r.source as AnalyticsReport['source'],
    shareUrl: r.share_slug ? `/analytics/reports/${r.id}` : undefined,
  }));
}

export async function insertReport(
  orgId: string,
  report: AnalyticsReport,
  createdByProfileId: string | null
): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('analytics_reports')
    .insert({
      org_id: orgId,
      created_by: createdByProfileId,
      question: report.question,
      summary: report.summary,
      filters: report.filters as object,
      sections: report.sections as unknown as object[],
      recommendations: report.recommendations,
      status: report.status,
      source: report.source,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateReport(id: string, patch: Partial<AnalyticsReport>): Promise<void> {
  const supabase = getSupabase();
  const row: Record<string, unknown> = {};
  if (patch.summary !== undefined) row.summary = patch.summary;
  if (patch.sections !== undefined) row.sections = patch.sections as unknown[];
  if (patch.recommendations !== undefined) row.recommendations = patch.recommendations;
  if (patch.status !== undefined) row.status = patch.status;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('analytics_reports').update(row).eq('id', id);
  if (error) throw error;
}
