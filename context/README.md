# Scale — Platform Context

This folder documents the **Scale CRM** platform so you (and any future contributor or agent) can edit it and add new features with full context.

> Scale is a CRM for Algerian (and similar) SMBs that centralizes **WhatsApp / Instagram / Facebook** conversations and runs **four always-on automation agents** (Lead Follow-Up, Client Chat, Order Tracking, Refund) on top of a classic leads / inbox / intelligence workflow.

---

## How to use these docs

| File | What's in it | Use it when you want to… |
|------|-----------------|--------------------------|
| [`PAGES.md`](./PAGES.md) | Every page in the app, grouped by section, with features and data each one uses | …add a new feature to an existing page, or figure out where a feature lives |
| [`ROUTES.md`](./ROUTES.md) | URL → component map, role-protected paths, redirect behavior | …add a new route or change navigation |
| [`FEATURES.md`](./FEATURES.md) | Feature matrix by role (admin / owner / agent) and by functional area | …decide who should see what, or spot gaps |
| [`AGENTS.md`](./AGENTS.md) | The four automation agents: responsibilities, config sections, triggers, metrics | …edit an agent config page or add a new agent |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Tech stack, folder layout, auth, state, mock data, how pieces connect | …onboard, or plan a structural change |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Colors, typography, components, copy rules (never say “AI” in user-facing text) | …build a new UI piece that looks native |
| [`ROADMAP.md`](./ROADMAP.md) | Empty-ish scratchpad for new features, organized so you can drop ideas in the right slot | …plan what you want to build next |

---

## 30-second platform summary

- **Roles:** `admin` (configures), `owner` (reads intelligence, shapes automation copy), `agent` (works leads in the inbox).
- **Auth:** mock — `admin@scale.dz / demo`, `owner@scale.dz / demo`, `agent@scale.dz / demo` (stored in `localStorage`).
- **Shell:** left sidebar + topbar (`AppShell` → `Sidebar` + `Topbar`), content area on `#F7F7F8`, cards on white with `1px #E4E4E8` borders.
- **Nav sections:** Workspace (Dashboard / Leads / Inbox), Intelligence (Intelligence / Performance), Automation (4 agent pages + triggers + intervention + activity log + classic workspace), Settings (Users / Channels / Templates / Rules / Billing).
- **Routing:** [`wouter`](https://www.npmjs.com/package/wouter) declared in `src/App.tsx`.
- **State:** local component state + `AuthContext`. No backend yet — data comes from `src/lib/mock-data.ts`.
- **Styling:** Tailwind v4 + custom design-system classes in `src/index.css` (`.scale-card`, `.scale-input`, `.scale-btn-primary`, `.scale-btn-secondary`, `.scale-btn-ghost`, `.scale-btn-danger`).

See `ARCHITECTURE.md` for the full breakdown.

---

## Copy rules (important)

From `replit_automation_agents_full_prompt.md` and applied across the app:

1. In **user-facing copy** avoid the word **“AI”**. Use **automation**, **agent**, or the agent's name (Sara, etc.).
2. No gradients, no glows, no heavy shadows.
3. Max font-weight `600`. Max radius `8px`. Border `1px solid #E4E4E8`.
4. Font: Inter. Text color `#1A1A3E`. Accent `#2B62E8`. Background `#F7F7F8`.

---

## Source documents this context was built from

- `src/App.tsx` (authoritative route list)
- `src/components/layout/Sidebar.tsx` (authoritative nav structure)
- Every file under `src/pages/**`
- `src/lib/types.ts`, `src/lib/auth.ts`, `src/lib/mock-data.ts`
- `replit_automation_agents_full_prompt.md` (product spec for the four agents)
- `Emailing scale_roles_guide.pdf` (role responsibilities — binary, summarized via code)
- `scale_agents_prompt.json` + reference screens under `scale/<page>/`

---

## How to extend the platform

1. **New page:** add a file under `src/pages/` → register the route in `src/App.tsx` → add a nav item in `src/components/layout/Sidebar.tsx` (with the right `roles`). Then document it in `PAGES.md`.
2. **New automation agent:** follow the pattern in `src/pages/admin/AdminAgent*.tsx` using shared blocks in `src/components/agents/` (`AgentConfigShell`, `LLMConfigSection`, `AgentStatusPanel`) + add admin + owner variants. Then document it in `AGENTS.md`.
3. **New data type:** add to `src/lib/types.ts` and seed mocks in `src/lib/mock-data.ts`.
4. **New design primitive:** put it in `src/components/ui/` and, if it's a pattern (tokens, spacing, etc.), document it in `DESIGN_SYSTEM.md`.
