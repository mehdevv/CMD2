# Design system

The Scale UI is intentionally flat, minimal, and slightly "notion-style". If it looks fancy, it's wrong.

## Color tokens

| Purpose | Hex | Notes |
|---------|-----|-------|
| Page background | `#F7F7F8` | Always the app background |
| Card / surface | `#FFFFFF` | With `1px solid #E4E4E8` border |
| Border | `#E4E4E8` | The *only* border color you normally need |
| Text primary | `#1A1A3E` | Near-black navy |
| Text secondary | `#6B6B80` | Muted body copy |
| Text tertiary | `#9999AA` | Helper / timestamps / placeholders |
| Accent / primary | `#2B62E8` | Primary button, links, selected state |
| Accent hover | `#1E52D4` | Primary button hover |
| Selected-row tint | `#EEF3FD` | Light blue tint |
| Success | `#16A34A` | Success text / active status |
| Warning | `#D97706` | Pending / caution |
| Danger | `#DC2626` | Error / escalation |
| Danger border tint | `#FCA5A5` | `.scale-btn-danger` |
| Danger bg tint | `#FEF2F2` | `.scale-btn-danger:hover` |
| Success bg tint | `#F0FDF4` | Confirmation panels |
| Success border tint | `#BBF7D0` | Confirmation panels |
| Warning bg tint | `#FFFBEB` | Chat log badges |
| Warning text tint | `#B45309` | Chat log badges |
| Info bg tint | `#EEF3FD` | Activity badges, intelligence panels |
| Info text tint | `#1E3A8A` | On `#EEF3FD` backgrounds |

Status colors for AI/automation state are exposed as utility classes in `src/index.css`:
- `.ai-active` → `#16A34A`
- `.ai-paused` → `#D97706`
- `.ai-completed` → `#9999AA`
- `.ai-escalated` → `#DC2626`

## Typography

- **Font family:** Inter (loaded from Google Fonts in `index.css`). Fallbacks: system-ui, sans-serif.
- **Mono font:** Menlo (used in the webhook/API token display and quoted responses).
- **Base body size:** 14 px, line height 1.6.
- **Max font weight:** **600** (semi-bold). Do not use 700/800/900.
- Common sizes: headings 22 / 17 / 15, body 14, small 13, micro 12, label 11.

## Radii & borders

- **Max radius:** 8 px (cards, modals). Inputs & buttons use 6 px.
- **Border:** always `1px solid #E4E4E8` unless semantic color required.
- **No shadows, no gradients, no glows.** One exception: very subtle `--shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.06)` for popovers.

## Spacing

- Page gutters: 20 – 40 px (`AppShell` provides `padding` by default).
- Card padding: 20 px.
- Between sections: `mb-6` / `mb-8` (24 / 32 px).

## Components to reuse

### Layout
- `components/layout/AppShell.tsx` — wraps authenticated pages with sidebar + topbar
- `components/layout/Sidebar.tsx` — single source of truth for nav items
- `components/layout/Topbar.tsx` — page title header

### Agents (use for ALL automation pages)
- `components/agents/AgentConfigShell.tsx` — 3-column layout with anchor nav + sections + right panel; exports `SectionBlock` and `FieldGroup` helpers
- `components/agents/AgentStatusPanel.tsx` — right-side status card with enable toggle, stats, last edited, Test button
- `components/agents/LLMConfigSection.tsx` — provider / API key / model / temperature / max tokens

### Design primitives (`src/components/ui/…`)
- `StatCard` — KPI card (label + value + optional delta)
- `ChannelDot` — colored dot for whatsapp / instagram / facebook (optional label)
- `ScaleBadge` / `StageBadge` / `TemplateBadge` / `RoleBadge` / `UserStatusBadge` — status chips
- `AIStatusLabel` — active / paused / completed / escalated label
- `ProgressBar` — usage bars (billing)
- `RadioCards` — card-style radio group (used by tone pickers, message modes)
- `TagInput` — tag entry with optional examples + restrictive mode
- `InlineDuration` — number input + unit dropdown (minutes / hours / days)
- `TimeRange` — paired `time` inputs ("from" / "to")
- `ScaleSlider` — accessible slider (confidence threshold, temperature)
- `InfoBlock` — soft blue info callout (no emoji, no icon clutter)
- `PasswordInput` — password field with show/hide and optional test button
- `EmptyState` — empty-list placeholder
- All Radix wrappers (`dialog`, `popover`, `tooltip`, `select`, `tabs`, `accordion`, `alert-dialog`, etc.)

## Custom utility classes

In `src/index.css`:

```
.scale-card
.scale-input
.scale-btn-primary
.scale-btn-secondary
.scale-btn-ghost
.scale-btn-danger
```

Use these instead of re-implementing button/input styles in every component.

## Copy rules (product-critical)

From the master product spec (`replit_automation_agents_full_prompt.md`):

1. **Avoid the word "AI"** in anything a customer / non-admin sees. Use "automation" or the agent's name (e.g. "Sara"). Some admin pages still violate this (`AdminRules.tsx`, `Performance.tsx`, `ContactDetail.tsx`) — good candidates for copy cleanup.
2. Prefer short, direct labels. Sentence case, not Title Case, for button text.
3. Inline confirmation over toast spam: `{saved ? '✓ Changes saved' : ''}` next to the save button.
4. `{{variable}}` syntax in all message templates.

## Screens to keep as visual reference

The `scale/<feature>/` folders contain reference PNGs and HTML mockups of the intended layout for every major page (e.g. `scale/dashboard_admin/screen.png`, `scale/conversations_inbox/screen.png`). Use them when redesigning anything.

## Accessibility

- Every form control has a visible label (12 / 13 px in `#1A1A3E`).
- `data-testid` attributes are used across the app for test hooks — keep adding them on new inputs, buttons, and rows.
- Focus ring is implicit via `--ring: 224 80% 47%` (the accent). Avoid `outline: none` without a replacement.
