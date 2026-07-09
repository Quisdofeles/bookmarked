import styles from "./WhyObsidian.module.css";

const COLUMNS = [
  {
    title: "For Precision",
    copy: "Every component is engineered to sub-millimeter tolerances, tested across thousands of production cycles.",
  },
  {
    title: "Engineered Perfection",
    copy: "From sensor to shutter, OBSIDIAN is built by a team obsessed with getting the smallest details right.",
  },
  {
    title: "Outperforms the Rest",
    copy: "Independent lab testing places OBSIDIAN ahead of every camera in its class for dynamic range and low-light performance.",
  },
];

export default function WhyObsidian() {
  return (
    <section className={styles.why}>
      <div className={styles.columns}>
        {COLUMNS.map((col) => (
          <div key={col.title} className={styles.column}>
            <h3 className={styles.title}>{col.title}</h3>
            <p>{col.copy}</p>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-outline">
        Learn More
      </button>
    </section>
  );
}
