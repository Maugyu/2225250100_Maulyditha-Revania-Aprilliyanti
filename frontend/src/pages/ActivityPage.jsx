import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, request } from '@/lib/api/client';
import { useSession } from '@/features/auth/SessionContext';
import { GlossaryContext } from '@/components/ui/RichText';
import { Button, Loading } from '@/components/ui';
import ActivityPlayer from '@/features/player/ActivityPlayer';
import styles from './pages.module.css';

export default function ActivityPage() {
  const { id } = useParams();
  const { user } = useSession();
  const [activity, setActivity] = useState(null);
  const [glossary, setGlossary] = useState({});
  const [error, setError] = useState('');
  const [aiAvailable, setAiAvailable] = useState(false);

  useEffect(() => {
    request('/me/ai')
      .then((r) => setAiAvailable(Boolean(r.available)))
      .catch(() => setAiAvailable(false));
  }, []);

  useEffect(() => {
    setActivity(null);
    setError('');
    api
      .activity(id)
      .then(async (a) => {
        setActivity(a);
        try {
          const mod = await api.module(a.module_slug);
          setGlossary(Object.fromEntries(mod.glossary.map((g) => [g.key, g])));
        } catch {
          /* glosarium opsional */
        }
      })
      .catch((e) => setError(e.isNetwork ? 'Aktivitas ini belum tersimpan di perangkatmu. Sambungkan internet dulu.' : e.message));
  }, [id]);

  if (error)
    return (
      <div className={`${styles.page} ${styles.narrow}`}>
        <p className={styles.error}>{error}</p>
        <Button to="/beranda">Kembali ke Beranda</Button>
      </div>
    );
  if (!activity) return <Loading text="Menyiapkan aktivitas…" />;

  return (
    <GlossaryContext.Provider value={glossary}>
      <ActivityPlayer key={activity.id} activity={activity} username={user.username} aiAvailable={aiAvailable} />
    </GlossaryContext.Provider>
  );
}
