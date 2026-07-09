import styles from "./Specs.module.css";

const SPEC_CARDS = [
  {
    label: "Left Body",
    title: "Milled Aluminum Chassis",
    copy: "A single block of aircraft-grade aluminum, machined to tolerances of 0.02mm.",
  },
  {
    label: "Detail",
    title: "Hybrid Mount Transition",
    copy: "The lens mount transitions seamlessly into the body with zero visible seams.",
  },
  {
    label: "Right Body",
    title: "Weather-Sealed Controls",
    copy: "Every dial and button is sealed against dust and moisture for field-ready reliability.",
  },
  {
    label: "Comparison",
    title: "OBSIDIAN vs. The Rest",
    copy: "45MP full-frame sensor, 15 stops of dynamic range, and a shutter rated to 500,000 actuations.",
  },
];

export default function Specs() {
  return (
    <section id="specs" className={styles.specs}>
      <span className="section-eyebrow">Engineering</span>
      <h2 className={styles.heading}>Camera Specs</h2>

      <div className={styles.grid}>
        {SPEC_CARDS.map((card) => (
          <article key={card.title} className={styles.card}>
            <div className={`placeholder ${styles.image}`}>{card.label}</div>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p>{card.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
