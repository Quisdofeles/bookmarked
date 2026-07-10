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
    Hero.jsx               scroll-scrubbed image sequence + fading text
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
  video/    Obsidian_Hero_Camera_Transition.mp4, Obsidian_Specs_Rotation.mp4 — both unused; the hero
            moved from video to an image sequence (see below), left in place in case they're wanted again
  images/   Obsidian_Hero_Disassemble_Frame-1.webp .. Frame-40.webp (hero scroll sequence, ~2.7MB
            total, no zero-padding in the filenames) plus empty space for other sections, which
            still use CSS `.placeholder` boxes (#333333) until real photography lands for them
  CNAME     tableofcontents.page — custom domain for GitHub Pages
```

Non-hero sections still use plain `<div class="placeholder">` boxes, not `<img>` tags, since there
are no real image assets for them yet. Swap them for real `<img>`/`<picture>` elements as
photography comes in — don't add image-loading logic speculatively.

## How the hero scroll-scrub works

`Hero.jsx` wraps a `300svh` section around a `position: sticky; height: 100svh` stage. The extra
`200svh` is the scroll distance used to scrub the sequence (10x a plain `120vh` hero's `20vh`,
matching `TIMELINE_DURATION`'s current 10 — the ratio is 20vh of scroll per virtual second either
way) — the visible `<img>` never scrolls, it stays pinned while the section scrolls underneath it,
and its `src` is swapped between `/images/Obsidian_Hero_Disassemble_Frame-1.webp` ..
`Frame-40.webp` as scroll progresses (note the frame numbers aren't zero-padded — `frameSrc()` does
NOT `padStart`, unlike the previous asset set). The base (non-responsive) `.frame` sizing/position
has been superseded by a set of manually-tuned breakpoints — check the `@media` rules in
`Hero.module.css` for the current values per viewport rather than assuming the unqualified `.frame`
rule is what renders at any given size.

There's no real media duration anymore, so `TIMELINE_DURATION` is just a virtual timeline scale kept
so the breakpoints/carousel/progress-bar math below didn't need to change when the video was
swapped out (check `Hero.jsx` for its current value — it's changed more than once). There used to be
a two-loop easing system here (a scroll-driven target plus a separately-running smoothing loop that
kept nudging the displayed frame toward it), but that's been removed in favor of a single
rAF-throttled scroll handler (`update()`) that snaps every value — frame, progress bar, title
breakpoint, sidebar carousel — directly from raw scroll position on each tick. The rAF throttle is
just standard scroll-perf hygiene (batches to one calculation per animation frame instead of one per
scroll event); it is not easing, and there's no catch-up delay once scrolling stops. Frame index is
`clamp(round(1 + progress * (FRAME_COUNT - 1)), 1, FRAME_COUNT)`, and — only if that frame has
already finished preloading — the `<img>`'s `src` is swapped. If it hasn't loaded yet, the display
just holds the last valid frame rather than showing a broken image; it catches up once the
background preload (a separate `useEffect`) reaches it.

That preload effect is staged, not a single flat loop: frame 1 is already on screen, frames
2–`PRIORITY_FRAME_COUNT` (10) load immediately as "priority" frames, and only once all of those have
settled (loaded or errored — `onerror` still counts toward the pending count so one failed request
can't stall the rest forever) does it kick off frames `PRIORITY_FRAME_COUNT + 1`..`FRAME_COUNT` in
the background. This was added after a real bug on Vercel: the original version created each
`new Image()` in a loop and only kept it in a local array scoped to the effect, so once the effect
returned there was no surviving reference to most of them — the browser was free to garbage-collect
an in-flight `Image` and silently cancel its download before `onload` fired. That showed up in the
Network tab as most frames sitting "(canceled)" at 0 kB, with only a handful (whichever happened to
finish fast enough to dodge GC) completing. It was rare locally because dev-server requests resolve
fast enough to outrun GC, but a slower CDN round-trip on Vercel gave it a much wider window to
collect mid-download. The fix is `preloadedImagesRef` — every preloaded `Image` is written into that
ref (keyed by frame index) so it stays referenced, and therefore alive, for the lifetime of the
component.

The sequence was originally 99 PNG frames at ~134MB total, which made the preload-lag above
genuinely visible (multi-second delay between scroll target and displayed frame on a fresh load,
confirmed during development). It went through a 64-WebP-frame revision (~7.3MB) and is currently
40 WebP frames at ~2.7MB total (`public/images/Obsidian_Hero_Disassemble_Frame-N.webp`) — small
enough that the preload lag hasn't been an issue since the first WebP swap. If frame count or format
changes again, re-check this on a throttled/slow connection before assuming it's still fine.

Title, sidebar, and the progress bar are all driven off that same raw scroll-derived `progress` —
so everything always matches exactly what's on screen, with no lag. A thin
`.progressTrack`/`.progressFill` bar sits directly under the header (`top: var(--header-height)`,
inside `.stickyStage` so it scrolls away with the rest of the hero once unpinned) and its width is
set to `progress * 100%` on every scroll tick via `progressFillRef`.

A large title sits top-left (`.titleBlock`), crossfading between three breakpoints (currently
`0–3s`, `3–6s`, `6–10s` — check `HERO_CONTENT`/`TIMELINE_DURATION` in `Hero.jsx` for the live values)
via the `activeId` state and a CSS grid stack (`grid-area: 1 / 1` on every child, so it sizes to the
tallest variant). Each `title` is a single string with an embedded `"\n"` marking where it breaks
into its two display lines — not separate `line1`/`line2` fields. The `<h1>` splits on that
character and wraps each half in a `.titleLine` (`display: block`) span; the sidebar card heading
reuses the same string with the `"\n"` replaced by a space instead, so it just wraps naturally in
the narrower card. Because it's a hard break rather than natural reflow, `.titleBlock`'s `max-width`
(760px) and the mobile title `font-size` (22px) both have to stay wide/small enough that neither
half wraps a second time — worth rechecking both whenever the title copy changes.

A sharp-cornered "Explore" button lives inside `.titleBlock`, directly under the title stack —
top-left, left-aligned with the title, not centered at the bottom. `.titleBlock` sets
`align-items: flex-start` specifically so the button (an `inline-flex`) hugs its own content width
instead of stretching to the column's full width. It smooth-scrolls to `#specs` on click, and
explicitly blurs itself first (`event.currentTarget.blur()`) — otherwise mobile browsers latch the
`:hover`/`:focus` styles after a tap and the button looks visually "stuck" pressed until something
else takes focus.

The right sidebar (`.sidebar`) is a full-height glass-bordered lane — full-width along the bottom
on mobile — not just three floating cards. `HERO_CONTENT`'s three cards (title + description each)
are positioned imperatively on every scroll tick (refs in `sidebarCardRefs`, no CSS transition —
the per-tick updates *are* the animation) via a `--offset` CSS custom property, not a transform set
directly in JS: `.sidebarCard`'s base transform is `translate(-50%, calc(-50% + var(--offset)))`
(vertical, bottom-to-top) and the `1024px` media query overrides it to
`translate(calc(-50% + var(--offset)), -50%)` (horizontal, right-to-left) — same JS math drives
both, only the stylesheet decides which axis consumes it per breakpoint. The desktop lane is `260px`
wide and each `.sidebarCard` is `width: 100%` of it (no side gutter — the card fills the lane
edge-to-edge); the mobile override caps card width at `max-width: 260px` too, so both orientations
now converge on roughly the same ~260px ceiling. `SIDEBAR_SLOT_HEIGHT` (340px) is the distance
between adjacent card slots; it must stay ≥ that largest card dimension in either orientation or
adjacent cards overlap and their text collides mid-transition — there's comfortable headroom at the
moment, but re-check this if the lane is ever widened. `.sidebar::before`/`::after` paint the black vignette (gradient,
`linear-gradient` flipped to left/right on mobile) that fades cards out near the lane's edges, which
is what makes it read as a continuous strip instead of three items in a box.

If the frame count changes, update `FRAME_COUNT` in `Hero.jsx` (and add/remove the corresponding
`Obsidian_Hero_Disassemble_Frame-N.webp` files in `public/images/`); if the naming pattern or
extension changes, update `frameSrc()` too. If the scroll feels too fast/slow, adjust `.hero`'s
height in `Hero.module.css` (100svh pinned + N svh of scroll travel).

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
