# FlowShield

A multi-page personal website — Home, About, Projects, Services, Contact, Roadmap.

## Open it in VS Code
1. Open this folder in VS Code (`File > Open Folder...`).
2. Install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.

## Structure
```
ngabonzizasamuel/
├── index.html      ← Home
├── about.html      ← About
├── projects.html   ← Projects (renders from js/script.js)
├── services.html   ← Services (renders from js/script.js)
├── contact.html    ← Contact
├── roadmap.html    ← Roadmap
├── favicon.svg     ← site icon
├── css/style.css   ← all styling, shared across every page
├── js/script.js    ← project & service data — EDIT THIS to add new work
└── README.md
```

## Adding a project or service
1. Open `js/script.js`.
2. Add a new object to the `projects` or `services` array (examples already there).
3. It shows up automatically on `projects.html` / `services.html` — no HTML editing needed.
4. Commit and push so the live site updates.

## Adding a whole new page
1. Copy `about.html` as a starting template, rename it.
2. Update the `<title>`, meta description, `<h1>`, and content.
3. Add a link in the `.nav-links` block on every page (so people can navigate to it).

## Deploy to GitHub Pages (recommended)
1. Create a GitHub repo named exactly `SamuelNgabonziza.github.io` (this special name deploys it to the root, e.g. `https://SamuelNgabonziza.github.io`).
2. From inside this folder:
   ```
   git add .
   git commit -m "Update site"
   git push
   ```
3. In the repo's **Settings → Pages** — it's usually enabled automatically for this repo name, deploying from `main`.
4. Your site is live within a minute or two.

Every time you edit locally and want the live site updated, just run:
```
git add .
git commit -m "describe what changed"
git push
```

## Firebase content studio
The admin page is available at `/admin.html`. It uses Firebase Authentication for admin sign-in and Cloud Firestore for posts, per-post likes/comments/share controls, and visitor reactions. Images and videos use public URLs, so a Firebase Storage bucket is not needed. Vercel continues to host the static website.

Before publishing:
1. Create a Firebase project, register a Web app, and enable Email/Password and Anonymous sign-in in Authentication. Add your Vercel domain under Authentication's authorized domains.
2. Create a Firestore database in Production mode.
3. Copy the Web app config into `js/firebase-config.js`.
4. Create your admin account in Firebase Authentication and copy its UID.
5. Replace the admin UID in `firestore.rules` with your UID, then publish the rules in Firebase Console.
6. Add a public image URL when publishing a photo or project, or choose Video and add a YouTube URL or direct `.mp4`, `.webm`, or `.ogg` video URL. The link must be public and use HTTPS.
7. Add `admin.html`, `posts.html`, and `js/` to Vercel as usual. Use `/admin.html` to sign in; posts will then be shared with every visitor.
8. Enable Anonymous sign-in so visitors can like/comment without making an account. Publish the updated Firestore rules. In the admin form, choose whether the post is public and which interactions are enabled. Use **Edit** later to change settings; **Delete** removes the post, likes, and comments.

The Firebase web config is expected to be present in the browser. Keep access restricted through Firebase Security Rules; do not use open write rules. Firebase client writes are denied until the rules contain your admin UID.
