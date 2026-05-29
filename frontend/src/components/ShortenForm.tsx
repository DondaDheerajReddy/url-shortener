'use client';

import { useState, useRef } from 'react';
import { shortenUrl } from '@/lib/api';
import type { ShortenResponse } from '@/types';
import styles from './ShortenForm.module.css';

export default function ShortenForm() {
  const [url, setUrl]           = useState('');
  const [result, setResult]     = useState<ShortenResponse | null>(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await shortenUrl(url.trim());
      setResult(data);
      setUrl('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setResult(null);
    setError('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div className={styles.wrapper}>
      {/* ── Input form ── */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            className={styles.input}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className={styles.submitBtn}
          >
            {loading ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : (
              'Shorten'
            )}
          </button>
        </div>
      </form>

      {/* ── Error state ── */}
      {error && (
        <div className={styles.errorBox} role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 4.5v4M8 10.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── Success state ── */}
      {result && (
        <div className={styles.resultBox}>
          <div className={styles.resultHeader}>
            <div className={styles.resultCheck}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={styles.resultLabel}>Your short link is ready</span>
            <button onClick={handleReset} className={styles.resetBtn} aria-label="Shorten another URL">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7a5 5 0 1 1 1.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2 10.5V7H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              New link
            </button>
          </div>

          <div className={styles.shortUrlRow}>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.shortUrl}
            >
              {result.shortUrl}
            </a>
            <button
              onClick={handleCopy}
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <rect x="5" y="5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 5V3.5A1.5 1.5 0 0 0 7.5 2H3.5A1.5 1.5 0 0 0 2 3.5V7.5A1.5 1.5 0 0 0 3.5 9H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          <div className={styles.originalUrl}>
            <span className={styles.originalLabel}>Original</span>
            <span className={styles.originalText}>{result.original}</span>
          </div>
        </div>
      )}
    </div>
  );
}
