import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api/client';
import { useOnline } from '@/features/auth/SessionContext';
import RichText from '@/components/ui/RichText';
import { plainSituation } from '@/lib/content/markup';
import { Button, Card, DuckMascot, Loading } from '@/components/ui';
import { DefineVariablesStep, LinearModelStep, NumericStep, OpenStep } from '@/features/player/steps/BasicSteps';
import { IdentifyInfoStep } from '@/features/player/steps/ContextSteps';
import styles from './pages.module.css';

/** Renderer asesmen memakai komponen latihan tanpa petunjuk & tanpa umpan balik (PP-09). */
const RENDERERS = {
  identify_info: IdentifyInfoStep,
  define_variables: DefineVariablesStep,
  linear_model: LinearModelStep,
  numeric: NumericStep,
  interpret: OpenStep,
  evaluate: OpenStep,
  explain: OpenStep,
};

export function AssessmentListPage() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.myAssessments().then(setList).catch((e) => setError(e.message));
  }, []);
  if (error) return <div className={styles.page}><p className={styles.error}>{error}</p></div>;
  if (!list) return <Loading />;
  return (
    <div className={`${styles.page} ${styles.narrow}`}>
      <div className={styles.mapHead}>
        <DuckMascot size={80} hat="beanie" />
        <div>
          <h1>Asesmen</h1>
          <p className={styles.muted}>Asesmen dibuka oleh guru/peneliti. Hasilnya bukan untuk nilai rapor.</p>
        </div>
      </div>
      <div className={styles.links}>
        {list.map((a) => {
          const done = a.submission_status === 'submitted';
          const label = done ? 'sudah dikirim' : a.is_open ? 'dibuka' : 'belum dibuka';
          return a.is_open && !done ? (
            <Link key={a.id} to={`/asesmen/${a.id}`} className={styles.linkRow}>
              {a.title} · {a.item_count} masalah <span className={styles.tag}>{label}</span>
            </Link>
          ) : (
            <div key={a.id} className={styles.linkRow} aria-disabled="true">
              {a.title} <span className={styles.tag}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AssessmentRunPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const online = useOnline();
  const [sub, setSub] = useState(null);
  const [responses, setResponses] = useState({});
  const [current, setCurrent] = useState(0);
  const [savedAt, setSavedAt] = useState({});
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const timers = useRef({});

  useEffect(() => {
    api
      .startSubmission(id)
      .then((s) => {
        setSub(s);
        setResponses(s.responses || {});
        if (s.status === 'submitted') setError('Asesmen ini sudah kamu kirim.');
      })
      .catch((e) => setError(e.isNetwork ? 'Sambungkan internet untuk mengerjakan asesmen.' : e.message));
  }, [id]);

  if (error)
    return (
      <div className={`${styles.page} ${styles.narrow}`}>
        <p className={styles.error}>{error}</p>
        <Button to="/beranda">Kembali ke Beranda</Button>
      </div>
    );
  if (!sub) return <Loading />;

  if (!started) {
    return (
      <div className={`${styles.page} ${styles.narrow}`}>
        <Card>
          <div className={styles.mapHead}>
            <DuckMascot size={88} hat="grad" mood="think" />
            <div>
              <h1>{sub.assessment.title}</h1>
              <p className={styles.muted}>{sub.items.length} masalah · perkiraan 40 menit</p>
            </div>
          </div>
          <RichText text={sub.assessment.instructions} />
          <Button variant="primary" onClick={() => setStarted(true)}>
            Mulai
          </Button>
        </Card>
      </div>
    );
  }

  const item = sub.items[current];
  const itemResp = responses[item.id] || {};

  const save = (itemId, data) => {
    clearTimeout(timers.current[itemId]);
    timers.current[itemId] = setTimeout(async () => {
      try {
        await api.saveItem(sub.id, itemId, data);
        setSavedAt((s) => ({ ...s, [itemId]: new Date() }));
      } catch (e) {
        setSavedAt((s) => ({ ...s, [itemId]: e.isNetwork ? 'offline' : 'error' }));
      }
    }, 700);
  };

  const setStep = (stepKey, v) => {
    const next = { ...itemResp, [stepKey]: v };
    setResponses((r) => ({ ...r, [item.id]: next }));
    save(item.id, next);
  };

  const submit = async () => {
    if (!window.confirm('Kirim semua jawaban? Setelah dikirim, jawaban tidak bisa diubah lagi.')) return;
    try {
      await api.submit(sub.id);
      navigate('/beranda', { replace: true });
    } catch (e) {
      setError(e.message);
    }
  };

  const status = savedAt[item.id];
  return (
    <div className={`${styles.page} ${styles.narrow}`}>
      {!online && <p className={styles.error}>Kamu offline. Sambungkan internet agar jawaban tersimpan.</p>}
      <nav className={styles.itemNav} aria-label="Pilih masalah">
        {sub.items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            className={`${styles.itemBtn} ${i === current ? styles.itemBtnOn : ''}`}
            aria-current={i === current ? 'step' : undefined}
            onClick={() => setCurrent(i)}
          >
            {i + 1}
          </button>
        ))}
      </nav>
      <Card>
        <h1 style={{ fontSize: 'var(--text-xl)' }}>{item.prompt.title}</h1>
        {item.prompt.steps.every((s) => s.type !== 'identify_info') && (
          <RichText text={plainSituation(item.prompt.situation)} />
        )}
        {item.prompt.steps.map((s) => {
          const R = RENDERERS[s.type];
          if (!R) return null;
          return (
            <div key={s.key} className={styles.subStep}>
              <R
                step={s}
                situation={item.prompt.situation}
                value={itemResp[s.key]}
                onChange={(v) => setStep(s.key, v)}
                disabled={false}
                solved={false}
              />
            </div>
          );
        })}
        <p className={styles.saved} aria-live="polite">
          {status instanceof Date
            ? `Tersimpan ✓ ${status.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
            : status === 'offline'
              ? 'Belum tersimpan (offline)'
              : status === 'error'
                ? 'Gagal menyimpan'
                : ''}
        </p>
      </Card>
      <div className={styles.assessActions}>
        <Button onClick={() => setCurrent(current - 1)} disabled={current === 0}>
          ‹ Sebelumnya
        </Button>
        {current < sub.items.length - 1 ? (
          <Button variant="primary" onClick={() => setCurrent(current + 1)}>
            Berikutnya ›
          </Button>
        ) : (
          <Button variant="primary" onClick={submit} disabled={!online}>
            Kirim jawaban
          </Button>
        )}
      </div>
    </div>
  );
}
