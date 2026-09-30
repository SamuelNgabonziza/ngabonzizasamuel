# SamuelWebsite

A multi-page personal website — Home, About, Projects, Services, Contact.

## Open it in VS Code
1. Unzip this folder.
2. VS Code → File > Open Folder... → select `SamuelWebsite`.
3. Install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.

## Structure
```
SamuelWebsite/
├── index.html      ← Home
├── about.html
├── projects.html
├── services.html
├── contact.html
├── css/style.css   ← all styling, shared across every page
├── js/script.js    ← project & service data — EDIT THIS to add new work
└── README.md
```

## Adding a project or service
Open `js/script.js`, add a new object to the `projects` or `services` array (examples already in there). It shows up automatically on `projects.html` / `services.html` — no HTML editing needed.

## Adding a whole new page
Copy `about.html` as a starting template, rename it, change the `<h1>` and content, then add a link to it in the `.nav-links` block on every page (so people can navigate to it).

## Deploy as your personal domain (recommended)
1. Create a GitHub repo named exactly `SamuelNgabonziza.github.io` (this special name makes GitHub serve it at the root, e.g. `https://SamuelNgabonziza.github.io` — no extra path).
2. In VS Code's terminal, from inside this folder:
   ```
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/SamuelNgabonziza/SamuelNgabonziza.github.io.git
   git push -u origin main
   ```
3. Go to the repo's Settings → Pages — it's usually enabled automatically for this repo name, deploying from `main`.
4. Live within a minute or two.

Every time you edit locally and want the live site updated, just run:
```
git add .
git commit -m "describe what changed"
git push
```
