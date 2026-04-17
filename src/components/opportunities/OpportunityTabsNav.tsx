import { Link } from 'wouter';

export interface OpportunityTabsNavProps {
  opportunityId: string;
}

export function OpportunityTabsNav({ opportunityId }: OpportunityTabsNavProps) {
  const base = `/opportunities/${opportunityId}`;
  const tabs = [
    { href: `${base}/qualification`, label: 'Qualification' },
    { href: `${base}/need-analysis`, label: 'Need analysis' },
    { href: `${base}/proposal`, label: 'Proposal' },
    { href: `${base}/negotiation`, label: 'Negotiation' },
    { href: `${base}/closing`, label: 'Closing' },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(t => (
        <Link key={t.href} href={t.href}>
          <a className="scale-btn-secondary text-[13px]">{t.label}</a>
        </Link>
      ))}
    </div>
  );
}
