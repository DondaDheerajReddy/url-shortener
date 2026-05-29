'use client';

import { useEffect, useState } from 'react';
import { getUser, clearAuth } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function handleLogout() {
    clearAuth();
    window.location.href = '/';
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoMark}>✦</span>
          snip
        </a>
        <div className={styles.links}>
          {user ? (
            <>
              <a href="/dashboard" className={styles.link}>
                {user.username}
              </a>
              <button onClick={handleLogout} className={styles.link} style={{ cursor: 'pointer' }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <a href="/login" className={styles.link}>Log in</a>
              <a href="/register" className={styles.cta}>Get started</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
