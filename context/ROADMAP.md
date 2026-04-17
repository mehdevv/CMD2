# Roadmap / Scratchpad

A place to plan features. Fill in the "Planned" column and move items down as they ship. Start by marking the low-hanging improvements already obvious in the codebase (see `FEATURES.md` gaps).

---

## 1. Copy cleanup (quick wins)

Per the product spec: never say "AI" in user-facing copy.

| Where | Current string | Should be |
|-------|----------------|-----------|
| `AdminDashboard.tsx` | "AI messages sent (30d)", "AI agent activity" | "Automation messages sent", "Automation activity" |
| `ContactDetail.tsx` | "Release to AI", "AI follow-up log", "AI is handling this conversation." | "Release to automation", "Follow-up log", "Automation is handling this conversation." |
| `AgentDashboard.tsx` | "AI escalated — needs human review", "Today's automated follow-ups" (OK), "3 AI drafts" (implicit) | "Escalated — needs human review" |
| `Performance.tsx` | "AI agent performance" | "Automation performance" |
| `AdminRules.tsx` | "AI decision:" | "Automation decision:" |
| `Inbox.tsx` | Tab "AI Active" | "Automation active" |
| `Leads.tsx` | Column header "AI status" | "Automation status" |

---

## 2. Obvious feature slots (already scaffolded, not wired)

- **Login → Forgot password** flow (`Login.tsx` has `href="#"` today).
- **Onboarding** role-guarding + skip on return visits (currently anyone authenticated sees it).
- **Admin Users → Edit** modal (button exists, no handler).
- **Admin Templates → Edit / Duplicate / Delete** actions.
- **Admin Templates → Submit for review** modal button (no handler).
- **Admin Channels → Disconnect** confirmation + state update.
- **Inbox → "View contact" link** → currently plain `<a>`, swap to wouter `<Link>`.
- **Not-found page** — wire `not-found.tsx` to the catch-all route for a proper 404.

---

## 3. Things to probably build next (product direction)

Use this as a planning grid. Add your own ideas alongside.

### Data & backend
- [ ] Real API layer — swap `mock-data.ts` for fetchers.
- [ ] Persistence for agent configs (`AgentConfig` per org per agent).
- [ ] Emit internal events (`lead.created`, `message.inbound`, `order.status_changed`, `refund.requested`, `escalation.created`) so triggers actually fire.
- [ ] Encrypt API keys at rest; always return masked secrets from GET.
- [ ] Seed an `organizations` model so the UI is tenant-scoped.

### Conversations / inbox
- [ ] Unread counts in sidebar Inbox item.
- [ ] Per-conversation label / tag editor.
- [ ] Keyboard shortcuts (`j/k` next/prev, `t` take over, `r` reply).
- [ ] Voice note playback + transcription (to pair with `MeetingNotes.tsx`).
- [ ] Attachment support in compose + threads.

### Automation
- [ ] Real LLM call in Test modals when API key is set (fallback to mock otherwise — already supported by the UI).
- [ ] Version history for agent configs (diff + rollback — called out as a stretch goal in the spec).
- [ ] Shadow mode — run automation suggestions without sending until approved.
- [ ] Per-channel template library with approval states (partial today).
- [ ] Fifth agent slot (e.g. **Abandoned cart recovery** or **Appointment confirmation**) — see `AGENTS.md` checklist.
- [ ] Sequence analytics drill-down (reply rate per step chart, not just text KPIs).

### Channels
- [ ] Telegram connector (UI placeholder exists; actually connect).
- [ ] TikTok DMs connector (placeholder exists).
- [ ] Email channel (not in current scope, but a common ask).

### Intelligence
- [ ] Export CSV from Intelligence / Performance tables.
- [ ] Save filter presets in Intelligence.
- [ ] Alert when objection frequency spikes week-over-week.

### Collaboration
- [ ] Mentions (`@karim`) in lead notes.
- [ ] Internal comments on a conversation (invisible to customer).
- [ ] Shift-based assignment + availability calendar.

### Admin & platform
- [ ] SSO / OAuth (Google, Microsoft).
- [ ] Audit trail for admin changes (who flipped which toggle).
- [ ] Usage budget alerts (email when >80% of monthly message allowance).
- [ ] Org / workspace switcher (for agencies with multiple tenants).

### Mobile
- [ ] Responsive pass on Inbox + Contact Detail (currently desktop-optimized).
- [ ] PWA install + push notifications.

---

## 4. Design-system backlog

- [ ] Dark mode pass (tokens exist in `index.css` but no UI toggle).
- [ ] Standardize empty states (have `EmptyState` component, use it in Leads kanban, Notifications, Activity log).
- [ ] Replace inline `style={{ background: … }}` switches with tokens / variants.
- [ ] Audit remaining `<a>` tags that should be wouter `<Link>`.

---

## 5. Task template

Use this when dropping in a new idea so any agent or dev can pick it up:

```
### <Title>
- **Where it lives:** src/pages/<file>.tsx (+ sidebar / route)
- **Role(s):** admin / owner / agent
- **User story:** As a <role>, I want to <goal>, so that <value>.
- **Acceptance criteria:**
  - [ ] …
  - [ ] …
- **Touches:** routes / sidebar / types / mock-data / design-system?
- **Notes on copy:** …
```
