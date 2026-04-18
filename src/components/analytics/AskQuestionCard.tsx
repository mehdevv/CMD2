import { useState } from 'react';
import { useLocation } from 'wouter';
import type { AnalyticsFilters } from '@/lib/types';
import { useCrmData } from '@/contexts/CrmDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { planReport } from '@/lib/report-planner';

interface AskQuestionCardProps {
  filters: AnalyticsFilters;
}

export function AskQuestionCard({ filters }: AskQuestionCardProps) {
  const [, setLoc] = useLocation();
  const { leads, opportunities, teamMembers, addReport } = useCrmData();
  const { user } = useAuth();
  const [q, setQ] = useState('');

  const generate = () => {
    if (q.trim().length < 6) return;
    void (async () => {
      const report = planReport(
        q.trim(),
        { leads, opportunities, users: teamMembers, now: new Date() },
        filters,
        user?.name ?? 'User'
      );
      const id = await addReport(report);
      setLoc(`/analytics/reports/${id}`);
    })();
  };

  return (
    <div className="scale-card p-6">
      <h3 className="text-[15px] font-semibold text-[#1A1A3E] mb-2">Ask a question</h3>
      <p className="text-[13px] text-[#6B6B80] mb-3">
        Describe what you want to understand about your pipeline and customers.
      </p>
      <textarea
        className="scale-input w-full min-h-[88px] py-2 mb-3"
        placeholder="e.g. Why did we lose more deals last month?"
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <button type="button" className="scale-btn-primary" onClick={generate}>
        Generate report
      </button>
    </div>
  );
}
