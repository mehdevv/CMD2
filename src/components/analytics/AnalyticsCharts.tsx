import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TOOLTIP = { fontSize: 12, border: '1px solid #E4E4E8', borderRadius: 6 };

export interface FunnelChartProps {
  data: { label: string; count: number }[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data.map(f => ({ name: f.label, count: f.count }))} barSize={20}>
        <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP} />
        <Bar dataKey="count" fill="#2B62E8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export interface PipelineByStageChartProps {
  data: { stage: string; value: number }[];
}

export function PipelineByStageChart({ data }: PipelineByStageChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data.map(p => ({ name: p.stage, value: p.value }))} layout="vertical" barSize={14}>
        <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP} />
        <Bar dataKey="value" fill="#6D5CC3" radius={0} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export interface LeadsOverTimeChartProps {
  data: { date: string; value: number }[];
}

export function LeadsOverTimeChart({ data }: LeadsOverTimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP} />
        <Line type="monotone" dataKey="value" stroke="#2B62E8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export interface RevenueOverTimeChartProps {
  data: { date: string; value: number }[];
}

export function RevenueOverTimeChart({ data }: RevenueOverTimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP} />
        <Line type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export interface ChannelBreakdownChartProps {
  data: { label: string; count: number }[];
}

export function ChannelBreakdownChart({ data }: ChannelBreakdownChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data.map(r => ({ name: r.label, count: r.count }))}>
        <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP} />
        <Bar dataKey="count" fill="#0E8F83" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
