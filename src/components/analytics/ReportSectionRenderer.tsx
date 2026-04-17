import type { ReportSection } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#2B62E8', '#6D5CC3', '#0E8F83', '#C77A00', '#DC2626'];

export function ReportSectionRenderer({ section }: { section: ReportSection }) {
  const p = section.payload as Record<string, unknown>;

  switch (section.kind) {
    case 'kpi-row': {
      const items = (p.items as { label: string; value: string }[]) ?? [];
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map(it => (
            <StatCard key={it.label} label={it.label} value={it.value} />
          ))}
        </div>
      );
    }
    case 'bar-chart': {
      const data = (p.data as { name: string; value: number }[]) ?? [];
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E4E4E8', borderRadius: 6 }} />
            <Bar dataKey="value" fill="#2B62E8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    case 'line-chart': {
      const data = (p.data as { date: string; value: number }[]) ?? [];
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E4E4E8', borderRadius: 6 }} />
            <Line type="monotone" dataKey="value" stroke="#2B62E8" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    case 'pie-chart': {
      const data = (p.data as { name: string; value: number }[]) ?? [];
      return (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E4E4E8', borderRadius: 6 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    case 'funnel-chart': {
      const steps = (p.steps as { label: string; count: number }[]) ?? [];
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={steps.map(s => ({ name: s.label, count: s.count }))}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E4E4E8', borderRadius: 6 }} />
            <Bar dataKey="count" fill="#6D5CC3" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    case 'table': {
      const columns = (p.columns as string[]) ?? [];
      const rows = (p.rows as string[][]) ?? [];
      return (
        <div className="overflow-x-auto border border-[#E4E4E8] rounded-md">
          <table className="w-full text-[13px]">
            <thead className="bg-[#F7F7F8]">
              <tr>
                {columns.map(c => (
                  <th key={c} className="text-left p-2 font-medium text-[#6B6B80]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-[#E4E4E8]">
                  {row.map((cell, j) => (
                    <td key={j} className="p-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'text':
      return <p className="text-[14px] text-[#1A1A3E] leading-relaxed">{(p.body as string) ?? ''}</p>;
    case 'bullet-list': {
      const items = (p.items as string[]) ?? [];
      return (
        <ul className="list-disc list-inside text-[14px] text-[#1A1A3E] space-y-1">
          {items.map(it => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    }
    default:
      return null;
  }
}
