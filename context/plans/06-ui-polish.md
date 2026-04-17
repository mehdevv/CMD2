# 06 · UI polish pass — scrollbars, sidebar, search fields, one‑line copy, bot colors

Status: **plan** (execute in a dedicated PR after Phase C merges).

This is a pure front-end polish pass. No routing or data-model changes. Stick to the tokens in `context/DESIGN_SYSTEM.md` — nothing here introduces new shadows, gradients, or radii.

---

## 1 · Goals (in priority order)

1. **Minimal, thin scrollbars** everywhere (sidebar, inbox list, conversation thread, long pages, dialogs).
2. **Sidebar is isolated** — it keeps its own scroll position across navigation; it never jumps to top on route change. Only the brand mark at the top, no user block.
3. **Clean search fields** — the magnifier icon must sit in a padded gutter, visually separated from the value and placeholder. Same treatment everywhere (`Topbar`, `FilterToolbar`, `Inbox`, `ConversationListPanel`, owner team filter, `AskQuestionCard`).
4. **One-line labels / descriptions** — every KPI, card label, tile description, and row subtitle collapses to a single line with truncation + tooltip when it overflows. No copy that deliberately wraps to two lines in card chrome.
5. **Per-bot color identity** — each automation agent (Lead Follow-Up, Client Chat, Order Tracking, Refund) has its own brand accent used consistently across admin overview tile, owner overview tile, activity log type chip, intervention/escalation banners, conversation thread badges, and drafts/approval lists.

---

## 2 · Work items

### 2.1 Minimal scrollbars

**Where:** global CSS in `src/index.css`.

Add a single utility (no JS, no libs):

```
.scale-scroll {
  scrollbar-width: thin;                       /* Firefox */
  scrollbar-color: #D4D4DA transparent;        /* thumb / track */
}
.scale-scroll::-webkit-scrollbar          { width: 6px; height: 6px; }
.scale-scroll::-webkit-scrollbar-track    { background: transparent; }
.scale-scroll::-webkit-scrollbar-thumb    { background: #D4D4DA; border-radius: 3px; }
.scale-scroll::-webkit-scrollbar-thumb:hover { background: #9999AA; }
```

**Apply to:**
- `src/components/layout/Sidebar.tsx` — `<aside class="... scale-scroll">`
- `src/components/conversations/ConversationListPanel.tsx`
- `src/components/conversations/ConversationThread.tsx`
- `src/components/ui/DialogShell.tsx` (body area)
- `src/components/agents/AgentConfigShell.tsx` (center column + right panel)
- `src/pages/ContactDetail.tsx` (timeline column)
- `src/components/leads/EnrichmentDialog.tsx`

Optional follow-up: apply `.scale-scroll` to `html, body` so the page scrollbar matches.

**Acceptance:** no chunky OS scrollbars on Windows/Mac Chromium; rail is 6 px, neutral gray, hidden track.

---

### 2.2 Sidebar is a stable shell, not re-mounted per route

**Problem observed in screenshot:** when the user clicks a sidebar item, the aside visually "scrolls back to the top" because the parent layout re-renders. The sidebar should behave like a separate, persistent component.

**Change:**
- In `src/components/layout/AppShell.tsx`, do not re-render the `<Sidebar />` tree through page props. It already receives nothing that changes per-route — confirm no key/prop forces a remount.
- Make sure the outer scroll container is the page/`<main>`, **not** the `<aside>`. The `<aside>` only needs to scroll when its own nav is taller than the viewport.
- The internal nav list uses `href`, `wouter`'s `<Link>` with React state for active — no page reload. Already the case; confirm no `window.location.assign`.
- Add `overscroll-behavior: contain` on the aside so scrolling inside the sidebar never bleeds into the main content, and remove the implicit top-jump.
- **Remove the user block** (avatar + name + role + logout icon) from the bottom of the sidebar. The only chrome inside the sidebar is:
  - Brand mark (top)
  - Section groups + nav items
