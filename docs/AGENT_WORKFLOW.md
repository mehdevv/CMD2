# Scale CRM — Agent workflow (lead to close)

Aligned with **Scale_Agent_Workflow.docx**.

**Legend:** ☐ = you do this · 🤖 = automation / assistant does this

**Account:** `karim@demo.scale` / `ScaleDemo2026!`  
**Demo data:** Browser `localStorage` (`scale_demo_crm_v3`). Use incognito or clear site data for a fresh seed.

---

## The 4 automation agents — different customer per agent

On the **agent dashboard**, open the four colored cards under *“See the 4 automation agents on real customers”*, or use **Inbox** and pick any thread (each row shows which agent is active).

| Agent | Example contact | Conversation |
|-------|-----------------|--------------|
| **Lead Follow-Up** (blue) | Mohamed Benali | Outbound welcome + follow-up on bulk pricing |
| **Client Chat** (purple) | Nadia Hamdi | FAQ: support hours, Oran delivery, returns |
| **Order Tracking** (green) | Mourad Terki | Order #CMD-8842 — in transit → out for delivery |
| **Refund** (amber) | Sofiane Meziane | Damaged item → photo → auto-approved 2 400 DZD |

Also try: **Fatima Aït** (chat then human handoff), **Zineb Cherif** (follow-up), **Bilal Hadjadj** (tracking). AI bubbles use each agent’s brand color; **Automation log** on the contact shows the right event types.

---

## 1 — Sign in → `/dashboard`

| | Action |
|---|--------|
| ☐ | Go to Scale CRM and sign in as **karim@demo.scale** / **ScaleDemo2026!** |
| ☐ | Check KPIs: **My active leads** · **Follow-ups today** · **Messages to review** |
| ☐ | Check **Needs attention** — any escalated leads? (e.g. Sofiane Meziane) |
| ☐ | Check **My opportunities** — open deals already in pipeline |

**Say:** *"Karim only sees his book of business — leads, inbox, and deals assigned to him."*

---

## 2 — Add a new lead → `/leads`

| | Action |
|---|--------|
| ☐ | Click **Add lead** |
| ☐ | Fill: name, phone, channel = **WhatsApp** → **Create lead** |
| ☐ | App opens **contact detail** automatically (card also appears in **New** column) |
| 🤖 | **Lead Follow-Up** sends welcome message automatically |
| 🤖 | **Follow-up log** shows Step 1 delivered + Step 2 scheduled in 2h |

**Say:** *"As soon as the lead lands, the AI starts the sequence — no manual copy-paste."*

---

## 3 — Enrich & qualify → `/leads/:id`

| | Action |
|---|--------|
| ☐ | Click **Re-enrich with assistant** (right panel) |
| 🤖 | Company + pain points fill in automatically (~1 sec) |
| ☐ | Edit tags or fields if needed → auto-saved |
| ☐ | Advance stage: **New → Contacted → Qualified** (header dropdown) |
| ☐ | Check **Follow-up log** and **History** — enrichment + stage changes logged |

**Note:** Optional — type a reply in the thread → **Take over** pauses automation on this thread. **Release to automation** resumes the sequence.

---

## 4 — Convert to opportunity → `/leads/:id` → `/opportunities/:id`

| | Action |
|---|--------|
| ☐ | Click **Convert to opportunity** (enabled when stage = **Qualified**) |
| ☐ | Fill: deal name, value (DZD), close date → **Create opportunity** |
| 🤖 | Logs *Converted to opportunity* in history with Karim as owner |
| ☐ | Redirected to opportunity detail — verify **Owner: You (assigned owner)** |

---

## 5 — Work the pipeline → `/opportunities/:id` + `/opportunities/board`

| | Action |
|---|--------|
| ☐ | Use stage stepper or **Advance stage…**: Qualification → Need analysis → Proposal → Closing |
| ☐ | Open **Qualification** tab — fill BANT → **Save & move to Need analysis** |
| ☐ | Go to **Board** — drag card to next column → confirm |

**Say:** *"Same pipeline as the owner — agent owns deals with matching ownerId."*

**Seeded shortcut:** Open **opp-4** (Aït Commerce — negotiation) from **My opportunities** without adding a lead.

---

## 6 — Close — Mark Won → `/opportunities/:id`

| | Action |
|---|--------|
| ☐ | Click **Mark Won** on opportunity detail |
| ☐ | Fill win dialog → **Confirm won** |
| ☐ | Go to **Board** — card is in **Won** column ✓ |
| 🤖 | History on linked lead logs *Deal marked Won* |

**Say:** *"Done. Lead captured, AI followed up, qualified, converted, and closed."*

---

## 7 — Inbox check (anytime) → `/inbox`

| | Action |
|---|--------|
| ☐ | Only **Karim's** threads appear — not the whole org |
| ☐ | Open any thread — same view as contact detail |
| ☐ | **Take over** to pause AI and reply manually |
| 🤖 | **Release to automation** resumes Lead Follow-Up (toast + activity log) |

---

## 8 — Post-meeting notes → `/meetings/brief/:id` → `/meetings/notes/:id`

| | Action |
|---|--------|
| ☐ | Open **Generate brief** from contact or opportunity |
| ☐ | After call: **Record post-meeting note** → type notes |
| ☐ | Click **Generate summary** |
| 🤖 | Banner: *Follow-up scheduled by automation — next touch in 24 hours* |

---

## 5-minute highlight reel

1. Login **Karim** → dashboard  
2. **Add lead** → contact detail → automation + follow-up log  
3. **Re-enrich** → stage **Qualified** → **Convert**  
4. **Qualification** → **Mark Won**  
5. **Inbox** → takeover / release  

---

## Checklist — pipeline works for agent

- [ ] Dashboard KPIs and follow-up table populated  
- [ ] Add lead → auto-navigate to contact + 2 sequence log lines  
- [ ] Stage changes appear in History  
- [ ] Convert shows owner badge on opportunity  
- [ ] Board drag + Mark Won updates columns  
- [ ] Inbox scoped; takeover/release toasts  
- [ ] Meeting notes green banner after summary  

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Empty opportunities | Clear site data / incognito (migration remaps `ownerId` on load) |
| Can't convert | Set lead stage to **Qualified** first |
| Negotiation blocked | Send a proposal first (seeded opps already past this) |
Remove `scale_demo_crm_v1` / `v2` in Application → Local Storage if threads still look identical

---

## Related

- Platform demo (owner/admin): [`PROTOTYPE_DEMO_WORKFLOW.md`](./PROTOTYPE_DEMO_WORKFLOW.md)
