import Navbar from '../components/Navbar';
import ShortenForm from '../components/ShortenForm';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>

        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Free to use — no sign up required
          </div>

          <h1 className={styles.headline}>
            Short links.<br />
            <span className={styles.headlineAccent}>Big impact.</span>
          </h1>

          <p className={styles.subline}>
            Transform any URL into a clean, shareable link in one click.
            Track clicks, manage your links, and share with confidence.
          </p>

          {/* ── Main form ── */}
          <div className={styles.formWrap}>
            <ShortenForm />
          </div>

          <p className={styles.hint}>
            No account needed to shorten.{' '}
            <a href="/register" className={styles.hintLink}>
              Sign up to manage your links →
            </a>
          </p>
        </section>

        {/* ── Feature strip ── */}
        <section className={styles.features}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.feature}>
              <div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            </div>
          ))}
        </section>

      </main>
    </>
  );
}

const FEATURES = [
  {
    title: 'Instant shortening',
    desc: 'Paste your URL and get a short link in milliseconds.',
  },
  {
    title: 'Click analytics',
    desc: 'See how many times your link has been clicked.',
  },
  {
    title: 'Link ownership',
    desc: 'Sign in to manage, edit and delete your links.',
  },
  {
    title: 'Expiry dates',
    desc: 'Set links to expire automatically after N days.',
  },
];
