import { useMemo } from 'react';
import { Link, useParams } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { useCrmData } from '@/contexts/CrmDataContext';
import { ReportSectionRenderer } from '@/components/analytics/ReportSectionRenderer';
import { ReportActions } from '@/components/analytics/ReportActions';

export default function AnalyticsReportDetailPage() {
  const { id } = useParams();
  const { reports } = useCrmData();
  const report = useMemo(() => reports.find(r => r.id === id), [reports, id]);

  if (!report) {
    return (
      <AppShell title="Report">
        <p className="text-[#6B6B80]">Report not found.</p>
        <Link href="/analytics/reports">
          <a className="mt-2 inline-block text-[14px] text-[#2B62E8]">Back to reports</a>
        </Link>
      </AppShell>
    );
  }

  const exportPdf = () => window.print();

  const share = () => {
    void navigator.clipboard.writeText(window.location.href);
  };

  return (
    <AppShell title="Report">
      <div className="mx-auto max-w-3xl">
        <Link href="/analytics/reports">
          <a className="no-print mb-4 inline-block text-[13px] text-[#2B62E8]">← Reports</a>
        </Link>
        <PageHeader title={report.question} />
        <p className="mb-4 text-[12px] text-[#9999AA]">
          {new Date(report.createdAt).toLocaleString()} · {report.createdBy}
        </p>
        <ReportActions onExportPdf={exportPdf} onCopyLink={share} />

        <PageSection title="Summary" className="mb-6">
          <p className="text-[15px] leading-relaxed text-[#1A1A3E]">{report.summary}</p>
        </PageSection>

        <PageSection title="Recommendations" className="mb-6">
          <ul className="list-inside list-disc space-y-1 text-[14px] text-[#1A1A3E]">
            {report.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </PageSection>

        <div className="space-y-6">
          {report.sections.map(s => (
            <PageSection key={s.id} title={s.title}>
              {s.description && <p className="mb-3 text-[13px] text-[#6B6B80]">{s.description}</p>}
              <ReportSectionRenderer section={s} />
            </PageSection>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
