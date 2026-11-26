import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, request } from '@/lib/api/client';
import { useSession } from '@/features/auth/SessionContext';
import { hasChosenSkin, useSkin } from '@/lib/storage/skin';
import { Button, DuckMascot, Loading } from '@/components/ui';
import { IconChevron } from '@/components/icons';
import { playSound } from '@/lib/sound';
import styles from './home.module.css';

const DAY_LABELS = ['S', 'S', 'R', 'K', 'J', 'S', 'M']; // Senin … Minggu

function localISO(d) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

/** Senin–Minggu pekan ini dengan status aktif/hari ini/mendatang. */
function weekDays(activeDays) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const set = new Set(activeDays);
  const todayIso = localISO(today);
  return DAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = localISO(d);
    return { label, iso, active: set.has(iso), today: iso === todayIso, future: iso > todayIso };
  });
}

function Ring({ done, total, label }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true" className={styles.ring}>
      <circle cx="26" cy="26" r={r} className={styles.ringTrack} />
      {pct > 0 && (
        <circle
          cx="26"
          cy="26"
          r={r}
          className={pct >= 1 ? styles.ringDone : styles.ringFill}
          strokeDasharray={`${c * pct} ${c}`}
          transform="rotate(-90 26 26)"
        />
      )}
      <text x="26" y="31" textAnchor="middle" className={styles.ringText}>
        {pct >= 1 ? '✓' : label}
      </text>
    </svg>
  );
}

