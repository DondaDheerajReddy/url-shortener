  'use client';

  import { useEffect, useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { getToken, getUser, clearAuth } from '@/lib/auth';
  import type { AuthUser } from '@/lib/auth';
  import styles from './dashboard.module.css';

  interface Link {
    id: number;
    code: string;
    shortUrl: string;
    original: string;
    createdAt: string;
    expiresAt: string | null;
    totalClicks: number;
  }

  export default function DashboardPage() {
    const router = useRouter();

    // ✅ All state starts as null — same on server and client (no hydration mismatch)
    const [user, setUser]       = useState<AuthUser | null>(null);
    const [token, setToken]     = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [links, setLinks]     = useState<Link[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied]   = useState<string | null>(null);

    // ✅ Step 1 — read localStorage ONLY after mount (browser only)
    useEffect(() => {
      const t = getToken();
      const u = getUser();
      setToken(t);
      setUser(u);
      setMounted(true);

      if (!t) {
        router.push('/login');
      }
    }, [router]);

    // ✅ Step 2 — fetch links once we have the token
    useEffect(() => {
      if (!token) return;

      async function fetchLinks() {
        try {
          const res = await fetch('/api/shorten/my-links', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setLinks(data.links ?? []);
        } catch {
          // silently fail
        } finally {
          setLoading(false);
        }
      }

      fetchLinks();
    }, [token]);

    async function handleCopy(shortUrl: string) {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(shortUrl);
      setTimeout(() => setCopied(null), 2000);
    }

    async function handleDelete(code: string) {
      if (!confirm(`Delete link /${code}?`)) return;
      await fetch(`/api/shorten/${code}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setLinks(prev => prev.filter(l => l.code !== code));
    }

    function handleLogout() {
      clearAuth();
      router.push('/');
    }

    // ✅ Don't render anything until client has mounted
    // This is what prevents the hydration error
    if (!mounted) return null;

    if (!user) return null;

    return (
      <div className={styles.page}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <a href="/" className={styles.logo}>
            <span className={styles.logoMark}>✦</span>
            snip
          </a>

          <nav className={styles.nav}>
            <a href="/dashboard" className={`${styles.navItem} ${styles.active}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              My Links
            </a>
            <a href="/" className={styles.navItem}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1L15 8L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              New Link
            </a>
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <div className={styles.userName}>{user.username}</div>
                <div className={styles.userEmail}>{user.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Log out
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.heading}>My Links</h1>
              <p className={styles.subheading}>
                {links.length} link{links.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <a href="/" className={styles.newLinkBtn}>
              + New link
            </a>
          </div>

          {loading && (
            <div className={styles.emptyState}>
              <div className={styles.spinner} aria-label="Loading links" />
            </div>
          )}

          {!loading && links.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔗</div>
              <p className={styles.emptyTitle}>No links yet</p>
              <p className={styles.emptyDesc}>
                Go to the homepage and shorten your first URL while logged in.
              </p>
              <a href="/" className={styles.emptyBtn}>Shorten a URL</a>
            </div>
          )}
          
          {!loading && links.length > 0 && (
            <div className={styles.table}>
              {links.map(link => (
                <div key={link.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    
                     <a href={link.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.shortUrl}
                    >
                      {link.shortUrl}
                    </a>
                    <p className={styles.originalUrl}>{link.original}</p>
                  </div>

                  <div className={styles.rowMeta}>
                    <span className={styles.clicks}>
                      {link.totalClicks} {link.totalClicks === 1 ? 'click' : 'clicks'}
                    </span>
                    <span className={styles.date}>
                      {new Date(link.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                    {link.expiresAt && (
                      <span className={styles.expiry}>
                        Expires {new Date(link.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className={styles.rowActions}>
                    <a href={`/stats/${link.code}`}
                      className={styles.statsBtn}
                    >
                      Stats
                    </a>
                    <button
                      onClick={() => handleCopy(link.shortUrl)}
                      className={`${styles.actionBtn} ${copied === link.shortUrl ? styles.copied : ''}`}
                    >
                      {copied === link.shortUrl ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleDelete(link.code)}
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }