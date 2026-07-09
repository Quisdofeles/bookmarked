import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

const VIDEO_DURATION = 8; // seconds, matches Obsidian_Hero_Camera_Transition.mp4

const TEXT_BLOCKS = [
  { id: "opening", from: 0, to: 2.5, copy: "A camera reimagined from the sensor up." },
  { id: "mid", from: 2.5, to: 6, copy: "Every surface machined for a single purpose: precision." },
  { id: "closing", from: 6, to: VIDEO_DURATION, copy: "This is OBSIDIAN." },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function Hero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const [activeText, setActiveText] = useState("opening");

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const updateFromScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollableDistance = section.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = scrollableDistance > 0 ? clamp(scrolled / scrollableDistance, 0, 1) : 0;

      const currentTime = progress * VIDEO_DURATION;
      if (Number.isFinite(video.duration)) {
        video.currentTime = progress * Math.min(video.duration, VIDEO_DURATION);
      }

      const block = TEXT_BLOCKS.find((b) => currentTime >= b.from && currentTime < b.to) ?? TEXT_BLOCKS[TEXT_BLOCKS.length - 1];
      setActiveText((prev) => (prev === block.id ? prev : block.id));
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateFromScroll();
      });
    };

    updateFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section id="home" ref={sectionRef} className={styles.hero}>
      <div className={styles.stickyStage}>
        <div className={styles.mediaWrap}>
          <video
            ref={videoRef}
            className={styles.video}
            src="/video/Obsidian_Hero_Camera_Transition.mp4"
            muted
            playsInline
            preload="auto"
            controls={false}
          />
        </div>

        <div className={styles.textStack} aria-live="polite">
          {TEXT_BLOCKS.map((block) => (
            <p
              key={block.id}
              className={`${styles.text} ${activeText === block.id ? styles.textActive : ""}`}
            >
              {block.copy}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
