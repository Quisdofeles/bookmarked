# OBSIDIAN — Camera Brand Site

React + Vite single-page site for the OBSIDIAN premium camera brand. Lives inside the
`bookmarked` monorepo at `portfolio-projects/obsidian`.

## Stack

- React 18 + Vite 5
- Plain CSS Modules per component (`Component.module.css`), no Tailwind, no animation libraries
- Scroll effects via native Intersection/scroll listeners + `requestAnimationFrame`, no scroll libraries

## Structure

```
src/
  main.jsx              entry point, imports styles/global.css
  App.jsx                assembles the page from components/
  components/
    Header.jsx            fixed glassmorphism nav
    Hero.jsx               scroll-scrubbed video + fading text
    Specs.jsx               spec cards grid
    ShotOn.jsx              gallery section
    WhyObsidian.jsx          3-column banner
    Contact.jsx              email signup form
    Footer.jsx               footer links
    *.module.css              one stylesheet per component
  styles/
    global.css              @font-face, CSS vars, resets, .btn/.placeholder utility classes
public/
  fonts/    BasementGrotesque-Black_v1.202.otf, IBMPlexSans-Bold.ttf, IBMPlexSans-Regular.ttf
  video/    Obsidian_Hero_Camera_Transition.mp4 (hero scrub), Obsidian_Specs_Rotation.mp4 (unused, available for later)
  images/   empty — sections use CSS `.placeholder` boxes (#333333) until real photography lands
  CNAME     tableofcontents.page — custom domain for GitHub Pages
```

Images are plain `<div class="placeholder">` boxes, not `<img>` tags, since there are no
real image assets yet. Swap them for real `<img>`/`<picture>` elements as photography comes in —
don't add image-loading logic speculatively.

## How the hero scroll-scrub works

`Hero.jsx` wraps a `120vh` section around a `position: sticky; height: 100vh` stage. The extra
`20vh` is the scroll distance used to scrub the video — the video itself never scrolls, it stays
pinned while the section scrolls underneath it. On every scroll/resize tick (throttled via
`requestAnimationFrame`) it computes `progress` (0–1) from the section's `getBoundingClientRect()`
and viewport height, maps that to `video.currentTime` (0–8s), and switches which of the three
overlay `<p>` blocks is visible (`opacity` transition, 0.3s) based on that current time
(`0–2.5s`, `2.5–6s`, `6–8s`). The video is muted, has no controls, and never autoplays — scrolling
is the only thing that moves the playhead.

If the video length changes, update `VIDEO_DURATION` in `Hero.jsx`.

## Running locally

```
cd portfolio-projects/obsidian
npm install
npm run dev
```

Opens at `http://localhost:5173`. `npm run build` outputs to `dist/` (gitignored);
`npm run preview` serves that build locally.

## Deploying

A GitHub Actions workflow at `.github/workflows/deploy-obsidian.yml` (repo root) builds this
project and deploys it to GitHub Pages whenever `main` changes anything under
`portfolio-projects/obsidian/**`. It publishes `dist/`, which includes `public/CNAME`
(`tableofcontents.page`) so the custom domain carries through automatically.

**One-time setup required in GitHub (not doable from git alone):** in the `bookmarked` repo on
github.com, go to **Settings → Pages** and set **Source** to **GitHub Actions**. After that,
committing and pushing from GitHub Desktop is enough — the workflow builds and deploys
automatically and the live site updates within a couple of minutes. Check the **Actions** tab on
GitHub if a push doesn't show up on the site.

Note: GitHub Pages serves one site per repo. This workflow claims that slot for the `obsidian`
project. If another project under `portfolio-projects/` also needs its own Pages deployment,
it'll need a separate hosting target (e.g. Vercel/Netlify) rather than another GitHub Pages workflow.

## Known non-blocking gaps

- `index.html` references `/images/favicon.ico`, which doesn't exist yet — harmless 404, add a
  real favicon whenever one exists.
- `npm audit` reports a moderate esbuild advisory (GHSA-67mh-4wv8-2f99) — it only affects the
  local dev server accepting cross-origin requests, not production builds. Fixing it requires
  the Vite 8 major upgrade; not worth the breaking change for a dev-only issue.
