# Scale CRM — Automation Agents & Engine (Replit Implementation Prompt)

**Version:** 1.0  
**Target:** `replit-agent` (full-stack: UI + API shapes + persistence plan)  
**Scope:** Implement **dedicated configuration areas** in the CRM for **each of the four automation agents**, plus a **shared Automation Engine** surface (triggers, sequences, human intervention, notifications). Each agent must expose **LLM settings**, **personality / system prompt**, **operational parameters**, **integrations (API keys)**, and **trigger/escalation rules** appropriate to that agent.

**Design system (mandatory):** Inherit existing Scale rules: Inter font, text `#1A1A3E`, accent `#2B62E8`, borders `1px solid #E4E4E8`, cards white on `#F7F7F8`, radius max `8px`, font-weight max `600`, **no gradients, no glows, no heavy shadows**. In **user-facing copy**, avoid the word “AI”; use **automation**, **agent**, or the agent’s name.

---

## 1. Product summary (behavioral contract)

### 1.1 The four agents (always-on)

| # | Agent | Channels | Job |
|---|--------|----------|-----|
| 01 | **Lead Follow-Up** | WhatsApp, Instagram, Facebook | Contacts new leads automatically; runs a **sequence** until reply or end; **stops on first reply**; can **assign** lead to sales agent. |
| 02 | **Client Chat** | All channels | Answers questions using **FAQ** + LLM; escalates on unknown topic / negative sentiment / low confidence. |
| 03 | **Order Tracking** | WhatsApp, Facebook (adjust if product says otherwise) | Reads **delivery carrier / agency** data; sends **proactive status messages**; handles follow-up replies; on **dissatisfaction** hands off to **Refund** + **owner** notifications. |
| 04 | **Refund** | All channels | Runs **policy rules** (window, limits, proof); **auto-approve** or **escalate**; logs decisions; **large / policy violations** always human. |

**Sales agents:** Can **take over** any automation-managed thread with **one action**; automation **pauses** for that conversation until released per rules.

**Admin:** Configures sequences, FAQ, rules, carrier integration, LLM keys, triggers, escalation and notification templates **once** (per environment/tenant as your data model requires).

---

## 2. Information architecture (where it lives in the CRM)

### 2.1 Required top-level navigation

Under **Automation** or **AI Agents** (pick one label; not “AI” in user-facing nav if you follow the copy rule — e.g. **“Automation”**):

1. **Overview** — Dashboard for all four agents (status toggles, KPIs, last edited, links to configure).
2. **Lead Follow-Up** — Dedicated full page (not a single collapsed accordion).
3. **Client Chat** — Dedicated full page.
4. **Order Tracking** — Dedicated full page.
5. **Refund** — Dedicated full page.
6. **Triggers & automations** — Cross-agent trigger matrix + global escalation defaults (see §6).
7. **Human intervention** — Notification rules, urgency, recipients, keywords, confidence thresholds, takeover behavior.
8. **Activity log** — Automation events, escalations, refund decisions, sequence stops (filterable).

**Layout pattern (desktop) for each agent page:** **3 columns** — **left:** section anchor nav (sticky, ~200px); **center:** scrollable config (~max 720px); **right:** **status panel** (sticky, ~240px): enable/disable, key live stats, last triggered, **Test** button.

---

## 3. Shared building blocks (reuse on every agent page)

Implement these **once**, compose per agent:

### 3.1 LLM configuration block

- Provider select: OpenAI, Anthropic, Google Gemini, Custom (OpenAI-compatible).
- API key: password field, **Test connection** (mock ok for MVP if no key), never show full key after save.
- Model: preset list + **custom** text.
- Temperature / “creativity” slider `0–1`, step `0.1`.
- Max tokens / max message length (number).
- **Per-agent storage** of credentials (namespace by `agentId`).

**Refund agent note in UI:** Recommend stronger model + lower temperature; show short info callout.

### 3.2 Personality & instructions

