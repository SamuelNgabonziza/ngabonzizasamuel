# FlowShield design system

## Direction

An editorial maker portfolio: expressive Cormorant Garamond headlines, calm DM Sans reading text, generous space, and a vivid but curated mix of violet, cyan, rose, amber, mint, and blue. The satellite-textured Earth and its three broad, colorful orbit rings remain the signature hero artwork. The hero stays transparent; the lower “Universe of Ideas” callout carries the page’s atmospheric backdrop.

## Color tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| Primary | `#6D28D9` | `#C4B5FD` | Main actions, active navigation, emphasis |
| Secondary | `#EDE9FE` | `#2D2540` | Chips, selected states, soft panels |
| Accent | `#E4572E` | `#FDA58A` | Small highlights and focus accents |
| Background | `#F6F4EF` | `#111018` | Page canvas |
| Surface | `#FFFFFF` | `#1B1823` | Cards, inputs, elevated sections |
| Text | `#201A2C` | `#F7F4FB` | Body and headings |
| Muted text | `#655F70` | `#BEB7C9` | Supporting copy |
| Border | `#E5E0E9` | `#3B3548` | Dividers and control outlines |
| Cyan | `#0891B2` | `#67E8F9` | Rings, links, and cool highlights |
| Rose | `#DB2777` | `#F9A8D4` | Decorative highlights and chips |
| Gold | `#B45309` | `#FCD34D` | Warm highlights and badges |
| Mint | `#047857` | `#6EE7B7` | Secondary badges and focus chips |
| Sky | `#2563EB` | `#93C5FD` | Secondary badges and focus chips |

The exact colors are in `tailwind.config.js`; the page uses Tailwind's `dark:` variants and a persistent theme toggle. Coral is a highlight color; keep small text on the background or surface token for readable contrast.

```js
// tailwind.config.js (theme excerpt)
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          background: '#F6F4EF', surface: '#FFFFFF', primary: '#6D28D9',
          secondary: '#EDE9FE', accent: '#E4572E', cyan: '#0891B2',
          rose: '#DB2777', gold: '#B45309', mint: '#047857', sky: '#2563EB',
          text: '#201A2C', muted: '#655F70', border: '#E5E0E9'
        },
        dark: {
          background: '#111018', surface: '#1B1823', primary: '#C4B5FD',
          secondary: '#2D2540', accent: '#FDA58A', cyan: '#67E8F9',
          rose: '#F9A8D4', gold: '#FCD34D', mint: '#6EE7B7', sky: '#93C5FD',
          text: '#F7F4FB', muted: '#BEB7C9', border: '#3B3548'
        }
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif']
      }
    }
  }
};
```

## Page patterns

- **Home:** editorial hero beside the retained 3D Earth and rotating colored rings; responsive Home/About/Contact links in a row; project, services, and notes paths; community statement; signup and login in navigation.
- **About:** personal story, focus areas, and a short closing thought.
- **Projects:** local portfolio projects plus live Firebase-published projects.
- **Services:** three responsive service cards linked to Contact.
- **Notes & photos:** Firebase posts, media, reactions, comments, and sharing controls.
- **Contact:** direct email CTA and existing GitHub/LinkedIn destinations.
- **Auth:** Firebase email/password login and registration.
- **Admin studio:** retained publishing tools with the same light/dark preference.

## Accessibility and responsive review

- Every page has a semantic main landmark, a skip link, a single page-level heading, labeled form controls, visible keyboard focus, and navigation state through `aria-current`.
- The mobile navigation exposes `aria-expanded` and an accessible label. Theme toggle labels announce the destination theme. Social links use accessible names; decorative icon SVGs are hidden from assistive technology.
- Reduced-motion preferences disable CSS motion and render the Three.js scene as a static frame. The Earth texture remains as a static fallback if WebGL is unavailable.
- Content grids collapse at narrow widths; headings use `clamp`, cards wrap, URLs can break, and navigation and icon controls meet 44px touch-target sizing. The site uses a centered `max-w-7xl` content grid and consistent horizontal padding.
- Preserve a 4.5:1 contrast target for body text. Accent color is not used alone to convey state. Test the finished UI at 375, 768, 1024, and 1440 px, with keyboard-only navigation, 200% zoom, and both theme settings before launch.

## Build and deployment

Tailwind is compiled by Vite. Use `npm run dev` locally and `npm run build` for Vercel; Vercel publishes `dist/`. Keep static page URLs (`about.html`, `projects.html`, and the rest) so existing links continue to resolve.
