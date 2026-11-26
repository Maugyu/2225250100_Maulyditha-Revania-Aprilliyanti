import RichText from '@/components/ui/RichText';
import styles from '../player.module.css';

/**
 * Rencanakan (RMT — Perencanaan Tindakan): siswa menyusun urutan langkah penyelesaian sebelum menghitung,
 * agar tidak menebak-nebak (trial-and-error). Ketuk dari "Pilihan langkah" untuk menambah; ketuk di rencana
 * untuk mengembalikan.
 */
export default function PlanStep({ step, value, onChange, disabled }) {
  const order = value?.order || [];
  const byId = Object.fromEntries(step.items.map((i) => [i.id, i]));
  const pool = step.items.filter((i) => !order.includes(i.id));

  return (
    <div className={styles.field}>
      <div className={styles.prompt}>
        <RichText text={step.prompt} as="span" />
      </div>

      <div className={styles.planBox}>
        <strong>Rencanaku</strong>
        {order.length === 0 ? (
          <p className={styles.help}>Belum ada langkah. Ketuk langkah di bawah sesuai urutan.</p>
        ) : (
          <ol className={styles.planList}>
            {order.map((id, i) => (
              <li key={id}>
                <button
                  type="button"
                  className={`${styles.planItem} ${styles.planChosen}`}
                  disabled={disabled}
                  onClick={() => onChange({ order: order.filter((x) => x !== id) })}
                  aria-label={`Langkah ${i + 1}: ${byId[id].text}. Ketuk untuk mengembalikan.`}
                >
                  <span className={styles.planNum}>{i + 1}</span>
                  <RichText text={byId[id].text} as="span" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      {pool.length > 0 && (
        <div>
          <p className={styles.help}>Pilihan langkah:</p>
          <ul className={styles.planPool}>
            {pool.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.planItem}
                  disabled={disabled}
                  onClick={() => onChange({ order: [...order, item.id] })}
                >
                  <span className={styles.planNum}>+</span>
                  <RichText text={item.text} as="span" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
