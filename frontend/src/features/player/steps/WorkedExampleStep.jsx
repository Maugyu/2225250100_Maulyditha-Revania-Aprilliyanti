import { useEffect, useRef } from 'react';
import RichText, { MathText } from '@/components/ui/RichText';
import { Button } from '@/components/ui';
import styles from '../player.module.css';

/**
 * Contoh terbimbing (F-07): satu transformasi per tampilan, bagian berubah disorot (\hl),
 * langkah sebelumnya tetap terlihat, tempo dikendalikan siswa (PP-06, EL04).
 */
export function revealedCount(step, value) {
  return Math.max(1, Math.min(value?.revealed ?? 1, step.lines.length));
}

export function isExampleComplete(step, value, solved) {
  const blankIdx = step.lines.findIndex((l) => l.blank);
  const all = revealedCount(step, value) >= step.lines.length;
  return all && (blankIdx < 0 || solved);
}

export default function WorkedExampleStep({ step, value, onChange, solved, disabled }) {
  const shown = revealedCount(step, value);
  const blankIdx = step.lines.findIndex((l) => l.blank);
  const waitingBlank = blankIdx >= 0 && shown > blankIdx && !solved;
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.focus({ preventScroll: false });
  }, [shown]);

  return (
    <div className={styles.field}>
      {step.prompt && (
        <div className={styles.prompt}>
          <RichText text={step.prompt} as="span" />
        </div>
      )}
      <ol className={styles.lines}>
        {step.lines.slice(0, shown).map((line, i) => {
          const active = i === shown - 1;
          return (
            <li
              key={i}
              className={`${styles.line} ${active ? styles.lineActive : styles.lineDone}`}
              tabIndex={active ? -1 : undefined}
              ref={active ? activeRef : undefined}
            >
              <div className={styles.lineLabel}>{line.label}</div>
              <div className={styles.lineMath}>
                <MathText tex={line.tex} display={false} />
                {line.blank && (
                  <input
                    aria-label={`Isian ${line.label}`}
                    className={styles.numInput}
                    value={value?.value ?? ''}
                    disabled={disabled || solved}
                    placeholder="?"
                    onChange={(e) => onChange({ ...value, revealed: shown, value: e.target.value })}
                  />
                )}
              </div>
              {line.note && active && <div className={styles.lineNote}>{line.note}</div>}
            </li>
          );
        })}
      </ol>
      {shown < step.lines.length && !waitingBlank && (
        <Button variant="secondary" onClick={() => onChange({ ...value, revealed: shown + 1 })}>
          Tampilkan langkah berikutnya ↓
        </Button>
      )}
      {waitingBlank && <p className={styles.help}>Isi kotak di langkah ini, lalu tekan “Cek jawaban”.</p>}
    </div>
  );
}
