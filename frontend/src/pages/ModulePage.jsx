import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api/client';
import { DuckMascot, Loading } from '@/components/ui';
import styles from './pages.module.css';

const STATUS = {
  completed: { label: 'selesai', icon: '✓', cls: styles.badgeDone },
  in_progress: { label: 'sedang dipelajari', icon: '◐', cls: styles.badgeProgress },
  not_started: { label: 'belum mulai', icon: null, cls: '' },
};
const PHASE = {
  hook: 'Pemantik',
  explore: 'Jelajah',
  example: 'Contoh & latihan',
  guided: 'Latihan terbimbing',
  practice: 'Latihan',
  context_problem: 'Masalah kontekstual',
  reflect: 'Refleksi',
};

export default function ModulePage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const [mod, setMod] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.module(slug).then(setMod).catch((e) => setError(e.message));
    api.progress().then(setProgress).catch(() => setProgress(null));
  }, [slug]);

  if (error) return <div className={styles.page}><p className={styles.error}>{error}</p></div>;
  if (!mod) return <Loading />;

  const statusOf = (u) => progress?.units.find((p) => p.slug === u.slug)?.status || 'not_started';
  const suggested = mod.units.find((u) => !u.is_optional && statusOf(u) !== 'completed')?.slug;
  const finished = params.get('selesai');
  const finishedUnit = mod.units.find((u) => u.slug === finished);

  return (
    <div className={`${styles.page} ${styles.narrow}`}>
      <div className={styles.mapHead}>
        <DuckMascot size={80} hat="grad" />
        <div>
          <h1>{mod.title}</h1>
          <p className={styles.muted}>Unit tidak dikunci — urutan yang disarankan ditandai.</p>
        </div>
      </div>

      {finishedUnit && (
        <div className={styles.done} role="status">
          <DuckMascot size={48} hat="none" mood="cheer" /> Hebat! Kamu menyelesaikan “{finishedUnit.title}”.
        </div>
      )}

      <ol className={styles.units}>
        {mod.units.map((u) => {
          const st = STATUS[statusOf(u)];
          const isSuggested = u.slug === suggested;
          return (
            <li key={u.slug} className={`${styles.unit} ${isSuggested ? styles.unitSuggested : ''}`}>
              <div className={styles.unitTop}>
                <span className={`${styles.badge} ${st.cls}`} aria-hidden="true">
                  {st.icon || `U${u.order_index}`}
                </span>
                <div>
                  <h2>
                    U{u.order_index} · {u.title}
                  </h2>
                  <p className={styles.muted}>{u.goal}</p>
                  <div className={styles.tags}>
                    <span className={styles.tag}>{st.label}</span>
                    {u.is_optional && <span className={styles.tag}>opsional</span>}
                    {isSuggested && <span className={`${styles.tag} ${styles.tagHot}`}>disarankan berikutnya</span>}
                  </div>
                </div>
              </div>
              <ul className={styles.acts}>
                {u.activities.map((a) => (
                  <li key={a.id}>
                    <Link to={`/aktivitas/${a.id}`}>
                      <span aria-hidden="true">▸</span> {a.title}
                      <span className={styles.tag}>{PHASE[a.phase] || a.phase}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
