import { useSession } from '@/features/auth/SessionContext';
import { setSkin, useSkin } from '@/lib/storage/skin';
import { DuckMascot } from '@/components/ui';
import { SKINS } from '@/components/ui/DuckMascot';
import styles from './skin.module.css';

/** Gari-ku: pilih skin bebas (personalisasi, tidak perlu dikumpulkan — PP-10). */
export default function SkinPage() {
  const { user } = useSession();
  const current = useSkin(user.username);
  const skin = SKINS.find((s) => s.id === current);

  return (
    <div className={styles.page}>
      <section className={styles.stage} aria-live="polite">
        <span className={styles.bubble}>Halo! Aku Gari {skin.name}.</span>
        <DuckMascot size={230} skin={current} mood="cheer" title={`Gari dengan skin ${skin.name}`} />
        <div>
          <h1>Gari-ku</h1>
          <p>Pilih penampilan Gari yang menemanimu belajar. Semua skin bebas dipakai kapan saja.</p>
        </div>
      </section>

      <ul className={styles.grid} aria-label="Pilihan skin">
        {SKINS.map((s) => {
          const on = s.id === current;
          return (
            <li key={s.id}>
              <button
                type="button"
                className={`${styles.option} ${on ? styles.optionOn : ''}`}
                aria-pressed={on}
                onClick={() => setSkin(user.username, s.id)}
              >
                <DuckMascot size={96} skin={s.id} />
                <span>{s.name}</span>
                {on && <span className={styles.badge}>Dipakai</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
