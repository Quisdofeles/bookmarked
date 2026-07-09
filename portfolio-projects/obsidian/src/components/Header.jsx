import styles from "./Header.module.css";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Specs", href: "#specs" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  return (
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
    </header>
  );
}