- **Move logout / user menu to `Topbar.tsx`** (small menu anchored on the avatar circle that's already there).

**Acceptance:**
- Navigating between `Dashboard → Leads → Inbox → Opportunities` does not visually scroll the sidebar.
- Sidebar contains brand logo + nav only.
- Logout still reachable from the avatar in the top bar.

---

### 2.3 Clean search field (shared component)

**Problem observed:** the search icon overlaps the first characters of the placeholder / value because it sits at `left-2.5` with only `pl-8`, and the icon uses the same gray as the placeholder, so the eye can't separate them.

**Change:** update `src/components/filters/FilterToolbar.tsx` and the inline search in `src/components/layout/Topbar.tsx` to the following pattern, then reuse it everywhere.

Visual spec:
- Wrapper: `relative`, min-height 36 px (matches `.scale-input`).
- Icon: `lucide-react` `Search`, size 14, color `#9999AA`, absolute, **`left-3`** (12 px from the edge).
- Input: `.scale-input`, `padding-left: 36px` (not 32), so the text starts **8 px after the icon** — visible gutter.
- Divider: after the icon, a 1 px vertical hairline at `left: 28px` in `#E4E4E8`, height 16, centered. This is the "clean" separator between icon and text that your screenshot is missing.
- Focus: border color `#2B62E8` (already via `.scale-input:focus`); icon color stays `#9999AA`.
- Optional clear `X` button when value is non-empty, 12 px from right.

Where to apply:
- `Topbar.tsx` global search.
- `FilterToolbar.tsx` (used by `LeadFilters`, `OpportunityFilters`, admin activity).
- `Inbox.tsx` conversation search.
- `ConversationListPanel.tsx`.
- Any `<input type="search">` with an icon — extract a tiny shared `SearchField` into `src/components/ui/SearchField.tsx` so future pages don't re-implement it.

**Acceptance:**
- Icon and text are visually separated (gutter + optional hairline).
- All search inputs share one component — one place to change their look.
- Keyboard users still see the focus ring and can clear with Escape.

---

### 2.4 One-line labels / descriptions

**Policy:** cards and rows display labels and descriptions on a **single line**. If the string would overflow the container, it truncates with ellipsis and exposes the full text via `title=` (and/or Radix Tooltip on hover).

**Shared helper:** add `truncate` + `title={text}` where we currently use `line-clamp-2`.

Places to audit (non-exhaustive):
- `components/dashboards/KpiRow.tsx` → `StatCard` delta copy.
- `components/admin/AutomationAgentTile.tsx` → `description` (currently two-line).
- `components/agent/NeedsAttentionList.tsx` subtitle.
- `components/agent/DraftsToApproveList.tsx` preview.
- `components/meetings/RecentMeetingList.tsx` summary (was `line-clamp-2`; keep as 1 line + tooltip or move to a dedicated "expand" interaction).
- `components/dashboards/IntelligenceHighlightCard.tsx` headline + detail — headline is 1 line, detail stays multi-line by design (it's body copy, not chrome). Decide per card.
- `components/opportunities/OpportunityCard.tsx` contact + note.
- `components/leads/LeadCard.tsx` last message preview.

Rule of thumb:
- **Chrome (label / title / badge):** 1 line, always.
- **Body prose (explanations, report excerpts):** may wrap, but capped at 3 lines with `line-clamp-3` + "Show more".

**Acceptance:** no card in any dashboard renders a wrapped title or wrapped subtitle at `≥ 360 px` column width.

---

### 2.5 Per-bot color identity

Today automation agents all render in the same blue (`#2B62E8`) tile. Introduce a small palette, keyed by agent id, so a user can recognize which agent is speaking/acting at a glance.

Palette (matches tokens, only tints — no new hues):

| Agent id   | Name             | Tint bg     | Solid / icon | Text on tint |
|------------|------------------|-------------|--------------|--------------|
| `followup` | Lead Follow-Up   | `#EEF3FD`   | `#2B62E8`    | `#1E3A8A`    |
| `chat`     | Client Chat      | `#F0ECFB`   | `#5B4BB0`    | `#3B2E7A`    |
| `tracking` | Order Tracking   | `#F0FDF4`   | `#16A34A`    | `#166534`    |
| `refund`   | Refund           | `#FFFBEB`   | `#D97706`    | `#B45309`    |

Add a single source of truth:

```
// src/lib/agent-brand.ts
export type AgentId = 'followup' | 'chat' | 'tracking' | 'refund';
export const AGENT_BRAND: Record<AgentId, {
  label: string;
  tint: string;       // background for chips / tile icon box
  solid: string;      // icon color, active borders
  text: string;       // text on tint
}> = { … };
```

Where to thread it:
- `AutomationAgentTile` (admin + owner) — icon box background = tint, `Bot` icon color = solid.
- `ActivityTypeBadge` — reuse the tint/text pair per agent row so "Lead Follow-Up" rows read differently from "Refund" rows.
- `AutomationActivityFeed` — left accent bar at `solid` color.
- `AdminAutomationTriggers` / `TriggerEventTable` — small colored dot next to the agent name column.
- Conversations: `MessageBubble` — when the message was authored by automation, border-left is the solid color; `ThreadHeader` shows an agent chip in tint+text.
- Agent dashboard `DraftsToApproveList` — the `ChannelDot` already carries the channel color; add a separate agent chip on the right that uses the agent tint.

**Acceptance:**
- One map, four agents, four tokens each; no hex literals outside `agent-brand.ts`.
- A screenshot of the admin overview makes each agent instantly distinguishable.
- The activity log shows four clearly different-colored "type" chips for sequence/chat/tracking/refund rows.

---

## 3 · Sequencing

1. `SearchField` primitive + replace usages.
2. `.scale-scroll` utility + add the class to long-scrolling regions.
3. Sidebar isolation: remove user block, move logout to Topbar, verify no remount on route change.
4. One-line audit: replace `line-clamp-2` in chrome with `truncate + title`.
5. `agent-brand.ts` + thread through the five surfaces listed in 2.5.

Each step is its own commit, each is independently revertable.

---

## 4 · Non-goals

- No new pages.
- No change to nav IA or routes.
- No redesign of primary buttons, cards, or typography scale.
- No animation work — any transition stays ≤ 150 ms linear, same as today.

---

## 5 · Acceptance checklist (PR template)

- [ ] Scrollbars are 6 px / neutral gray in sidebar, inbox, thread, dialogs, long forms.
- [ ] Sidebar holds only brand + nav; user avatar/logout live in `Topbar`.
- [ ] Clicking any sidebar item does not visually reset the sidebar's scroll.
- [ ] Every search input uses the shared `SearchField` — icon has a visible gutter and the hairline separator.
- [ ] No card title or chrome subtitle wraps to 2 lines in dashboards at standard widths.
- [ ] Admin + owner automation overviews show four visually distinct agent tiles.
- [ ] Activity log "type" column is color-coded by agent, using tokens from `agent-brand.ts`.
- [ ] `npm run build` and `npm run lint` are green.
