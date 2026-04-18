import type { Channel } from '@/lib/types';

export function channelToDb(c: Channel): string {
  return c;
}

export function channelFromDb(c: string): Channel {
  if (c === 'whatsapp' || c === 'instagram' || c === 'facebook') return c;
  return 'whatsapp';
}

export function formatLastContact(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 86_400_000) return `${Math.floor(diff / 60_000)}m ago`;
  return d.toLocaleDateString();
}
