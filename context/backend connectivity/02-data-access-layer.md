# 02 — Data access layer

Every page today reads from mock arrays or a local `CrmDataContext`. After this step, every page reads and writes via thin typed helpers in `src/lib/db/*.ts`, wrapped in TanStack Query hooks. RLS in Supabase guarantees org isolation, so the helpers don't have to pass `org_id` — the server knows the caller's org through `public.current_org_id()`.

---

## 2.1 Install

```bash
npm i @supabase/supabase-js @tanstack/react-query
```

Wrap the app in a `QueryClientProvider` (in `src/App.tsx`, outside the router):

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CrmDataProvider>{/* still here, now powered by the new hooks */}
        <Router>{/* … */}</Router>
      </CrmDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

---

## 2.2 File layout

```
src/lib/
  supabase.ts                  ← client singleton (see 01-auth.md §1.3)
  db/
    leads.ts
    opportunities.ts
    proposals.ts
    payments.ts
    conversations.ts
    messages.ts
    meetings.ts
    templates.ts
    rules.ts
    refund-policy.ts
    billing.ts
    invoices.ts
    channels.ts
    agent-config.ts
    followup-steps.ts
    faq-entries.ts
    status-messages.ts
    carrier-integration.ts
    policy-rules.ts
    refund-decisions.ts
    triggers.ts
    intervention.ts
    activity-log.ts
    intelligence.ts
    reports.ts
    notifications.ts
    users.ts                   ← profiles
    storage.ts                 ← signed URL + upload helpers
  hooks/
    useLeads.ts, useOpportunities.ts, useMessages.ts, …
```

---

## 2.3 Helper pattern

Each `src/lib/db/<entity>.ts` exports `list / get / create / update / remove` that return typed promises. Every call already runs against the signed-in user's org thanks to RLS.

```ts
// src/lib/db/leads.ts
import { supabase } from '@/lib/supabase';
import type { Lead } from '@/lib/types';

type LeadRow = Lead & { lead_tags?: { tag: string }[]; lead_pain_points?: { point: string }[] };

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*, lead_tags(tag), lead_pain_points(point)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as LeadRow[]).map(fromRow);
}

export async function getLead(id: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*, lead_tags(tag), lead_pain_points(point)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return fromRow(data as LeadRow);
}

export async function createLead(input: Omit<Lead, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('leads')
    .insert(toRow(input))
    .select()
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function updateLead(id: string, patch: Partial<Lead>) {
  const { error } = await supabase.from('leads').update(toRow(patch)).eq('id', id);
  if (error) throw error;
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
}

// small row <-> domain mappers keep column_case ↔ camelCase conversions in one place.
function fromRow(r: LeadRow): Lead { /* … */ }
function toRow(l: Partial<Lead>): Record<string, unknown> { /* … */ }
```

---

## 2.4 React Query hooks

Keep hook signatures simple so pages barely change:

```ts
// src/hooks/useLeads.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as db from '@/lib/db/leads';

export const leadKeys = {
  all: ['leads'] as const,
  detail: (id: string) => ['leads', id] as const,
};

export function useLeads() {
  return useQuery({ queryKey: leadKeys.all, queryFn: db.listLeads });
}
export function useLead(id: string) {
  return useQuery({ queryKey: leadKeys.detail(id), queryFn: () => db.getLead(id), enabled: !!id });
}
export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: db.createLead,
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.all }),
  });
}
export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Lead> }) => db.updateLead(id, patch),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: leadKeys.detail(id) });
    },
  });
}
```

Same shape for every entity. Complete list of query-key roots:

```
users              opportunities/:id/qualification
leads              opportunities/:id/need-analysis
leads/:id          opportunities/:id/proposals
conversations      opportunities/:id/payments
conversations/:id  opportunities/:id/transitions
messages/:convId   opportunities/:id/objections
meetings/briefs    templates
meetings/notes     rules
agent-configs      refund-policy
agent-configs/:id  billing
followup-steps/:cfg  invoices
faq-entries/:cfg     channels
status-messages/:cfg triggers
policy-rules/:cfg    intervention
refund-decisions    activity-log
reports              intelligence
notifications        opportunities
```

---

## 2.5 Replacing `CrmDataContext`

`CrmDataProvider` today holds in-memory arrays. Keep the component, replace its body:

```ts
// Old
const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
const addLead = (l) => setLeads([l, ...leads]);

// New
const leadsQ = useLeads();
const addLead = useCreateLead().mutateAsync;
const leads = leadsQ.data ?? [];
```

Keep the context as a **thin facade** so pages keep calling `useCrm().leads`, `useCrm().addLead(…)` unchanged. This makes the migration a single-file change, not a page-by-page rewrite.

Child consumers that need loading / error states should grab them from the underlying hook directly instead of the context.

---

## 2.6 Error handling and toasts

One global pattern — uses `sonner` (already installed):

```ts
// src/lib/mutations.ts
import { toast } from 'sonner';
export function onSaved(msg = 'Saved') { toast.success(msg); }
export function onFailed(e: unknown)   { toast.error(e instanceof Error ? e.message : 'Something went wrong'); }
```

Every mutation hook uses them:

```ts
useMutation({
  mutationFn: db.updateLead,
  onSuccess: () => { qc.invalidateQueries({ queryKey: leadKeys.all }); onSaved(); },
  onError: onFailed,
});
```

---

## 2.7 Storage helpers

Files go into **private** buckets. Paths must start with the signed-in user's `org_id` (RLS enforces this).

```ts
// src/lib/db/storage.ts
import { supabase } from '@/lib/supabase';

export async function uploadPrivate(
  bucket: 'proposals' | 'contracts' | 'voice-notes',
  orgId: string,
  path: string,
  file: File | Blob,
) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(`${orgId}/${path}`, file, { upsert: true, contentType: (file as File).type });
  if (error) throw error;
  return `${orgId}/${path}`;   // store this in the DB row
}

export async function getSignedUrl(
  bucket: 'proposals' | 'contracts' | 'voice-notes',
  storagePath: string,
  ttlSeconds = 3600,
) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, ttlSeconds);
  if (error) throw error;
  return data.signedUrl;
}
```

When rendering a proposal / contract / voice note, request a short-lived signed URL on demand rather than storing the public URL.

---

## 2.8 Realtime (optional, recommended for Inbox)

```ts
useEffect(() => {
  const ch = supabase
    .channel(`conversation:${id}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
      (payload) => qc.setQueryData(['messages', id], (old: Message[] = []) => [...old, payload.new as Message])
    )
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}, [id]);
```

Plug this into `Inbox.tsx` and `ContactDetail.tsx` thread panes. Not required for MVP, but it's ten lines and dramatically improves feel.

---

## 2.9 Type generation (optional but worth it)

Supabase CLI generates `Database` types from the live schema:

```bash
npx supabase login
npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
```

Then:

```ts
import type { Database } from '@/lib/database.types';
const client = createClient<Database>(url, key);
```

Your table rows become fully typed everywhere — `supabase.from('leads')` already knows its columns.

---

## 2.10 Acceptance checklist

- [ ] `src/lib/supabase.ts` exports a single client; app starts without runtime errors.
- [ ] `src/lib/db/*.ts` exists for every entity listed in §2.2.
- [ ] `CrmDataProvider` consumes React Query hooks; no more `MOCK_*` imports.
- [ ] List pages render loading + empty states (everything starts empty).
- [ ] Every mutation invalidates the right query key + shows a toast.
- [ ] Signed-in user sees only their org's rows (verified by opening two accounts in two browsers).
