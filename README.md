# FlowShield

FlowShield is Samuel Ngabonziza's multi-page portfolio and publishing site. It uses Vite, React, Tailwind CSS, Lucide React, Three.js, and Firebase Authentication/Firestore.

## Local development

```sh
npm install
npm start
```

`npm start` launches Vite and opens the site at `http://localhost:5173/`. Use this instead of VS Code Live Server: Live Server does not compile the React JSX and Tailwind source used by these pages. If you prefer to open the browser yourself, run `npm run dev` and visit the URL Vite prints.

Create a production build with `npm run build`; preview it with `npm run preview`. Vercel is configured to build to `dist/`.

## Pages

- `index.html` — Home and the animated Earth with its purple 3D rings
- `about.html` — About Samuel
- `projects.html` — Selected projects and Firebase project posts
- `services.html` — Services
- `posts.html` — Photos, video, notes, comments, likes, and sharing
- `contact.html` — Contact details
- `auth.html` — Firebase email/password sign-in and registration
- `admin.html` — Firebase publishing studio

## Content

Edit project and service data in `js/script.js`. The publishing studio at `/admin.html` manages posts in Firestore; public posts render in `posts.html` and project posts also appear under Projects. The studio supports direct image selection from a phone or computer and stores images in Firebase Storage.

The Firebase web configuration is in `js/firebase-config.js`. Firebase web config values are public; protect write access with `firestore.rules` and `storage.rules`. Enable Email/Password and Anonymous providers in Firebase Authentication for registration/login and public reactions respectively. To enable photo uploads, create the project's Cloud Storage bucket in the Firebase console and publish the rules from `storage.rules`. Cloud Storage currently requires the Firebase project to use the Blaze pay-as-you-go plan; review its pricing and set a budget alert before enabling it. Uploads are limited to image files up to 12 MiB and the existing admin UID.

## Theme and tokens

The site follows the device's light or dark appearance automatically and updates when the device theme changes. Light and dark hex tokens and responsive/accessibility guidance are documented in [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) and `tailwind.config.js`.

## UI/UX Pro Max skill

The upstream skill's README recommends `npx ui-ux-pro-max-cli init --ai codex`. This repository does not include a first-party MCP server; the skill is installed for Codex separately from the website runtime.
