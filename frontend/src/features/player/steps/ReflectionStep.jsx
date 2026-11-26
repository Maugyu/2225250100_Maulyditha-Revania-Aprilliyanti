import RichText from '@/components/ui/RichText';
import { DuckMascot } from '@/components/ui';
import { useSession } from '@/features/auth/SessionContext';
import { useSkin } from '@/lib/storage/skin';
import styles from '../player.module.css';

const LEVELS = ['Belum yakin', 'Agak yakin', 'Yakin', 'Sangat yakin'];

/** "Jelaskan ke temanmu" + tingkat keyakinan; pola langkah tampil SETELAH menulis (F-12, GL04). */
export default function ReflectionStep({ step, value, onChange, solved }) {
  const v = value || {};
  const id = `refl-${step.key}`;
  const { user } = useSession() || {};
  const skin = useSkin(user?.username);
  return (
    <div className={styles.field}>
      <div className={styles.reflectHead}>
        <DuckMascot size={64} skin={skin} mood="happy" />
        <label htmlFor={id} className={styles.prompt}>
          <RichText text={step.prompt} as="span" />
        </label>
      </div>
      <textarea
        id={id}
        maxLength={500}
        value={v.text || ''}
        disabled={solved}
        placeholder="Jelaskan seperti sedang mengajari teman…"
        onChange={(e) => onChange({ ...v, text: e.target.value })}
      />
      {step.transfer_prompt && (
        <>
          <label htmlFor={`${id}-transfer`} className={styles.prompt}>
            🌱 <RichText text={step.transfer_prompt} as="span" />
          </label>
          <textarea
            id={`${id}-transfer`}
            maxLength={300}
            value={v.transfer || ''}
            disabled={solved}
            placeholder="Boleh singkat, satu contoh saja."
            onChange={(e) => onChange({ ...v, transfer: e.target.value })}
          />
        </>
      )}
      <fieldset className={styles.confidence} disabled={solved}>
        <legend>Seberapa yakin kamu dengan penjelasanmu?</legend>
        {LEVELS.map((label, i) => (
          <label key={label} className={`${styles.confOpt} ${v.confidence === i + 1 ? styles.choiceOn : ''}`}>
            <input
              type="radio"
              name={id}
              checked={v.confidence === i + 1}
              onChange={() => onChange({ ...v, confidence: i + 1 })}
            />
            <b>{i + 1}</b> {label}
          </label>
        ))}
      </fieldset>
      {solved && (
        <div className={styles.pattern}>
          <h3>Pola langkah unit ini</h3>
          <ol>
            {step.pattern.map((p) => (
              <li key={p}>
                <RichText text={p} as="span" />
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
