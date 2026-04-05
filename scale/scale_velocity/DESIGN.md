```markdown
# Design System Specification: Architectural Precision

## 1. Overview & Creative North Star: "The Digital Architect"
This design system moves away from the cluttered, "dashboard-widget" aesthetic of typical SaaS platforms. Our Creative North Star is **The Digital Architect**. We treat the UI as a high-end, bespoke workspace where data is not just displayed, but curated.

To break the "template" look, we utilize **Intentional Asymmetry**. Dashboards should not be perfectly symmetrical grids; instead, use varying column widths and "floating" focal points to guide the eye toward critical AI insights. We favor **Tonal Depth** over structural rigidity—using layers of color rather than lines to define the boundaries of the digital environment.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, authoritative Navy and a vibrant, kinetic Green. However, the sophistication lies in how these colors are layered.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. Structural definition must be achieved through background shifts. For instance, a `surface-container-low` module should sit on a `surface` background to create separation.

### Surface Hierarchy & Nesting
We treat the UI as physical layers of fine material.
- **Base Layer:** `surface` (#f9f9fb) for global backgrounds.
- **Structural Layer:** `secondary_fixed` (#e2e0fc) for persistent sidebars.
- **Module Layer:** `surface_container_lowest` (#ffffff) for primary content cards, creating a "lifted" feel.
- **Nesting:** When a component lives inside a card, use `surface_container` (#eeeef0) to create a recessed, "etched" look.

### The "Glass & Gradient" Rule
To elevate the experience, floating elements (modals, dropdowns) should utilize **Glassmorphism**. Apply `surface` at 80% opacity with a `20px` backdrop blur. For primary CTAs, use a subtle linear gradient from `on_primary_container` (#009670) to `primary_fixed` (#60fcc6) to add a "liquid metal" finish that flat hex codes cannot replicate.

---

## 3. Typography: Editorial Authority
We pair **Plus Jakarta Sans** for high-impact display with **Inter** for utility, creating a hierarchy that feels like a premium financial journal.

*   **Display & Headlines (Plus Jakarta Sans):** Used for "The Big Picture." Wide tracking and bold weights convey stability.
    *   *Display LG:* 3.5rem — For hero metrics and "North Star" sales figures.
*   **Titles & Body (Inter):** Used for actionable data. Inter’s tall x-height ensures legibility in dense data environments.
    *   *Title MD:* 1.125rem — For section headers within cards.
    *   *Body MD:* 0.875rem — The standard for all platform copy.
*   **The Data Layer (DM Mono):** For IDs, currency, and timestamps, switch to a monospaced font to signal technical accuracy. Use `label-md` (0.75rem) for these elements.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are a fallback, not a primary tool. Hierarchy is achieved through the **Layering Principle**.

*   **Ambient Shadows:** When a card must "float" (e.g., a dragged lead or a high-priority alert), use a shadow with a `40px` blur and `4%` opacity, tinted with `on_secondary_fixed_variant` (#45455b). This mimics natural light rather than digital "glow."
*   **The "Ghost Border":** If a boundary is required for accessibility, use the `outline_variant` (#c8c5cd) at **15% opacity**. High-contrast borders are strictly forbidden.
*   **Dynamic Glass:** Use semi-transparent layers for the sidebar. As the user scrolls, the background colors should bleed through slightly, ensuring the UI feels integrated and lightweight.

---

## 5. Components
All components follow the `DEFAULT` (0.5rem / 8px) or `lg` (1rem / 16px) corner radius to maintain a "soft-tech" feel.

*   **Primary Buttons:** Use the signature gradient (Green transition). Padding: `12px 24px`. State changes should be a subtle shift in saturation, not a darkening of the color.
*   **Cards & Lists:** **Forbid the use of divider lines.** Separate list items using `8px` of vertical white space or a hover state that shifts the background to `surface_container_low`.
*   **AI Insight Chips:** Use `primary_container` (#002116) with `primary_fixed_dim` (#3adfab) text. These should feel like "jewels" within the UI.
*   **Input Fields:** Ghost-styled. No bottom line or full border. Use a subtle `surface_container_high` (#e8e8ea) background fill that transitions to `surface_container_lowest` (#ffffff) on focus.
*   **Role-Based Accents:** 
    *   *Admin:* Use `secondary` (#5d5c74) indicators.
    *   *Owner:* Use `on_primary_container` (#009670) indicators.
    *   *Agent:* Use `on_tertiary_container` (#0088e2) indicators.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use extreme white space. If a section feels "full," add 16px of padding.
*   **Do** use `DM Mono` for any number that can change (leads, revenue, percentages).
*   **Do** stack surfaces (White card on Grey background) to show hierarchy.

### Don’t:
*   **Don't** use `#000000` for shadows. Use a tinted navy-grey.
*   **Don't** use 1px lines to separate sidebar items. Use "active state" background shapes.
*   **Don't** use standard "Success Green." Only use the specified Primary Green (`#00C896`) or its functional tokens to maintain brand soul.
*   **Don't** cram data. Use "Editorial Flow"—larger headings and more breathing room for the most important KPIs.```