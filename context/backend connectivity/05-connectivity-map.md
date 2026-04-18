# 05 — Connectivity cheat sheet

One screen to answer "which hook does this page use, and what does it hit in Supabase?" during implementation. Use alongside `02-data-access-layer.md` for function signatures.

---

## 5.1 Auth + shell

| Page / component | Hook(s) | Tables / RPC |
|---|---|---|
| `AuthContext` | `supabase.auth.onAuthStateChange`, `getSession`, `rpc('bootstrap_my_org')` | `auth.users`, `profiles`, `organizations` (+ seeded children via RPC) |
| `Login.tsx` | `auth.signInWithPassword` | `auth.users` |
| `Register.tsx` | `auth.signUp` + RPC | `auth.users`, `profiles`, `organizations` |
| `ForgotPassword.tsx` | `auth.resetPasswordForEmail` | — |
| `ResetPassword.tsx` | `auth.updateUser({ password })` | `auth.users` |
| `AppShell` → notification bell | `useNotifications()` | `notifications` |

---

## 5.2 Workspace

| Page | Hooks | Tables |
|---|---|---|
| `AdminDashboard` | `useLeads`, `useOpportunities`, `useActivityLog`, `useChannels`, `usePendingTemplates`, `useNotifications` | `leads`, `opportunities`, `automation_activity_log`, `channels`, `templates`, `notifications` |
| `OwnerDashboard` | `useLeads`, `useOpportunities`, `useIntelligence`, `useMeetingNotes` | `leads`, `opportunities`, `intelligence_items`, `meeting_notes` |
| `AgentDashboard` | `useLeads({ assignedToMe })`, `useOpportunities({ ownerId: me })` | `leads`, `opportunities` |
| `Leads` | `useLeads`, `useCreateLead` | `leads`, `lead_tags`, `lead_pain_points` |
| `ContactDetail` | `useLead(id)`, `useUpdateLead`, `useConversation(leadId)`, `useMessages(convId)`, `useSendMessage`, `useMeetingsForLead(id)`, `useConvertLead` | `leads`, `lead_tags`, `lead_pain_points`, `conversations`, `messages`, `meeting_briefs`, `meeting_notes`, `opportunities` (via RPC) |
| `Inbox` | `useConversations`, `useMessages`, `useSendMessage`, `useToggleTakeover` | `conversations`, `messages` |

---

## 5.3 Pipeline

| Page | Hooks | Tables |
|---|---|---|
| `Opportunities` (list) | `useOpportunities`, `useOpportunityKpis` | `opportunities` |
| `OpportunitiesBoard` | `useOpportunities`, `useMoveStage` | `opportunities`, `opportunity_stage_transitions` |
| `OpportunityDetail` | `useOpportunity(id)`, `useStageTransitions(id)`, `useMoveStage`, `useWonLost` | `opportunities`, `opportunity_stage_transitions` |
| `OpportunityQualification` | `useQualification(id)`, `useSaveQualification` | `opportunity_qualification`, `opportunity_competing_solutions`, `opportunity_risk_flags` |
| `OpportunityNeedAnalysis` | `useNeedAnalysis(id)`, `useSaveNeedAnalysis` | `opportunity_need_analysis`, `opportunity_goals`, `opportunity_metrics_to_move`, `opportunity_decision_criteria`, `opportunity_stakeholders` |
| `OpportunityProposal` | `useProposals(id)`, `useSaveProposal`, `useSendProposal` | `proposals`, `proposal_line_items` |
| `OpportunityNegotiation` | `useObjections(id)`, `useLogObjection`, `usePayments(id)`, `useSavePayment` | `opportunity_objections`, `payments` |
| `OpportunityClosing` | `usePayments(id)`, `useSavePayment`, `useUploadContract` | `payments`, `opportunities.contract_url`, storage `contracts` |
| `WonLostDialog` | `useWonLost` | `opportunities`, `opportunity_stage_transitions` |

---

## 5.4 Meetings

