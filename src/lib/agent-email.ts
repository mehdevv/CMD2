/**
 * `.scale` is a **naming convention**, not a real domain. Nothing is ever
 * delivered to these addresses — Supabase stores them as plain strings because
 * the Edge Function creates the auth user with `email_confirm: true`.
 *
 * Rule: any email whose host ends with `.scale` is a business-provisioned
 * sales agent created by their admin/owner. Admins and owners use their real
 * work email.
 */
export const AGENT_EMAIL_SUFFIX = '.scale';

/** True when the email host ends with `.scale` (case-insensitive). */
export function isAgentEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const at = email.lastIndexOf('@');
  if (at < 0) return false;
  return email.slice(at + 1).toLowerCase().endsWith(AGENT_EMAIL_SUFFIX);
}

/** Pull the `slug` out of `handle@slug.scale`, or null for non-agent emails. */
export function orgSlugFromAgentEmail(email: string | null | undefined): string | null {
  if (!isAgentEmail(email)) return null;
  const host = email!.slice(email!.lastIndexOf('@') + 1).toLowerCase();
  return host.replace(/\.scale$/, '') || null;
}

/** Compose the agent sign-in address. Returns null if either piece is missing. */
export function composeAgentEmail(localHandle: string | null | undefined, orgSlug: string | null | undefined): string | null {
  const h = localHandle?.trim().toLowerCase();
  const s = orgSlug?.trim().toLowerCase();
  if (!h || !s) return null;
  return `${h}@${s}${AGENT_EMAIL_SUFFIX}`;
}