- **System prompt** (large textarea, character counter).
- **Agent display name** + optional **avatar initial**.
- **Tone** (radio cards): professional, friendly, direct, custom (+ optional extra fields for custom).
- **Primary language** (select) + optional **auto-detect** toggle where relevant (chat).
- **Mood / adaptation** (chat): e.g. mirror customer energy (toggle) with help text.
- **Business context** textarea (injected into context).
- **Forbidden topics** (tag input): if customer mentions → **escalate** (configurable).

### 3.3 Triggers (agent-specific subset)

- Checkbox / multi-select lists with **conditional sub-fields** (e.g. threshold, minutes idle, keyword list).
- Save as structured JSON in DB.

### 3.4 Human intervention & notifications

- **Escalation reasons** (multi-select): low confidence, negative sentiment, keyword, outside FAQ, explicit human request, max automation messages without reply, etc.
- **Keyword list** for instant escalation (tag input).
- **Confidence threshold** slider `0–1` (where applicable).
- **Notify:** in-app (bell), email, WhatsApp to agent — multi-select.
- **Recipients:** multi-select users / roles (sales agent assigned, pool, owner).
- **Message templates** with variables: `{{contact_name}}`, `{{channel}}`, `{{conversation_link}}`, `{{agent_name}}`, `{{escalation_reason}}`, `{{automation_agent}}`.
- **Urgent** styling for in-app notification (red vs normal blue per design tokens).
- **Pause automation after escalation** (toggle): when on, no further automated messages on that thread until resolved or manually resumed.

### 3.5 “Test” experience (per agent)

- **Follow-Up:** modal — fake lead name, channel, opening message → show **timeline** of sequence steps with delays and **rendered** message text; indicate **stop conditions** (e.g. would stop if lead replied after step 2).
- **Chat:** modal — chat simulator; show **internal confidence** per reply (not sent to customer).
- **Tracking:** modal — pick sample order + status transition → preview customer message; optional sample “dissatisfied” reply path.
- **Refund:** modal — enter order value, days since purchase, customer type → show **decision**: auto-approve / escalate + reason string.

If API key missing: block test with clear message: **Configure API key to run live tests** (mock path optional for MVP).

### 3.6 Audit & metrics

- Each save shows inline **“Changes saved”** (subtle, no toast spam).
- **Metrics strip** on overview + right panel placeholders tied to analytics API later; for MVP use realistic mock series.

---

## 4. Agent 01 — Lead Follow-Up (full section list)

Implement **all** subsections below as anchored sections on the dedicated page.

1. **LLM configuration** — §3.1 (no chat-only extras unless you want max response time here too — optional).
2. **Agent personality** — name, tone, language, system prompt, forbidden topics, business context.
3. **Follow-up sequence builder**
   - Vertical **timeline** of steps; **drag handle** reorder; add/remove step.
   - Per step:
     - **Delay:** number + unit (minutes / hours / days); step 1 may be `0` immediate.
     - **Message type:** fixed template | automation-generated | hybrid (template + personalized closing).
     - **Template picker** (if template/hybrid) — channel compatibility hints.
     - **Instruction textarea** (if generated/hybrid).
     - **Channels** this step may use (WhatsApp / Instagram / Facebook) with validation (e.g. WA first message template rule — info callout).
     - **Send window:** optional time-of-day range (e.g. 08:00–21:00).
     - **Stop conditions** (checkboxes): stop on any reply; stop if stage changes; stop if human assigned; etc.
   - **Global rule callout:** sequence **stops as soon as the lead replies** (default on, explain in UI).
4. **Assignment rules**
   - How to pick sales agent: round-robin, by channel, by territory/tag, or default pool (MVP: select strategy + mock users).
5. **Triggers**
   - Start sequence on: new lead (any channel / per channel), stage change, manual, tag added, etc.
