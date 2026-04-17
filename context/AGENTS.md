# Automation Agents

Scale has **four always-on automation agents**. Each has a dedicated admin configuration page (with LLM settings) and an owner-facing page (customer-facing copy only). Admin sets technical + policy limits; owner shapes tone and content.

Design reference: `replit_automation_agents_full_prompt.md` at the project root.

Shared building blocks live in `src/components/agents/`:
- `AgentConfigShell.tsx` — 3-column layout: left anchor nav / center sections / right status panel + `SectionBlock` + `FieldGroup`
- `AgentStatusPanel.tsx` — enable/disable toggle, live stats, last edited, **Test** button
- `LLMConfigSection.tsx` — provider (OpenAI / Anthropic / Google / Custom), API key, model, temperature, max tokens — reused across all admin agent pages

---

## 1. Lead Follow-Up Agent

Files:
- Admin: `src/pages/admin/AdminAgentFollowUp.tsx` → `/admin/agents/followup`
- Owner: `src/pages/owner/automation/OwnerAgentFollowUp.tsx` → `/automation/followup`

**What it does:** Contacts new leads automatically on WhatsApp / Instagram / Facebook. Runs a configurable sequence until the lead replies or the sequence ends. Can assign the lead to a sales agent.

### Config sections (admin)
1. LLM configuration
2. Agent personality — name, tone (professional / friendly / direct / custom), language, system prompt, forbidden topics, business context
3. Follow-up sequence — ordered steps (drag-reorder), each: delay + unit, message mode (template / automation-generated / hybrid), template picker, instruction, channels, send window, stop conditions. Global: max steps, send window, timezone, weekends toggle, re-engage restart.
4. Assignment rules — round-robin / by channel / by territory / default pool
5. Triggers — new lead any / per-channel / stage change / manual / tag added, plus "do not trigger if" conditions
6. Human intervention — escalation reasons, complaint keywords, high-value threshold, notify-via, template, pause-after-escalation
7. Tracked metrics — sequence completion rate, reply rate per step, avg time to first response

### Test modal
Fake lead name + channel + opening message → renders the sequence timeline with delays and message previews.

### Owner subset
Fundamentals card + agent/prompts + sequence + assignment + triggers + escalation messages (no LLM config).

---

## 2. Client Chat Agent

Files:
- Admin: `src/pages/admin/AdminAgentChat.tsx` → `/admin/agents/chat`
- Owner: `src/pages/owner/automation/OwnerAgentChat.tsx` → `/automation/chat`

**What it does:** Answers inbound customer questions using FAQ + LLM. Escalates when out of scope, low confidence, or negative sentiment.

### Config sections (admin)
1. LLM configuration + max response time + holding message
2. Personality & mood — tone cards (professional / friendly / direct / empathetic), emoji level, mirror-customer-energy, opening message
3. Knowledge base — Q/A pairs with categories, Fallback-to-LLM toggle
4. Response rules — max consecutive automation messages, after-hours behavior
5. Triggers — new inbound / unassigned only / channel filters
6. Human intervention — confidence slider, keywords, sentiment, attachment received, refund/order mention, idle timeout
7. Tracked metrics — questions answered, escalation rate, avg resolution time

### Test modal
Chat simulator that echoes per-reply confidence scores (not shown to the customer).

---

## 3. Order Tracking Agent

Files:
- Admin: `src/pages/admin/AdminAgentTracking.tsx` → `/admin/agents/tracking`
- Owner: `src/pages/owner/automation/OwnerAgentTracking.tsx` → `/automation/tracking`

**What it does:** Reads carrier data and sends proactive status updates. On dissatisfaction, hands off to the Refund agent + notifies owner.

### Config sections (admin)
1. LLM configuration
2. Delivery carrier API — base URL, API key (password + test), auth type, polling / webhook, order_id field, test connection, fetch sample shipment
3. Status message mapping — table: internal code (confirmed / shipped / out_for_delivery / delivered / failed / returned / …) | customer message | enabled | escalation flag
4. Satisfaction & handoff — satisfaction-check toggle, keywords/sentiment for unsatisfied → triggers Refund + owner alert; static flow diagram
5. Triggers — on order status change
6. Human & owner alerts — failed delivery, unsatisfied, API errors

