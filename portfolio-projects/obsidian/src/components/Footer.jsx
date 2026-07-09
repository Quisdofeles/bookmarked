import styles from "./Footer.module.css";

const FOOTER_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Specs", href: "#specs" },
  { label: "Contact", href: "#contact" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "X", href: "#" },
  { label: "YouTube", href: "#" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>© {new Date().getFullYear()} OBSIDIAN. All rights reserved.</p>

      <nav className={styles.links}>
        {FOOTER_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className={styles.social}>
        {SOCIAL_LINKS.map((link) => (
          <a key={link.label} href={link.href} aria-label={link.label}>
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
