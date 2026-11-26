import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isSoundOn, onSoundChange, playSound, setSoundOn } from '@/lib/sound';
import DuckMascot from './DuckMascot';
import styles from './ui.module.css';

const cx = (...c) => c.filter(Boolean).join(' ');

/** Maksimal satu variant="primary" per layar (PP-02). */
export function Button({ variant = 'secondary', block, size, to, className, children, ...rest }) {
  const cls = cx(styles.btn, styles[variant], block && styles.block, size === 'sm' && styles.sm, className);
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Card({ className, children, ...rest }) {
  return (
    <div className={cx(styles.card, className)} {...rest}>
      {children}
    </div>
  );
}

const FB = {
  correct: { cls: styles.fbCorrect, icon: '✓', label: 'Benar' },
  warning: { cls: styles.fbWarning, icon: '!', label: 'Perlu dicek' },
  info: { cls: styles.fbInfo, icon: 'i', label: 'Info' },
};

export function FeedbackBox({ tone = 'info', children }) {
  const f = FB[tone];
  return (
    <div className={cx(styles.feedback, f.cls)} role="status" aria-live="polite">
      <span className={styles.fbIcon} aria-hidden="true">
        {f.icon}
      </span>
      <div>
        <span className="visually-hidden">{f.label}: </span>
        {children}
      </div>
    </div>
  );
}

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className={styles.logo} aria-label="JelajahGaris, ke beranda">
      <DuckMascot size={42} hat="cap" headOnly />
      <span>
        Jelajah<b>Garis</b>
      </span>
    </Link>
  );
}

export function ProgressBar({ value, max, label }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Loading({ text = 'Memuat…' }) {
  return (
    <div className={styles.spinner} role="status">
      <DuckMascot size={72} hat="none" mood="think" />
      <span>{text}</span>
    </div>
  );
}

export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const current =
      root.getAttribute('data-theme') ||
      (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* abaikan */
    }
  };
  return (
    <button type="button" className={styles.iconBtn} onClick={toggle} aria-label="Ganti tema terang/gelap">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Sakelar suara (F-26). aria-pressed menyatakan status. */
export function SoundToggle() {
  const [on, setOn] = useState(isSoundOn);
  useEffect(() => onSoundChange(setOn), []);
  const toggle = () => {
    setSoundOn(!on);
    if (!on) playSound('tap');
  };
  return (
    <button
      type="button"
      className={styles.iconBtn}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Matikan suara' : 'Nyalakan suara'}
      title={on ? 'Suara menyala' : 'Suara mati'}
      data-sound="none"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H3v6h3l5 4z" />
        {on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m16 9 5 6M21 9l-5 6" />}
      </svg>
    </button>
  );
}

export { DuckMascot, styles as uiStyles };
