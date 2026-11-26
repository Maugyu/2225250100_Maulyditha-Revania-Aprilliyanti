import RichText from '@/components/ui/RichText';
import styles from '../player.module.css';

/** Tandai informasi penting pada teks situasi (F1). */
export function IdentifyInfoStep({ step, situation, value, onChange, disabled }) {
  const selected = new Set(value?.selected || []);
  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ selected: [...next] });
  };
  return (
    <div className={styles.field}>
      <div className={styles.prompt}>
        <RichText text={step.prompt} as="span" />
      </div>
      <RichText
        text={situation}
        className={`${styles.situationBox} ${styles.prose}`}
        renderSpan={(t, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.span} ${selected.has(t.id) ? styles.spanOn : ''}`}
            aria-pressed={selected.has(t.id)}
            disabled={disabled}
            onClick={() => toggle(t.id)}
          >
            {selected.has(t.id) && <span aria-hidden="true">✓ </span>}
            {t.value}
          </button>
        )}
      />
      <p className={styles.help}>{selected.size} bagian ditandai. Ketuk lagi untuk membatalkan.</p>
    </div>
  );
}

/** Tabel Diketahui–Ditanya (F2). */
export function KnownAskedStep({ step, value, onChange, disabled }) {
  const known = value?.known?.length ? value.known : [{ label: '', value: '' }];
  const asked = value?.asked ?? '';
  const set = (patch) => onChange({ known, asked, ...patch });
  const setRow = (i, k, v) => set({ known: known.map((r, j) => (j === i ? { ...r, [k]: v } : r)) });

  return (
    <div className={styles.field}>
      <div className={styles.prompt}>
        <RichText text={step.prompt} as="span" />
      </div>
      <fieldset className={styles.knownBox} disabled={disabled}>
        <legend>Diketahui</legend>
        {known.map((r, i) => (
          <div key={i} className={styles.knownRow}>
            <input
              aria-label={`Keterangan baris ${i + 1}`}
              placeholder="misal: Biaya awal"
              value={r.label}
              onChange={(e) => setRow(i, 'label', e.target.value)}
            />
            <span aria-hidden="true">=</span>
            <input
              aria-label={`Nilai baris ${i + 1}`}
              placeholder="misal: Rp5.000"
              value={r.value}
              onChange={(e) => setRow(i, 'value', e.target.value)}
            />
            <button
              type="button"
              className={styles.rowDel}
              aria-label={`Hapus baris ${i + 1}`}
              onClick={() => set({ known: known.length > 1 ? known.filter((_, j) => j !== i) : known })}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addRow}
          onClick={() => set({ known: [...known, { label: '', value: '' }] })}
        >
          + Tambah baris
        </button>
      </fieldset>
      <label htmlFor={`asked-${step.key}`}>Ditanya</label>
      <input
        id={`asked-${step.key}`}
        placeholder="Apa yang ditanyakan?"
        value={asked}
        disabled={disabled}
        onChange={(e) => set({ asked: e.target.value })}
      />
    </div>
  );
}
