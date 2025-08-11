import styles from "./page.module.css";

export default function Home() {
  return (
    <section className={styles.container}>
      <div className={styles.hero}>
        <h1>ECE NTUA Student Portal</h1>
        <p>Everything you need for a successful semester.</p>
      </div>
      <div className={styles.features}>
        <a href="/announcements" className={styles.feature}>
          <h2>Announcements</h2>
          <p>Stay up to date with official news.</p>
        </a>
        <a href="/lab-partners" className={styles.feature}>
          <h2>Lab Partners</h2>
          <p>Find classmates to collaborate with.</p>
        </a>
        <a href="/calendar" className={styles.feature}>
          <h2>Calendar</h2>
          <p>Add the semester schedule to your calendar.</p>
        </a>
        <a href="/past-papers" className={styles.feature}>
          <h2>Past Papers</h2>
          <p>Review previous exam papers.</p>
        </a>
        <a href="/network" className={styles.feature}>
          <h2>Student Network</h2>
          <p>Connect via IEEE or Google sign‑in (coming soon).</p>
        </a>
      </div>
    </section>
  );
}
