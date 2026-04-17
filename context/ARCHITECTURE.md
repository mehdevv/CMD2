# Architecture

## Tech stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite 8
- **Routing:** [wouter](https://www.npmjs.com/package/wouter) (tiny React router) — declared in `src/App.tsx`
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) + custom utility classes in `src/index.css`
- **Icons:** `lucide-react`
- **Charts:** `recharts` (used in `Intelligence.tsx`)
- **UI primitives:** Radix UI + bespoke shadcn-style components in `src/components/ui/`
- **Other libs:** `clsx`, `class-variance-authority`, `tailwind-merge`, `date-fns`, `react-hook-form`, `sonner`, `cmdk`, `vaul`, `input-otp`, `next-themes`, `react-resizable-panels`, `embla-carousel-react`, `react-day-picker`

All dependencies live in `package.json`.

## Folder layout

```
Scale software/
├─ context/                  ← THIS FOLDER (documentation)
├─ scale/                    ← reference screens + HTML mockups per feature
│  ├─ dashboard_admin/
│  ├─ conversations_inbox/
│  └─ …                      (one folder per major page)
├─ src/
│  ├─ App.tsx                ← route table + AuthProvider + Router
│  ├─ main.tsx               ← React root
│  ├─ index.css              ← Tailwind + `.scale-*` design-system classes
│  ├─ components/
│  │  ├─ layout/             ← AppShell, Sidebar, Topbar
│  │  ├─ ui/                 ← design-system primitives (StatCard, ChannelDot, ScaleBadge, RadioCards, TagInput, TimeRange, InlineDuration, ScaleSlider, …)
│  │  ├─ agents/             ← agent-page shared blocks (AgentConfigShell, AgentStatusPanel, LLMConfigSection)
│  │  └─ automation/         ← OwnerFundamentalsCard etc.
│  ├─ contexts/AuthContext.tsx
│  ├─ hooks/                 ← use-mobile, use-toast
│  ├─ lib/
│  │  ├─ auth.ts             ← mock login + localStorage session
│  │  ├─ types.ts            ← Role / Lead / Conversation / Template / Rule / Invoice / FollowUpStep / FAQEntry / MeetingBrief / MeetingNote / IntelligenceItem / …
│  │  ├─ mock-data.ts        ← every seed dataset (users, leads, conversations, templates, rules, invoices, …)
│  │  ├─ utils.ts            ← `cn()` + `roleLabel()`
│  │  └─ automation-fundamentals.ts
│  └─ pages/
│     ├─ Login.tsx, Onboarding.tsx, not-found.tsx
│     ├─ AdminDashboard.tsx, OwnerDashboard.tsx, AgentDashboard.tsx
│     ├─ Leads.tsx, ContactDetail.tsx, Inbox.tsx
│     ├─ MeetingBrief.tsx, MeetingNotes.tsx
│     ├─ Intelligence.tsx, Performance.tsx
│     ├─ AdminUsers.tsx, AdminChannels.tsx, AdminTemplates.tsx, AdminRules.tsx, AdminBilling.tsx
│     ├─ AdminAgents.tsx       (classic workspace — tabbed)
│     ├─ admin/
│     │  ├─ AdminAgentsOverview.tsx
│     │  ├─ AdminAgentFollowUp.tsx, AdminAgentChat.tsx, AdminAgentTracking.tsx, AdminAgentRefund.tsx
│     │  ├─ AdminAutomationTriggers.tsx, AdminAutomationIntervention.tsx, AdminAutomationActivity.tsx
│     │  └─ AdminNotifications.tsx
│     └─ owner/automation/
│        ├─ OwnerAutomationOverview.tsx
│        └─ OwnerAgentFollowUp.tsx, OwnerAgentChat.tsx, OwnerAgentTracking.tsx, OwnerAgentRefund.tsx
├─ public/
├─ replit_automation_agents_full_prompt.md   ← full product spec for the 4 agents
├─ scale_agents_prompt.json                  ← older spec (JSON)
├─ Emailing scale_roles_guide.pdf            ← role definitions (binary)
├─ Scale  (1).pdf                            ← design PDF (binary, 80 MB)
├─ package.json, vite.config.ts, tsconfig*.json, eslint.config.js
└─ README.md
```

## Authentication model

`src/contexts/AuthContext.tsx` provides `{ user, login, logout, loading }`. Backed by `src/lib/auth.ts` which:
- Has 3 hardcoded `MOCK_USERS` (admin / owner / agent, all password `demo`).
- Persists the signed-in user to `localStorage` under key `scale_auth_user`.
- Exposes `getDashboardRoute(role)` used by Login.