6. **Human intervention** — §3.4 subset relevant to follow-up.
7. **Tracked metrics** (display cards + chart hooks)
   - Sequence completion rate  
   - Reply rate **per step**  
   - Avg time to first response  

---

## 5. Agent 02 — Client Chat (full section list)

1. **LLM configuration** — §3.1 **plus**:
   - **Max response time** (seconds) before sending **holding message**.
   - **Holding message** text.
2. **Personality & mood** — §3.2 **plus**:
   - Emoji usage level (select).
   - Opening message (first automation message in thread).
3. **Knowledge base (FAQ)**
   - List of Q/A pairs; add/remove; optional **category** tags.
   - Toggle: **Fallback to LLM** if no FAQ match (on/off).
   - Optional: **import/export** JSON (stretch).
4. **Response rules**
   - Max consecutive automation messages without customer reply → escalate.
   - After-hours behavior: 24/7 | outside hours message | disable (with schedule).
5. **Qualification (optional)**
   - Toggle auto-qualify; textarea for qualifying questions; tie to lead stage updates (mock OK).
6. **Triggers**
   - When chat agent runs: new inbound message, only unassigned threads, channel filters, etc.
7. **Human intervention** — full §3.4 chat-specific triggers (sentiment, keywords, confidence, attachment received, refund mention, order number mention, idle timeout).
8. **Tracked metrics**
   - Questions answered by automation (vs escalated)  
   - Escalation rate  
   - Avg resolution time  

---

## 6. Agent 03 — Order Tracking (full section list)

1. **LLM configuration** — §3.1 (for interpreting replies / short replies; keep temperature low).
2. **Delivery agency / carrier integration**
   - **API base URL**, **API key** (password + test), auth type (header / query — select).
   - **Polling interval** or webhook URL display (if inbound).
   - **Mapping:** internal `order_id` field in CRM (where order lives).
   - **Test connection** + **Fetch sample shipment** (mock for MVP).
3. **Status → message mapping**
   - Table: internal status code (from carrier or CRM) | **customer message** (editable) | enabled toggle | optional **escalation** flag on row (e.g. failed delivery).
   - Pre-seed rows: confirmed, shipped, out for delivery, delivered, failed/returned, etc.
4. **Triggers**
   - Fire on **order status change** in system (event).
   - Optional: only for orders linked to a contact + channel thread.
5. **Post-update conversation**
   - Toggle: **satisfaction check** after delivery-type messages.
   - Keywords / sentiment for **unsatisfied** → **trigger Refund agent** + **notify owner** (links to Refund page for policy).
   - Small **static diagram** (HTML/CSS): Delivery update → check → reply → branch satisfied / unsatisfied → refund flow (per `scale_agents_prompt.json` note).
6. **Human intervention**
   - Notify owner / assigned sales agent on: failed delivery, unsatisfied customer, API errors (checkboxes + templates).
7. **Tracked metrics**
   - Updates sent  
   - Inbound “where is my order?” volume (should drop — show trend placeholder)  
   - Delivery confirmation rate  

---

## 7. Agent 04 — Refund (full section list)

1. **LLM configuration** — §3.1 with **empathetic tone** options and **low temperature** callout.
2. **Personality** — refund-appropriate tone presets; system prompt emphasizes policy compliance.
3. **Policy parameters**
   - Refund window (days).
   - **Auto-approve** max amount (currency).
   - **Proof of purchase** required (toggle).
   - **Partial refund** allowed (toggle).
4. **Rule builder (IF/THEN)**
   - Rows: condition (e.g. order value, days since purchase, customer refund count) + comparator + value + action (auto-approve / escalate / reject).
   - Live **plain-English summary** under the table.
5. **Conversation flow (outline in UI)**
   - Steps: acknowledge → collect reason → verify order → policy check → decision → confirmation or hold message.
   - **Escalation hold message** template with `{{owner_response_sla}}`.
6. **Owner notifications**
   - Toggle: notify owner on every request vs only escalations.
   - Recipients multi-select; channels; template textarea.
   - **SLA** text for “manager will respond within …”.
