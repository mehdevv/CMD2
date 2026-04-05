import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function relativeTime(input: string): string {
  return input;
}

export function channelLabel(channel: string): string {
  const map: Record<string, string> = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    facebook: 'Facebook',
  };
  return map[channel] ?? channel;
}

export function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    proposal: 'Proposal',
    closed: 'Closed',
  };
  return map[stage] ?? stage;
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    admin: 'Admin',
    owner: 'Business Owner',
    agent: 'Sales Agent',
  };
  return map[role] ?? role;
}

export function formatCurrency(value: number): string {
  return `${value.toLocaleString()} DZD`;
}
