'use client';

import { useState } from 'react';
import styles from './AuthForm.module.css';

export interface AuthField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password';
  placeholder: string;
  autoComplete?: string;
}

interface AuthFormProps {
  title: string;
  subtitle: string;
  fields: AuthField[];
  submitLabel: string;
  loadingLabel: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

export default function AuthForm({
  title,
  subtitle,
  fields,
  submitLabel,
  loadingLabel,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  onSubmit,
}: AuthFormProps) {
  const [values, setValues]   = useState<Record<string, string>>(
    Object.fromEntries(fields.map(f => [f.name, '']))
  );
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(values);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Background effects */}
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.bgGlow} aria-hidden="true" />

      {/* Logo */}
      <a href="/" className={styles.logo}>
        <span className={styles.logoMark}>✦</span>
        snip
      </a>

      {/* Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7.5 4.5v3.5M7.5 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {fields.map(field => (
            <div key={field.name} className={styles.fieldGroup}>
              <label htmlFor={field.name} className={styles.label}>
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                value={values[field.name]}
                onChange={handleChange}
                className={styles.input}
                disabled={loading}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                {loadingLabel}
              </>
            ) : (
              submitLabel
            )}
          </button>
        </form>

        <p className={styles.footer}>
          {footerText}{' '}
          <a href={footerLinkHref} className={styles.footerLink}>
            {footerLinkLabel}
          </a>
        </p>
      </div>
    </div>
  );
}
