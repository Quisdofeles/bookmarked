import { useEffect, useState } from "react";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { label: "Specs", href: "#specs" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const CLOSE_ANIMATION_MS = 300;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) return;
    const frame = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [isMounted]);

  const openMenu = () => setIsMounted(true);

  const closeMenu = () => {
    setIsOpen(false);
    setTimeout(() => setIsMounted(false), CLOSE_ANIMATION_MS);
  };

  const toggleMenu = () => (isMounted ? closeMenu() : openMenu());

  return (
    <>
      <header className={styles.header}>
        <a href="#home" className={styles.logo}>
          OBSIDIAN
        </a>

        <nav className={styles.nav}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className={styles.hamburger}
          aria-label="Toggle menu"
          aria-expanded={isMounted}
          onClick={toggleMenu}
        >
          <span className={`${styles.hamburgerLine} ${isMounted ? styles.lineTop : ""}`} />
          <span className={`${styles.hamburgerLine} ${isMounted ? styles.lineMid : ""}`} />
          <span className={`${styles.hamburgerLine} ${isMounted ? styles.lineBottom : ""}`} />
        </button>
      </header>

      {isMounted && (
        <nav className={`${styles.mobileNav} ${isOpen ? styles.mobileNavOpen : ""}`}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.mobileNavLink} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
