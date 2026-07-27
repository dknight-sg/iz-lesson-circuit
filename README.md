# Circuit Lab — where the volts go

A single interactive page that teaches three ideas from a Cambridge-style
Secondary 2 physics question:

1. Voltage (p.d.) is energy per unit charge — 1 V = 1 J/C.
2. **Series** → same current everywhere, voltages add.
3. **Parallel** → same voltage across branches, currents add.

Anchor case: 12 V battery → 1.0 Ω in series → 1.0 Ω ∥ 2.5 Ω.
Answers: I = 7.0 A, V_series = 7.0 V, V_parallel = 5.0 V, voltmeter = 12 V.

No build step, no framework, no dependencies. Fonts are self-hosted
(`/fonts`), so the page works offline once loaded and makes no third-party
requests.

## What's in it

- A live SVG circuit with animated "charge" dots — brightness shows how much
  energy each scoop is still carrying.
- Sliders for EMF and all three resistors; everything recomputes instantly.
- **Guided walkthrough** — a 5-step tour that dims everything except the
  part being explained. Keyboard arrows move steps; each step is
  deep-linkable, e.g. [`#step-3`](index.html#step-3).
- **Break the circuit** — three switches (series link, top branch, bottom
  branch). Cutting a parallel branch leaves the other one running; cutting
  the series link stops everything, even the branch that was fine.

## Run it locally

No server strictly required — you can just open `index.html` in a browser.
For a proper local server (recommended, avoids `file://` quirks):

```bash
cd circuit-lab
python3 -m http.server 8420
```

Then visit `http://localhost:8420`.

## Deploy it for free (Cloudflare Pages)

1. Push this folder to a new GitHub repo (public or private, both work):
   ```bash
   git remote add origin https://github.com/<you>/circuit-lab.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com), sign in free,
   "Create a project" → "Connect to Git" → pick the repo.
3. Build settings: **no build command, no framework preset**, output
   directory `/` (project root). Click Deploy.
4. You get a free `*.pages.dev` URL immediately. A custom domain can be
   added later under Custom Domains, still free.

GitHub Pages (Settings → Pages → deploy from `main` branch, root) is an
equally free fallback if you'd rather stay inside GitHub.

No analytics, no cookies, no account sign-ups needed to use the page — keep
it that way.

## Editing

- `index.html` — structure and SVG circuit.
- `css/style.css` — design tokens and layout (drafting-paper look, not a
  generic dashboard — see the `:root` variables at the top).
- `js/circuit.js` — physics model, charge animation, guided walkthrough,
  break-the-circuit switches.
- `fonts/` — self-hosted woff2s (Bricolage Grotesque, Space Mono, Spline
  Sans), pulled from Google Fonts once so no CDN request is needed at runtime.

The physics is a closed-form calculation (no general circuit solver, by
design — see the formulas at the top of `js/circuit.js`). Keep it that way;
scope creep here (arbitrary topologies, more components) fights the
teaching goal instead of helping it.
