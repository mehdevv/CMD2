# Routes

Source of truth: `src/App.tsx` (wouter `<Switch>` inside `<Router>`). Role guarding is done by `ProtectedRoute` — if the signed-in user's role isn't in the allowed list, we redirect to their default dashboard.

Default dashboard per role (see `src/lib/auth.ts#getDashboardRoute`):
- `admin` → `/admin/dashboard`
- `owner` / `agent` → `/dashboard`

## Public

| Path | Component | Notes |
|------|-----------|-------|
| `/login` | `Login` (`src/pages/Login.tsx`) | Redirects to dashboard on success |
| `/onboarding` | `Onboarding` (`src/pages/Onboarding.tsx`) | Not currently role-guarded |
| `/` | — | Redirect: admin → `/admin/dashboard`, others → `/dashboard`, anon → `/login` |

## Admin-only (`role=admin`)

| Path | Component |
|------|-----------|
| `/admin/dashboard` | `AdminDashboard` |
| `/admin/users` | `AdminUsersPage` |
| `/admin/notifications` | `AdminNotifications` |
| `/admin/agents` | `AdminAgentsOverview` (exact-match highlight) |
| `/admin/agents/followup` | `AdminAgentFollowUp` |
| `/admin/agents/chat` | `AdminAgentChat` |
| `/admin/agents/tracking` | `AdminAgentTracking` |
| `/admin/agents/refund` | `AdminAgentRefund` |
| `/admin/agents/workspace` | `AdminAgentsPage` (classic tabbed workspace) |
| `/admin/automation/triggers` | `AdminAutomationTriggers` |
| `/admin/automation/intervention` | `AdminAutomationIntervention` |
| `/admin/automation/activity` | `AdminAutomationActivity` |
| `/admin/channels` | `AdminChannelsPage` |
| `/admin/templates` | `AdminTemplatesPage` |
| `/admin/rules` | `AdminRulesPage` |
| `/admin/billing` | `AdminBillingPage` |

## Owner-only (`role=owner`)

| Path | Component |
|------|-----------|
| `/automation` | `OwnerAutomationOverview` |
| `/automation/followup` | `OwnerAgentFollowUp` |
| `/automation/chat` | `OwnerAgentChat` |
| `/automation/tracking` | `OwnerAgentTracking` |
| `/automation/refund` | `OwnerAgentRefund` |

## Owner + Agent (`role in {owner, agent}`)

| Path | Component | Notes |
|------|-----------|-------|
| `/dashboard` | inline switch in `App.tsx` | `owner` → `OwnerDashboard`, `agent` → `AgentDashboard`, admin redirected to `/admin/dashboard` |

## Shared (any authenticated user)

| Path | Component |
|------|-----------|
| `/leads` | `LeadsPage` |
| `/leads/:id` | `ContactDetailPage` |
| `/inbox` | `InboxPage` |
| `/meetings/brief/:id` | `MeetingBriefPage` |
| `/meetings/notes/:id` | `MeetingNotesPage` |

### Pipeline (admin + owner + agent)

Specific paths **must** be registered before `/opportunities/:id` in `App.tsx` (wouter first match wins).

| Path | Component |
|------|-----------|
| `/opportunities/board` | `OpportunitiesBoardPage` |
| `/opportunities/:id/qualification` | `OpportunityQualificationPage` |
| `/opportunities/:id/need-analysis` | `OpportunityNeedAnalysisPage` |
| `/opportunities/:id/proposal` | `OpportunityProposalPage` |
| `/opportunities/:id/negotiation` | `OpportunityNegotiationPage` |
| `/opportunities/:id/closing` | `OpportunityClosingPage` |
| `/opportunities/:id` | `OpportunityDetailPage` |
| `/opportunities` | `OpportunitiesPage` |

## Admin + Owner

| Path | Component |
|------|-----------|
| `/intelligence` | `IntelligencePage` |
| `/performance` | `PerformancePage` |
| `/analytics` | `AnalyticsPage` |
| `/analytics/reports` | `AnalyticsReportsPage` |
| `/analytics/reports/:id` | `AnalyticsReportDetailPage` |

## Fallback

Any unmatched route redirects to the signed-in user's dashboard, or `/login` if anonymous.

---

## Adding a new route

1. Import the page in `src/App.tsx`.
2. Add a `<Route path="...">` wrapped in `<ProtectedRoute component={...} roles={[...]} />` (or inline for role-specific branching like `/dashboard`).
3. Add a `NavItem` in `src/components/layout/Sidebar.tsx` under the appropriate `section`, setting `roles: [...]`.
4. Update `PAGES.md` and `FEATURES.md`.
