import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import { KATEX_MACROS, tokenize } from '@/lib/content/markup';
import styles from './ui.module.css';

export const GlossaryContext = createContext({});

/** Ekspresi matematika. Konten berasal dari penulis konten, dirender KaTeX dengan trust:false. */
export function MathText({ tex, display = false }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        throwOnError: false,
        trust: false,
        displayMode: display,
        macros: { ...KATEX_MACROS },
      });
    } catch {
      return null;
    }
  }, [tex, display]);
  if (!html) return <code>{tex}</code>;
  // Keluaran KaTeX dari konten penulis (bukan input pengguna) — aman dirender sebagai HTML.
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function GlossaryTerm({ termKey, label }) {
  const glossary = useContext(GlossaryContext);
  const entry = glossary[termKey];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const text = label || entry?.term || termKey;
  if (!entry) return <span>{text}</span>;
  return (
    <span ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className={styles.term}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {text}
      </button>
      {open && (
        <span role="tooltip" id={id} className={styles.popover}>
          <strong>{entry.term}</strong>
          {entry.definition}
          {entry.example && (
            <>
              <br />
              <em>Contoh: {entry.example}</em>
            </>
          )}
        </span>
      )}
    </span>
  );
}

function Inline({ text, renderSpan }) {
  return tokenize(text).map((t, i) => {
    switch (t.type) {
      case 'math':
        return <MathText key={i} tex={t.value} />;
      case 'term':
        return <GlossaryTerm key={i} termKey={t.key} label={t.label} />;
      case 'bold':
        return <strong key={i}>{t.value}</strong>;
      case 'code':
        return <code key={i}>{t.value}</code>;
      case 'span':
        return renderSpan ? renderSpan(t, i) : <span key={i}>{t.value}</span>;
      default:
        return <span key={i}>{t.value}</span>;
    }
  });
}

/** Teks konten: paragraf dipisah baris kosong. */
export default function RichText({ text, as = 'div', renderSpan, className }) {
  const paragraphs = String(text || '').split(/\n\s*\n/);
  const Tag = as;
  if (as === 'span') {
    return (
      <span className={className}>
        <Inline text={text} renderSpan={renderSpan} />
      </span>
    );
  }
  return (
    <Tag className={className}>
      {paragraphs.map((p, i) => (
        <p key={i}>
          <Inline text={p} renderSpan={renderSpan} />
        </p>
      ))}
    </Tag>
  );
}
