import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

// Virtual timeline length (seconds) driving the text breakpoints below and the
// scroll-to-frame mapping. Not tied to any real media duration anymore — it's
// just the same 0-8 scale the old video used, kept so downstream logic
// (breakpoints, sidebar carousel, progress bar) didn't need to change.
const TIMELINE_DURATION = 10;

const FRAME_COUNT = 40; // Obsidian_Hero_Disassemble_Frame-1.webp .. Frame-40.webp in /public/images

function frameSrc(index) {
  return `/images/Obsidian_Hero_Disassemble_Frame-${index}.webp`;
}

// Titles carry an embedded "\n" marking where the hero <h1> breaks into its two
// display lines (see .titleLine in Hero.module.css). It's a single field, not
// separate line1/line2 fields — the sidebar card heading below reuses the same
// string and just lets the browser collapse the "\n" into a normal space.
const HERO_CONTENT = [
  {
    id: "opening",
    from: 0,
    to: 3.3,
    title: "Precision Engineering\nIn Every Detail",
    description:
      "Every component reengineered from scratch, built around a sensor unlike anything else in its class.",
  },
  {
    id: "mid",
    from: 3.4,
    to: 6.6,
    title: "No Compromise\nNo Shortcuts",
    description:
      "From the milled aluminum chassis to the weather-sealed controls, nothing is left to chance.",
  },
  {
    id: "closing",
    from: 6.7,
    to: TIMELINE_DURATION,
    title: "This Is Obsession\nThis Is OBSIDIAN",
    description: "The camera built for professionals who refuse to compromise, will you?",
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Distance (px) between adjacent sidebar card slots in the carousel — translateY
// on desktop, translateX on mobile (see .sidebarCard in Hero.module.css). Must be
// >= the card's largest dimension (mobile card width is up to 320px) so adjacent
// cards never overlap mid-transition — neighbors are always exactly this far apart.
const SIDEBAR_SLOT_HEIGHT = 340;

// How much of the gap to the scroll target the timeline closes per animation frame.
// Lower = more trailing/fluid (feels like it's playing to catch up), higher =
// snappier and closer to a direct scroll-to-frame mapping.
const SMOOTHING = 0.08;
const SNAP_EPSILON = 0.005; // seconds; once this close, stop nudging the timeline

export default function Hero() {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const scrollRafRef = useRef(null);
  const renderRafRef = useRef(null);
  const targetProgressRef = useRef(0);
  const smoothedTimeRef = useRef(0);
  const lastFrameIndexRef = useRef(1);
  const loadedFramesRef = useRef(new Array(FRAME_COUNT + 1).fill(false));
  const sidebarCardRefs = useRef([]);
  const progressFillRef = useRef(null);
  const [activeId, setActiveId] = useState("opening");

  // Preload the full sequence in the background. The render loop only ever
  // swaps the visible <img>'s src to a frame that has already finished
  // loading, so scrubbing never shows a broken/blank image mid-load — it just
  // holds the last valid frame until the next one is ready.
  useEffect(() => {
    loadedFramesRef.current[1] = true; // the visible <img> already requests frame 1 directly

    const preloaders = [];
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = () => {
        loadedFramesRef.current[i] = true;
      };
      img.src = frameSrc(i);
      preloaders.push(img);
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Scroll only updates *where the sequence should end up* — cheap, rAF-throttled
    // against layout thrash. It never touches the displayed frame directly, so a
    // fast scroll doesn't teleport straight to the target frame.
    const updateTarget = () => {
      const rect = section.getBoundingClientRect();
      const scrollableDistance = section.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      targetProgressRef.current =
        scrollableDistance > 0 ? clamp(scrolled / scrollableDistance, 0, 1) : 0;
    };

    const onScroll = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateTarget();
      });
    };

    // Runs every frame regardless of whether the user is actively scrolling, so
    // playback keeps easing toward the target — and the overlays stay driven by
    // that same eased time — until it catches up, instead of freezing the
    // instant scrolling stops.
    const renderFrame = () => {
      const targetTime = targetProgressRef.current * TIMELINE_DURATION;
      const delta = targetTime - smoothedTimeRef.current;
      smoothedTimeRef.current =
        Math.abs(delta) < SNAP_EPSILON ? targetTime : smoothedTimeRef.current + delta * SMOOTHING;

      const currentTime = smoothedTimeRef.current;

      const frameIndex = clamp(
        Math.round(1 + (currentTime / TIMELINE_DURATION) * (FRAME_COUNT - 1)),
        1,
        FRAME_COUNT
      );
      if (
        frameIndex !== lastFrameIndexRef.current &&
        loadedFramesRef.current[frameIndex] &&
        imgRef.current
      ) {
        imgRef.current.src = frameSrc(frameIndex);
        lastFrameIndexRef.current = frameIndex;
      }

      if (progressFillRef.current) {
        progressFillRef.current.style.width = `${(currentTime / TIMELINE_DURATION) * 100}%`;
      }

      const block =
        HERO_CONTENT.find((b) => currentTime >= b.from && currentTime < b.to) ??
        HERO_CONTENT[HERO_CONTENT.length - 1];
      setActiveId((prev) => (prev === block.id ? prev : block.id));

      // Continuous carousel position: 0 at the first card, HERO_CONTENT.length - 1
      // at the last, interpolating smoothly in between so the sidebar scrolls in
      // lockstep with the (now eased) timeline instead of snapping. The offset is
      // exposed as a CSS custom property rather than a transform directly, so the
      // stylesheet can decide per breakpoint whether it drives translateY (desktop,
      // bottom-to-top) or translateX (mobile, right-to-left).
      const stageValue = (currentTime / TIMELINE_DURATION) * (HERO_CONTENT.length - 1);
      sidebarCardRefs.current.forEach((el, i) => {
        if (!el) return;
        const cardDelta = i - stageValue;
        const offsetPx = cardDelta * SIDEBAR_SLOT_HEIGHT;
        const opacity = clamp(1 - Math.abs(cardDelta), 0, 1);
        el.style.setProperty("--offset", `${offsetPx}px`);
        el.style.opacity = opacity;
      });

      renderRafRef.current = requestAnimationFrame(renderFrame);
    };

    updateTarget();
    renderRafRef.current = requestAnimationFrame(renderFrame);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      if (renderRafRef.current) cancelAnimationFrame(renderRafRef.current);
    };
  }, []);

  const scrollToSpecs = () => {
    document.getElementById("specs")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" ref={sectionRef} className={styles.hero}>
      <div className={styles.stickyStage}>
        <img ref={imgRef} className={styles.frame} src={frameSrc(1)} alt="" />

        <div className={styles.scrim} />

        <div className={styles.progressTrack}>
          <div ref={progressFillRef} className={styles.progressFill} />
        </div>

        <div className={styles.overlay}>
          <div className={styles.titleBlock}>
            <span className="section-eyebrow">Obsidian X-1K (2470)</span>
            <div className={styles.titleStack} aria-live="polite">
              {HERO_CONTENT.map((block) => (
                <h1
                  key={block.id}
                  className={`${styles.title} ${activeId === block.id ? styles.active : ""}`}
                >
                  {block.title.split("\n").map((line, i) => (
                    <span key={i} className={styles.titleLine}>
                      {line}
                    </span>
                  ))}
                </h1>
              ))}
            </div>

            <button type="button" className={styles.exploreBtn} onClick={scrollToSpecs}>
              Explore
            </button>
          </div>
        </div>

        <aside className={styles.sidebar} aria-live="polite">
          {HERO_CONTENT.map((block, i) => (
            <div
              key={block.id}
              ref={(el) => (sidebarCardRefs.current[i] = el)}
              className={styles.sidebarCard}
            >
              <h3 className={styles.sidebarCardTitle}>{block.title.replace("\n", " ")}</h3>
              <p className={styles.sidebarCardText}>{block.description}</p>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
