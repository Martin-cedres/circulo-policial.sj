---
name: web_design
description: A comprehensive guide for designing and implementing high-quality, responsive, and accessible UI components for the Círculo Policial website using Reactstrap and Next.js.
---

# Web Design & UI/UX Guidelines

This skill provides the standards and best practices for all frontend development on the Círculo Policial project. Follow these guidelines to ensure consistency, accessibility, and a premium look and feel.

## 1. Core Principles

-   **Mobile-First**: Design and implement for mobile devices first, then scale up using breakpoints (`sm`, `md`, `lg`, `xl`).
-   **Accessibility (a11y)**: Ensure sufficient color contrast, use semantic HTML tags (`<main>`, `<nav>`, `<article>`), and provide `alt` text for images.
-   **Consistent Branding**: Strickly adhere to the `artiguistaColors` palette defined in `@/styles/colors`.
-   **Fluid Typography**: Use `clamp()` for font sizes to ensure smooth scaling across devices.

## 2. Color Palette Usage

Import colors from `@/styles/colors`:

```typescript
import { artiguistaColors } from '@/styles/colors';
```

| Color Variable | Usage | Hex |
| :--- | :--- | :--- |
| `azul` | Primary Brand Color (Headers, Borders) | `#003366` |
| `rojo` | Accent/Action Color (Buttons, Highlights) | `#ce1126` |
| `blanco` | Backgrounds, Text on Dark | `#FFFFFF` |
| `dorado` | decorative borders, awards | `#C5A059` |
| `negro` | Primary Text | `#1a1a1a` |
| `gris[100-900]` | UI Elements, Secondary Text | varies |

**Do NOT hardcode hex values unless absolutely necessary.**

## 3. Typography & Spacing

### Font Sizes
Use `clamp()` for responsive text sizing:
-   **Headings (H1)**: `fontSize: 'clamp(2rem, 5vw, 3.5rem)'`
-   **Subheadings (H2)**: `fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'`
-   **Body Text**: `fontSize: 'clamp(1rem, 2vw, 1.125rem)'`

### Spacing System (Bootstrap Classes)
-   **Padding/Margin**: Use standard Bootstrap spacers (`p-3`, `my-4`, `gap-3`).
-   **Section Padding**: Standard section padding is `py-5` (desktop) and `py-4` (mobile).

## 4. Component Implementation Pattern

When building new UI components:

1.  **Structure**:
    ```tsx
    export default function ComponentName() {
        return (
            <section className="py-5">
                <Container>
                    <Row className="align-items-center">
                       {/* Content */}
                    </Row>
                </Container>
            </section>
        );
    }
    ```

2.  **Responsiveness**:
    -   Use `Col` sizes: `<Col xs={12} md={6} lg={4}>`
    -   Use utility classes for display: `d-none d-md-block`
    -   Use `order` classes for layout shifts: `order-1 order-md-2`

3.  **Images**:
    -   Always use `next/image`.
    -   Use `fill` + parent container with `position: relative` and explicit height/aspect ratio for responsive images.
    -   Define `sizes` prop to optimize loading.

## 5. Shadow & Depth

Use subtle shadows to create depth, avoiding harsh black shadows.

```typescript
style={{
    boxShadow: '0 4px 6px rgba(0, 51, 102, 0.1)', // Soft blue-tinted shadow
    borderRadius: '8px',
}}
```

## 6. Buttons & Interactions

-   **Primary Button**: Background `color: artiguistaColors.rojo`, Text `white`.
-   **Secondary Button**: Border `color: artiguistaColors.azul`, Text `azul`, Background `transparent`.
-   **Hover Effects**: Add `transform: translateY(-2px)` and slightly darken/lighten background on hover for interactivity.

## 7. Checklist for New Features

Before marking a UI task as done:
-   [ ] Is it fully responsive (tested on 320px, 768px, 1024px+)?
-   [ ] Are touch targets large enough on mobile (min 44px)?
-   [ ] Is the text readable (contrast & size)?
-   [ ] Does it use the official color palette?
-   [ ] are images optimized?
