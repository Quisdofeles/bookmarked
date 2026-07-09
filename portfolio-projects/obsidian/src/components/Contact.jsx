import { useState } from "react";
import styles from "./Contact.module.css";

export default function Contact() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className={styles.contact}>
      <h2 className={styles.heading}>Stay Updated</h2>
      <p className={styles.subheading}>Get the latest on OBSIDIAN</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className="btn btn-solid">
          Submit
        </button>
      </form>

      {submitted && <p className={styles.confirmation}>Thanks — you're on the list.</p>}
    </section>
  );
}
