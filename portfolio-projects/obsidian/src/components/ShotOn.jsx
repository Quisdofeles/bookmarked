import styles from "./ShotOn.module.css";

const GALLERY_ITEMS = ["Portrait", "Landscape", "Street", "Studio"];

export default function ShotOn() {
  return (
    <section id="gallery" className={styles.shotOn}>
      <h2 className={styles.heading}>Shot on OBSIDIAN</h2>
      <p className={styles.subheading}>Premium photography from premium engineering</p>

      <div className={styles.grid}>
        {GALLERY_ITEMS.map((label) => (
          <div key={label} className={`placeholder ${styles.image}`}>
            {label}
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-outline">
        View Full Gallery
      </button>
    </section>
  );
}