export default function HomePage() {
  const { user } = useSession();
  const skin = useSkin(user.username);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [hop, setHop] = useState(false);
  const hopTimer = useRef(null);

  // Gari diketuk: melompat sekali + "kwek" (ADR-022).
  const pokeGari = () => {
    playSound('quack');
    setHop(false);
    clearTimeout(hopTimer.current);
    requestAnimationFrame(() => setHop(true));
    hopTimer.current = setTimeout(() => setHop(false), 650);
  };
  useEffect(() => () => clearTimeout(hopTimer.current), []);

  useEffect(() => {
    const tz = new Date().getTimezoneOffset();
    Promise.all([
      api.resume(),
      request(`/me/progress?tz=${tz}`),
      api.module('pgl'),
      api.myAssessments().catch(() => []),
    ])
      .then(([resume, progress, module, assessments]) => setData({ resume, progress, module, assessments }))
      .catch((e) => setError(e.message));
  }, []);

  if (error && !data) return <p className={styles.error}>{error}</p>;
  if (!data) return <Loading />;

  const { resume, progress, module, assessments } = data;
  const act = progress.activities || {};
  const firstSteps = [
    { label: 'Pilih skin Gari-mu', done: hasChosenSkin(user.username), time: '± 1 menit', to: '/gari' },
    { label: 'Selesaikan “Tabungan Dina” (U1)', done: act['u1-jelajah'] === 'completed', time: '± 10 menit', unit: 'u1-tabel-grafik' },
    { label: 'Coba Penjelajah Gradien (U2)', done: act['u2-jelajah'] === 'completed', time: '± 8 menit', unit: 'u2-gradien' },
    { label: 'Tulis refleksi pertamamu', done: progress.reflections > 0, time: '± 5 menit', to: '/modul/pgl' },
  ];
  const firstDone = firstSteps.filter((s) => s.done).length;
  const unitById = Object.fromEntries(module.units.map((u) => [u.slug, u]));
  const linkFor = (s) => s.to || `/aktivitas/${unitById[s.unit]?.activities[0]?.id}`;

  const days = weekDays(progress.active_days || []);
  const activeCount = days.filter((d) => d.active).length;
  const remaining = progress.total_required_units - progress.completed_units;
  const next = resume.activity_id ? `/aktivitas/${resume.activity_id}` : '/modul/pgl';
  const openAssess = assessments.filter((a) => a.is_open && a.submission_status !== 'submitted');

  const missions = module.units
    .filter((u) => !u.is_optional)
    .map((u) => {
      const p = progress.units.find((x) => x.slug === u.slug) || {};
      const nextAct = u.activities.find((a) => act[a.slug] !== 'completed') || u.activities[0];
      return { ...u, ...p, nextAct };
    });

  return (
    <div className={styles.page}>
      {firstDone < firstSteps.length && (
        <section className={styles.card} aria-labelledby="first-title">
          <div className={styles.cardHead}>
            <h2 id="first-title">Langkah pertama</h2>
            <span className={styles.count}>
              {firstDone} / {firstSteps.length}
            </span>
          </div>
          <div className={styles.bar} role="progressbar" aria-valuenow={firstDone} aria-valuemin={0} aria-valuemax={firstSteps.length} aria-label="Langkah pertama">
            <div style={{ width: `${(firstDone / firstSteps.length) * 100}%` }} />
          </div>
          <ul className={styles.checklist}>
            {firstSteps.map((s) => (
              <li key={s.label}>
                <Link to={linkFor(s)} className={`${styles.checkItem} ${s.done ? styles.checkDone : ''}`}>
                  <span className={styles.checkCircle} aria-hidden="true">
                    {s.done ? '✓' : ''}
                  </span>
                  <span className={styles.checkLabel}>
                    {s.label}
                    <span className="visually-hidden">{s.done ? ' (selesai)' : ''}</span>
                  </span>
                  <span className={styles.checkTime}>{s.time}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Button variant="primary" to={next}>
            {resume.is_new ? 'Mulai Belajar' : 'Lanjutkan Belajar'}
          </Button>
        </section>
      )}

      <div className={styles.row}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroText}>
            <p className={styles.heroHello}>
              Halo {user.username}, {remaining > 0 ? `${remaining} unit lagi menuju akhir modul` : 'semua unit sudah selesai!'}
            </p>
            <h1 id="hero-title">{resume.activity_id ? resume.unit_title : 'Ulangi materi favoritmu'}</h1>
            <p className={styles.heroSub}>{resume.activity_id ? `Berikutnya: ${resume.activity_title}` : 'Pilih unit mana saja.'}</p>
            <hr className={styles.heroSep} />
            <div className={styles.heroBottom}>
              <div className={styles.heroProgress}>
                <span>
                  Progres modul <b>{progress.completed_units}</b> / {progress.total_required_units} unit
                </span>
                <div className={styles.heroBar}>
                  <div style={{ width: `${(progress.completed_units / progress.total_required_units) * 100}%` }} />
                </div>
              </div>
              <Link to={next} className={styles.heroBtn}>
                {resume.is_new ? 'Mulai' : 'Lanjut'}
              </Link>
            </div>
          </div>
          <button
            type="button"
            className={styles.heroDuckBtn}
            onClick={pokeGari}
            aria-label="Sapa Gari"
            data-sound="none"
          >
            <DuckMascot size={250} skin={skin} mood="cheer" className={styles.heroDuck} animated hop={hop} />
          </button>
        </section>

        <section className={styles.days} aria-labelledby="days-title">
          <div className={styles.cardHead}>
            <h2 id="days-title" className={styles.daysTitle}>
              <span aria-hidden="true">🔥</span> {activeCount} hari
            </h2>
            <Link to="/modul/pgl" className={styles.more}>
              Materi <IconChevron />
            </Link>
          </div>
          <p className={styles.muted}>{activeCount} dari 7 hari belajar minggu ini</p>
          <ol className={styles.dayList}>
            {days.map((d) => (
              <li
                key={d.iso}
                className={`${styles.day} ${d.active ? styles.dayOn : ''} ${d.today ? styles.dayToday : ''} ${d.future ? styles.dayFuture : ''}`}
                aria-label={`${d.iso}${d.active ? ', belajar' : ''}${d.today ? ', hari ini' : ''}`}
              >
                {d.active ? '✓' : d.label}
              </li>
            ))}
          </ol>
          <p className={styles.tip}>Belajar sedikit-sedikit tetap berarti. Tidak ada yang hilang kalau kamu libur.</p>
        </section>
      </div>

      <section className={styles.card} aria-labelledby="mission-title">
        <div className={styles.cardHead}>
          <h2 id="mission-title">
            Misi belajar <span className={styles.dot} aria-hidden="true" />
          </h2>
          <Link to="/modul/pgl" className={styles.more}>
            Lihat semua <IconChevron />
          </Link>
        </div>
        <ul className={styles.missions}>
          {openAssess.map((a) => (
            <li key={`a${a.id}`} className={styles.mission}>
              <span className={styles.assessIcon} aria-hidden="true">
                📝
              </span>
              <div className={styles.missionText}>
                <strong>{a.title}</strong>
                <span>Dibuka oleh guru · {a.item_count} masalah</span>
              </div>
              <Link to={`/asesmen/${a.id}`} className={styles.pill}>
                Kerjakan
              </Link>
            </li>
          ))}
          {missions.map((m) => (
            <li key={m.slug} className={styles.mission}>
              <Ring done={m.activities_done || 0} total={m.activities_total || m.activities.length} label={`U${m.order_index}`} />
              <div className={styles.missionText}>
                <strong>{m.title}</strong>
                <span>
                  {m.status === 'completed'
                    ? 'Selesai'
                    : `${m.activities_done || 0} dari ${m.activities_total || m.activities.length} aktivitas`}
                </span>
              </div>
              <Link to={`/aktivitas/${m.nextAct.id}`} className={styles.pill}>
                {m.status === 'completed' ? 'Ulangi' : m.status === 'in_progress' ? 'Lanjut' : 'Mulai'}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
