import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

const TIMELINE_DURATION = 10;

const FRAME_COUNT = 40; 

function frameSrc(index) {
  return `/images/Obsidian_Hero_Disassemble_Frame-${index}.webp`;
}

const HERO_CONTENT = [
  {
    id: "opening",
    from: 0,
    to: 3,
    title: "Precision Engineering\nIn Every Detail",
    description:
      "Every component reengineered from scratch, built around a sensor unlike anything else in its class.",
  },
  {
    id: "mid",
    from: 3.1,
    to: 6,
    title: "No Compromise\nNo Shortcuts",
    description:
      "From the milled aluminum chassis to the weather-sealed controls, nothing is left to chance.",
  },
  {
    id: "closing",
    from: 6.1,
    to: TIMELINE_DURATION,
    title: "This Is Obsession\nThis Is OBSIDIAN",
    description: "The camera built for professionals who refuse to compromise, will you?",
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const SIDEBAR_SLOT_HEIGHT = 340;
const PRIORITY_FRAME_COUNT = 10;

export default function Hero() {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const scrollRafRef = useRef(null);
  const lastFrameIndexRef = useRef(1);
  const loadedFramesRef = useRef(new Array(FRAME_COUNT + 1).fill(false));
  const preloadedImagesRef = useRef(new Array(FRAME_COUNT + 1));
  const sidebarCardRefs = useRef([]);
  const progressFillRef = useRef(null);
  const [activeId, setActiveId] = useState("opening");

  useEffect(() => {
    loadedFramesRef.current[1] = true;
    const preloadedImages = preloadedImagesRef.current;

    const preloadFrame = (index, onSettled) => {
      const img = new Image();
      img.onload = () => {
        loadedFramesRef.current[index] = true;
        onSettled?.();
      };
      img.onerror = () => onSettled?.();
      img.src = frameSrc(index);
      preloadedImages[index] = img;
    };

    const priorityFrames = [];
    for (let i = 2; i <= Math.min(PRIORITY_FRAME_COUNT, FRAME_COUNT); i++) {
      priorityFrames.push(i);
    }

    const preloadRemainingFrames = () => {
      for (let i = PRIORITY_FRAME_COUNT + 1; i <= FRAME_COUNT; i++) preloadFrame(i);
    };

    if (priorityFrames.length === 0) {
      preloadRemainingFrames();
      return;
    }

    let pending = priorityFrames.length;
    priorityFrames.forEach((i) =>
      preloadFrame(i, () => {
        pending -= 1;
        if (pending === 0) preloadRemainingFrames();
      })
    );
  }, []);

  /*------
  SIDEBAR
  -------*/
  useEffect(() => {
  const section = sectionRef.current;
  if (!section) return;

  const update = () => {
    const rect = section.getBoundingClientRect();
    const scrollableDistance = section.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = scrollableDistance > 0 ? clamp(scrolled / scrollableDistance, 0, 1) : 0;
    const currentTime = progress * TIMELINE_DURATION;

    const frameIndex = clamp(Math.round(1 + progress * (FRAME_COUNT - 1)), 1, FRAME_COUNT);
    if (
      frameIndex !== lastFrameIndexRef.current &&
      loadedFramesRef.current[frameIndex] &&
      imgRef.current
    ) {
      imgRef.current.src = frameSrc(frameIndex);
      lastFrameIndexRef.current = frameIndex;
    }

    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${progress * 100}%`;
    }

    const block =
      HERO_CONTENT.find((b) => currentTime >= b.from && currentTime < b.to) ??
      HERO_CONTENT[HERO_CONTENT.length - 1];
    setActiveId((prev) => (prev === block.id ? prev : block.id));

    const sidebarProgress = clamp(currentTime / 9, 0, 1);
    const stageValue = sidebarProgress * (HERO_CONTENT.length - 1);
    
    sidebarCardRefs.current.forEach((el, i) => {
      if (!el) return;
      const cardDelta = i - stageValue;
      const offsetPx = cardDelta * SIDEBAR_SLOT_HEIGHT;
      const opacity = clamp(1 - Math.abs(cardDelta), 0, 1);
      el.style.setProperty("--offset", `${offsetPx}px`);
      el.style.opacity = opacity;
    });
  };

  const onScroll = () => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      update();
    });
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
  };
}, []);

  const scrollToSpecs = (event) => {
    event.currentTarget.blur();
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