### Role guarding

`ProtectedRoute` in `src/App.tsx` wraps each role-scoped route:

```tsx
<ProtectedRoute component={AdminDashboard} roles={['admin']} />
```

- Not signed in → redirect to `/login`.
- Wrong role → redirect to the role's default dashboard.
- No `roles` prop → any authenticated user allowed.

## State & data flow

- **Global state:** just `AuthContext`. No Redux, Zustand, Jotai, TanStack Query.
- **Page state:** `useState`/`useMemo` inside each page. Form state is local; there's no persistence backend yet.
- **Data source:** `src/lib/mock-data.ts` exports:
  - `MOCK_USERS`, `MOCK_AGENTS`, `MOCK_LEADS`, `MOCK_CONVERSATIONS`, `MOCK_MEETING_BRIEFS`, `MOCK_MEETING_NOTES`, `MOCK_INTELLIGENCE`, `MOCK_ACTIVITY_FEED`, `MOCK_TEMPLATES`, `MOCK_PENDING_TEMPLATES`, `MOCK_INVOICES`, `MOCK_LEADERBOARD`, `MOCK_AI_AGENT_METRICS`, `DEFAULT_FOLLOWUP_STEPS`, `DEFAULT_FAQ`, `DEFAULT_RULES`
- **Types:** `src/lib/types.ts` — single source of truth for `Role`, `Channel`, `Stage`, `AIStatus`, and the domain objects (`Lead`, `Conversation`, `Message`, `Template`, `Rule`, `Invoice`, `MeetingBrief`, `MeetingNote`, `IntelligenceItem`, `FollowUpStep`, `FAQEntry`, `AgentMetrics`, `User`, `UserStatus`, `TemplateStatus`).

### When you add a real backend

The `replit_automation_agents_full_prompt.md` spec lists these entities as the minimum backend surface — map them to your DB / API:

- `AgentConfig` (per org, per agent id)
- `AutomationTrigger`, `SequenceDefinition`
- `RefundPolicy`, `CarrierIntegration`
- `NotificationRule`, `AutomationEventLog`
- `ConversationThread` with `automation_paused`, `assigned_user_id`
- Events: `lead.created`, `message.inbound`, `order.status_changed`, `refund.requested`, `escalation.created`

## App shell

`src/components/layout/AppShell.tsx` wraps every authenticated page:

```tsx
<AppShell title="Leads">
  {/* page content */}
</AppShell>
```

Inside: `Sidebar` (left, 220px, `fixed`) + `Topbar` (top bar with page title) + scrollable content area with `padding` (unless `noPadding` is passed for full-bleed pages like Inbox).

### Sidebar nav

`src/components/layout/Sidebar.tsx` defines all nav items with `{ label, href, icon, roles, exact? }` grouped by section (Workspace / Intelligence / Automation / Settings). Items are filtered by `user.role`.

## Styling conventions

Custom utility classes in `src/index.css`:
- `.scale-card` — white, 1px border `#E4E4E8`, radius 8px, padding 20px
- `.scale-input` — 36px height, radius 6px, focus border `#2B62E8`
- `.scale-btn-primary` — accent `#2B62E8`, hover `#1E52D4`
- `.scale-btn-secondary` — transparent + 1px border
- `.scale-btn-ghost` — transparent + muted text
- `.scale-btn-danger` — red text + red-tinted border
- `.ai-active / .ai-paused / .ai-completed / .ai-escalated` — semantic status colors

See `DESIGN_SYSTEM.md` for the full palette + typography.

## Build scripts

```
npm run dev       # vite dev server
npm run build     # tsc -b && vite build
npm run preview   # preview production build
npm run lint      # eslint
```

## Known constraints / gotchas

- **Wouter, not React Router.** Use `<Link href=…>` and `useLocation()` from `wouter`, not react-router-dom.
- **Relative paths are imported with `@/`** via the Vite alias — always `@/components/...`, `@/lib/...`.
- **Role-protected routes** must be wrapped in `<ProtectedRoute>` or they leak to any signed-in user.
- **"AI" is allowed in code / variable names** but avoid it in user-facing strings (see the copy rules in README and DESIGN_SYSTEM).
- **No toast/notification plumbing.** `sonner` is installed but the app mainly uses inline "Changes saved" states.
- The **classic workspace** (`/admin/agents/workspace`) and the new per-agent pages maintain **separate state** — editing one does not reflect in the other.
