# Design System Specification: The Digital Architect

## 1. Overview & Creative North Star
The "Creative North Star" for this design system is **The Digital Architect**. It is a visual philosophy that treats digital interface design with the same reverence as high-end structural engineering: clean lines, intentional voids, and a sophisticated interplay of light and material.

Unlike standard templates that rely on borders to separate content, this system utilizes **Tonal Depth** and **Editorial Asymmetry**. We move away from the "boxy" web by using expansive white space, overlapping typographical elements, and a rigid adherence to mathematical precision. The goal is to evoke a sense of professional authority and quiet confidence through premium, layered surfaces.

---

## 2. Color Theory & Surface Strategy
Our palette is rooted in the deep authority of `#164078` (Primary) and the technical sophistication of the teal spectrum.

### The Palette
*   **Primary:** `#164078` (The Foundation)
*   **Secondary:** `#1D6779` (The Structure)
*   **Tertiary:** `#22888D` (The Accent)
*   **Neutral/Surface:** `#FEF8FA` to `#161416` (The Void)

### The "No-Line" Rule
To maintain a high-end editorial feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined through:
1.  **Background Shifts:** Transitioning from `surface` to `surface-container-low`.
2.  **Intentional Negative Space:** Large gutters (using the Spacing Scale) that naturally group content.
3.  **Tonal Transitions:** Using subtle gradients between `primary` and `primary-container` to create a sense of light direction.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
*   **Base Layer:** `surface` (#FEF8FA)
*   **Embedded Containers:** Use `surface-container-low` to "recess" sections.
*   **Elevated Components:** Use `surface-container-lowest` (#FFFFFF) for cards sitting on top of `surface-container` to create a soft, natural lift.

### The "Glass & Gradient" Rule
For floating navigational elements or premium overlays, use **Glassmorphism**. Combine a semi-transparent `surface` color with a `backdrop-blur` (12px–20px). This ensures the UI feels integrated with the content beneath it, rather than a flat sticker on a page.

---

## 3. Typography: The Editorial Voice
We use **Plus Jakarta Sans** exclusively. It is a font that balances geometric precision with a modern, approachable warmth.

*   **Display (lg/md/sm):** These are your "Architectural Statements." Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero headlines. Do not fear letting display text overlap slightly with background elements or image containers to create depth.
*   **Headlines & Titles:** Used for clear wayfinding. `headline-lg` (2rem) should always be paired with generous top-margin to let the section "breathe."
*   **Body (lg/md/sm):** Our "Technical Specifications." Use `body-lg` (1rem) for primary reading. Ensure line-height is set to 1.6 for maximum readability and a premium "open" feel.
*   **Labels:** Use `label-md` (0.75rem) in All Caps with +0.05em tracking for secondary metadata or small navigational elements.

---

## 4. Elevation & Depth
In "The Digital Architect" style, depth is felt, not seen. We avoid heavy dropshadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Stacking tiers (e.g., a `surface-container-lowest` card on a `surface-container-high` background) creates hierarchy without visual clutter.
*   **Ambient Shadows:** For high-elevation elements (modals, floating menus), use an ultra-diffused shadow: `0px 20px 40px rgba(22, 20, 22, 0.04)`. The color is a tinted version of `on-surface`, ensuring the shadow feels like a natural obstruction of light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token at **15% opacity**. This creates a "suggestion" of a boundary rather than a hard line.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` (#002A59) with `on-primary` (#FFFFFF) text. Use `roundness.md` (0.375rem).
*   **Secondary:** `surface-container-high` background with `primary` text. No border.
*   **Tertiary:** Text-only with a subtle `primary` underline on hover.

### Cards & Lists
*   **Constraint:** Zero dividers. Use a vertical spacing shift of at least `24px` to separate list items.
*   **Interactive Cards:** Use a subtle background color shift (e.g., from `surface` to `surface-container-low`) on hover rather than a shadow "pop."

### Input Fields
*   **Style:** Minimalist. A bottom-only "Ghost Border" (1px at 20% opacity) that transforms into a `primary` color 2px underline on focus.
*   **Background:** High-end fields should use a subtle `surface-container-low` fill to differentiate from the base page.

### Architectural Accents (Additional Components)
*   **The Progress Bar:** Instead of a standard thick bar, use a 2px "Filament" line in `tertiary` (#22888D) for a precision-tool aesthetic.
*   **Editorial Spacers:** Intentional large-scale typographic quotes or "empty" containers that serve only to provide visual rhythm.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** embrace asymmetry. Place a headline on the left and a small detail label far to the right to create a sophisticated balance.
*   **Do** use `primary-container` (#164078) for high-contrast "Dark Mode" sections within a light-themed page to create a bold impact.
*   **Do** treat white space as a first-class design element, not "empty" space.

### Don’t:
*   **Don’t** use 100% opaque black for text. Always use `on-surface` (#1D1B1D) to maintain tonal softness.
*   **Don’t** use default shadows. If the shadow is noticeable at first glance, it is too heavy.
*   **Don’t** use traditional grid lines. If you feel the need to draw a line, try using a background color tint instead.
*   **Don’t** crowd components. "The Digital Architect" requires room to stand tall.