7. **Logging**
   - Table or link to **Activity log** filtered to refund decisions: timestamp, contact, decision, reason, amount.
8. **Human intervention**
   - Always escalate above threshold; keyword escalation; repeat refund abusers (stretch).
9. **Tracked metrics**
   - Refunds processed  
   - Auto-approved %  
   - Escalation %  
   - Avg resolution time  

---

## 8. Automation engine (global CRM section)

### 8.1 Event → agent matrix (editable read/write)

Render a **table** (trigger event | primary agent | description | enabled). Minimum rows:

| Trigger event | Agent | Effect |
|---------------|--------|--------|
| New lead (any channel) | Lead Follow-Up | Start sequence — step 1 sent |
| Lead replies to automation message | Lead Follow-Up | Stop sequence; mark **Contacted** (configurable) |
| Inbound customer message | Client Chat | Match FAQ / generate reply |
| Order status changes | Order Tracking | Send mapped status message |
| Customer intent: refund | Refund | Open refund flow |
| Low confidence / negative sentiment | Any active agent | Escalation alert + optional pause |
| Sales taps **Take over** | — | Pause all automation on thread |

**Implementation:** Each row toggles **enabled** and deep-links to the relevant agent section.

### 8.2 Message sequences (global explainer + deep link)

- Explain **variables:** `{{name}}`, `{{product}}`, `{{company}}`, `{{agent_name}}`, etc.
- Link to **Lead Follow-Up → Sequence builder**.

### 8.3 Human takeover (product rules in UI)

- Document in **Human intervention** page:
  - Automation **stops immediately** for that contact/thread.
  - Agent sees **full history** including automation messages.
  - On **resolved**, optional **resume** follow-up (toggle + cooldown settings — MVP: toggle only).

**Inbox / Contact detail:** **Take over** button must call API to set `thread.automation_paused = true` and assign actor.

---

## 9. Data & API (minimum backend expectations)

- **Tenant / org scoping:** All configs keyed by `organization_id` (or equivalent).
- **Entities:** `AgentConfig` (per org, per agent id), `AutomationTrigger`, `SequenceDefinition`, `RefundPolicy`, `CarrierIntegration`, `NotificationRule`, `AutomationEventLog`, `ConversationThread` (with `automation_paused`, `assigned_user_id`).
- **Secrets:** API keys encrypted at rest; never return full secret in GET (masked).
- **Events:** Emit internal events for `lead.created`, `message.inbound`, `order.status_changed`, `refund.requested`, `escalation.created` for the engine.

---

## 10. Acceptance criteria (Replit must satisfy)

1. **Four separate routes/pages** under the CRM app for the four agents, each with **all sections** listed in §4–§7, using the **3-column layout**.
2. **Shared** LLM + personality + escalation components reused; no duplicated divergent styles.
3. **Lead Follow-Up** includes a **visual sequence timeline** with drag reorder and per-step delays and message modes.
4. **Client Chat** includes **FAQ manager** + fallback toggle + mood/opening message + after-hours behavior.
5. **Order Tracking** includes **carrier API** section + **status mapping table** + dissatisfaction → **Refund + owner** path configuration.
6. **Refund** includes **policy numbers**, **rule builder** with live summary, **owner notification** blocks, **decision log** surface.
7. **Global** pages: **Triggers & automations** matrix, **Human intervention**, **Activity log**.
8. **Take over** represented in UI and API contract on conversation/thread.
9. **Tests** modals per agent (mock allowed if no key).
10. Copy avoids labeling user-visible features as “AI” where possible.

---

## 11. Optional stretch goals

- Per-channel template library with approval states.
- Version history for agent configs (diff + rollback).
- Shadow mode: run automation suggestions without sending until approved.
- Real LLM calls in test modals when key present.

---

**End of prompt — hand this document to Replit as the single source of truth for automation agent CRM sections and behaviors.**