| Page | Hooks | Tables / Storage |
|---|---|---|
| `MeetingBrief` | `useBrief(id)`, `useSaveBrief` | `meeting_briefs` |
| `MeetingNotes` | `useNotes(id)`, `useSaveNotes`, `useUploadVoiceNote` | `meeting_notes`, storage `voice-notes` |

---

## 5.5 Insights

| Page | Hooks | Tables |
|---|---|---|
| `Intelligence` | `useIntelligence()` | `intelligence_items` |
| `Performance` | `useTeamLeaderboard`, `useAgentMetrics` | `profiles`, `opportunities`, `opportunity_stage_transitions` |
| `Analytics` | selectors from `src/lib/analytics.ts` over `useLeads`, `useOpportunities`, `useProposals`, `usePayments` | `leads`, `opportunities`, `proposals`, `payments` |
| `AnalyticsReports` | `useReports`, `useCreateReport` | `analytics_reports` |
| `AnalyticsReportDetail` | `useReport(id)` | `analytics_reports` |

---

## 5.6 Automation (admin)

| Page | Hooks | Tables |
|---|---|---|
| `AdminAgentsOverview` | `useAgentConfigs`, `useToggleAgent` | `automation_agent_configs` |
| `AdminAgentFollowUp` | `useAgentConfig('followup')`, `useFollowupSteps`, `useForbiddenTopics`, `useTemplates` | `automation_agent_configs`, `followup_steps`, `agent_forbidden_topics`, `templates` |
| `AdminAgentChat` | `useAgentConfig('chat')`, `useFaqEntries` | `automation_agent_configs`, `faq_entries` |
| `AdminAgentTracking` | `useAgentConfig('tracking')`, `useCarrierIntegration`, `useStatusMessages` | `automation_agent_configs`, `carrier_integrations`, `status_messages` |
| `AdminAgentRefund` | `useAgentConfig('refund')`, `usePolicyRules`, `useRefundDecisions` | `automation_agent_configs`, `policy_rules`, `refund_decisions` |
| `AdminAutomationTriggers` | `useTriggers`, `useToggleTrigger` | `automation_triggers` |
| `AdminAutomationIntervention` | `useIntervention`, `useSaveIntervention` | `intervention_settings` |
| `AdminAutomationActivity` | `useActivityLog({ kind, agentId, q })` | `automation_activity_log` |

## 5.7 Automation (owner)

Same tables and hooks as admin, but the forms hide `provider / api_key / model / temperature / max_tokens` (`AdminAgentFollowUp` → `OwnerAgentFollowUp`, etc.) and read-only around carrier / policy numbers.

---

## 5.8 Settings (admin)

| Page | Hooks | Tables |
|---|---|---|
| `AdminUsers` | `useProfiles`, `useInviteUser`, `useUpdateProfile` | `profiles` (+ email invite via Supabase Auth later) |
| `AdminChannels` | `useChannels`, `useUpsertChannel` | `channels` |
| `AdminTemplates` | `useTemplates`, `useSaveTemplate` | `templates` |
| `AdminRules` | `useRules`, `useSaveRule`, `useRefundPolicy`, `useSaveRefundPolicy` | `rules`, `refund_policy` |
| `AdminBilling` | `useBilling`, `useInvoices` | `billing`, `invoices` |

---

## 5.9 Real-time channels (optional)

| Subscription | Trigger | Who cares |
|---|---|---|
| `messages` INSERT filtered by `conversation_id` | new inbound / outbound message | Inbox thread, ContactDetail thread |
| `notifications` INSERT filtered by `recipient_id` | any new notification | Topbar bell |
| `automation_activity_log` INSERT | live activity feed | AdminDashboard activity feed, AutomationActivity page |

All via `supabase.channel(...).on('postgres_changes', { ... }).subscribe()`.

---

## 5.10 What nothing should read

If you're tempted to `select * from` any of these from the client, stop and route through an edge function instead (with service-role key):

- Nothing in `auth.*` schema directly.
- No `secret` columns across orgs.
- No multi-tenant aggregates — today every query is single-org by RLS; a future cross-org admin view uses an edge function.
