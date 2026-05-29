'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getToken } from '@/lib/auth';
import ClicksChart from '@/components/ClicksChart';
import styles from './stats.module.css';

interface DailyClick {
  date: string;
  clicks: number;
}

interface StatsData {
  code: string;
  original: string;
  shortUrl: string;
  createdAt: string;
  expiresAt: string | null;
  totalClicks: number;
  dailyClicks: DailyClick[];
}

export default function StatsPage() {
  const router          = useRouter();
  const params          = useParams();
  const code            = params.code as string;

  const [stats, setStats]     = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = getToken();
    setMounted(true);

    if (!token) {
      router.push('/login');
      return;
    }

    async function fetchStats() {
      try {
        const res = await fetch(`/api/shorten/${code}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Failed to load stats');
        }

        const data = await res.json();
        setStats(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [code, router]);

  if (!mounted) return null;

  return (
    <div className={styles.page}>
      {/* Background effects */}
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.bgGlow} aria-hidden="true" />

      {/* Header */}
      <header className={styles.header}>
        <a href="/dashboard" className={styles.backBtn}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to dashboard
        </a>
        <a href="/" className={styles.logo}>
          <span className={styles.logoMark}>✦</span>
          snip
        </a>
      </header>

      <main className={styles.main}>

        {/* Loading */}
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} aria-label="Loading stats" />
            <p>Loading stats...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={styles.errorState}>
            <p>{error}</p>
            <a href="/dashboard" className={styles.errorBtn}>Back to dashboard</a>
          </div>
        )}

        {/* Stats */}
        {stats && !loading && (
          <>
            {/* Link info */}
            <div className={styles.linkCard}>
              <div className={styles.linkInfo}>
                <a
                  href={stats.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shortUrl}
                >
                  {stats.shortUrl}
                </a>
                <p className={styles.originalUrl}>{stats.original}</p>
                <p className={styles.createdAt}>
                  Created {new Date(stats.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Total clicks stat */}
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalClicks}</div>
              <div className={styles.statLabel}>Total clicks</div>
            </div>

            {/* Bar chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>Clicks per day</h2>
                <span className={styles.chartSubtitle}>Last 30 days</span>
              </div>

              {stats.dailyClicks.length === 0 ? (
                <div className={styles.noData}>
                  <span>📊</span>
                  <p>No clicks recorded yet</p>
                  <p className={styles.noDataHint}>
                    Share your link to start seeing data here.
                  </p>
                </div>
              ) : (
                <ClicksChart data={stats.dailyClicks} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