### Test modal
Pick a sample order + status → preview the customer-facing message.

### Owner subset
Customer-facing status messages editor — carrier + API stays admin-only.

---

## 4. Refund Agent

Files:
- Admin: `src/pages/admin/AdminAgentRefund.tsx` → `/admin/agents/refund`
- Owner: `src/pages/owner/automation/OwnerAgentRefund.tsx` → `/automation/refund`

**What it does:** Runs policy rules, auto-approves small/in-window refunds, escalates big or out-of-policy ones to the owner. Always logs decisions.

### Config sections (admin)
1. LLM configuration (callout: stronger model + low temperature)
2. Personality — empathetic / professional / minimal
3. Refund policy — window (days), auto-approve max amount (DZD), proof-required toggle, partial-refund toggle
4. Policy rules (IF/THEN) — condition + value + action (auto-approve / escalate / reject) with live plain-English summary
5. Conversation flow — acknowledge → collect reason → verify → policy check → decision; hold message with `{{owner_response_sla}}`
6. Owner notifications — every-request vs escalations-only, recipients, channels, template, SLA
7. Decision log — table of past decisions

### Test modal
Order value + days since purchase + customer type → shows decision (auto-approve / escalate / reject).

### Owner subset
Customer-facing refund copy + tone. Policy numbers stay admin-only.

---

## Global automation surfaces

### Overview page
- Admin: `/admin/agents` (`AdminAgentsOverview.tsx`) — 4-agent grid, enable toggles, stats, Configure CTA
- Owner: `/automation` (`OwnerAutomationOverview.tsx`) — same grid in the owner voice

### Triggers matrix
`/admin/automation/triggers` (`AdminAutomationTriggers.tsx`) — editable table of event→agent mappings. Rows:
| Event | Agent | Effect |
|-------|-------|--------|
| New lead (any channel) | Lead Follow-Up | Start sequence — step 1 sent |
| Lead replies | Lead Follow-Up | Stop sequence + mark Contacted (configurable) |
| Inbound customer DM | Client Chat | FAQ match / generate reply |
| Order status changes | Order Tracking | Send mapped status message |
| Customer intent: refund | Refund | Open refund flow |
| Low confidence / negative sentiment | Any active agent | Escalation + optional pause |
| Sales taps Take over | — | Pause all automation on that thread |

### Human intervention (global)
`/admin/automation/intervention` — global defaults for escalation reasons, confidence threshold, instant-keywords, notification channels, recipient pool, urgent template, pause-after-escalation, take-over resume policy + cooldown.

### Activity log
`/admin/automation/activity` — filterable log of sequence / escalation / refund / tracking / chat events.

---

## Shared message variables

Templates across agents use:
`{{name}}`, `{{product}}`, `{{company}}`, `{{agent_name}}`, `{{contact_name}}`, `{{channel}}`, `{{conversation_link}}`, `{{escalation_reason}}`, `{{automation_agent}}`, `{{owner_response_sla}}`

---

## Take-over behavior (product rule)

- Tap **Take over** in Inbox or on a contact → `thread.automation_paused = true`, assignee = current user.
- Automation stops for that thread immediately. Agent sees the full history including automation messages.
- On resolved: optional automatic resume with a configurable cooldown (set in Human intervention).

---

## Adding a fifth agent (checklist)

1. Create admin config page under `src/pages/admin/AdminAgent<Name>.tsx` using `AgentConfigShell` + `LLMConfigSection` + `AgentStatusPanel`. Define `SECTIONS`, personality, domain-specific sections, triggers, escalations, metrics, Test modal.
2. Create owner copy under `src/pages/owner/automation/OwnerAgent<Name>.tsx` (subset, no LLM).
3. Register both routes in `src/App.tsx`.
4. Add entries in the Sidebar (`src/components/layout/Sidebar.tsx`) under `Automation`, for both `admin` and `owner` roles.
5. Add the card on `AdminAgentsOverview` and `OwnerAutomationOverview`.
6. Add a row in `AdminAutomationTriggers`.
7. Document it here and in `PAGES.md` + `FEATURES.md`.
