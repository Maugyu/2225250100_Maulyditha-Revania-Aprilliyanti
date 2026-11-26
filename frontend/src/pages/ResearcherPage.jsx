import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Button, Card, DuckMascot, Loading } from '@/components/ui';
import { plainSituation } from '@/lib/content/markup';
import styles from './pages.module.css';

const DATASETS = [
  ['attempts', 'Percobaan aktivitas'],
  ['step_responses', 'Respons per langkah'],
  ['reflections', 'Refleksi'],
  ['assessment_responses', 'Jawaban asesmen'],
  ['rubric_scores', 'Skor rubrik'],
  ['ai_chats', 'Riwayat Tanya Gari (AI) siswa'],
  ['diagnostics', 'Diagnostik RMT (fase kognitif & asesmen dinamis)'],
];

const PHASE_INFO = {
  input: { label: 'Input', desc: 'mengumpulkan informasi (membaca soal, koordinat)' },
  elaborasi: { label: 'Elaborasi', desc: 'mengolah & merelasikan (rencana, m vs c, urutan titik)' },
  output: { label: 'Output', desc: 'mengekspresikan dengan presisi (tanda, hitungan)' },
};

function DiagnosticsTab({ code }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.researcher.diagnostics(code).then(setData);
  }, [code]);
  if (!data) return <Loading />;
  const bar = (n, max) => (
    <span className={styles.diagBar}>
      <span style={{ width: `${max ? (n / max) * 100 : 0}%` }} />
      <b>{n}</b>
    </span>
  );
  const maxErr = Math.max(1, ...data.students.flatMap((s) => Object.values(s.errors)));
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <h2 style={{ marginTop: 0 }}>Diagnostik Rigorous Mathematical Thinking</h2>
        <p className={styles.muted}>
          <b>Fase kognitif</b> (Feuerstein): jumlah kesalahan latihan yang dipetakan ke fase{' '}
          {Object.values(PHASE_INFO)
            .map((p) => `${p.label} — ${p.desc}`)
            .join('; ')}
          . <b>Asesmen dinamis</b>: langkah yang akhirnya benar <i>mandiri</i>, benar setelah <i>mediasi</i> petunjuk,
          atau <i>dibuka</i> pembahasannya — gambaran potensi belajar.
        </p>
        <p className={styles.muted}>
          ⚠️ Pemetaan kode kesalahan → fase adalah hipotesis kerja, belum divalidasi. Gunakan sebagai petunjuk awal
          untuk observasi/wawancara, bukan diagnosis individu.
        </p>
      </Card>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Kode siswa</th>
              <th>Input</th>
              <th>Elaborasi</th>
              <th>Output</th>
              <th>Fase dominan</th>
              <th>Kode tersering</th>
              <th>Mandiri</th>
              <th>Dimediasi</th>
              <th>Dibuka</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s) => (
              <tr key={s.username}>
                <td>{s.username}</td>
                <td>{bar(s.errors.input, maxErr)}</td>
                <td>{bar(s.errors.elaborasi, maxErr)}</td>
                <td>{bar(s.errors.output, maxErr)}</td>
                <td>{s.dominant_phase ? <b>{PHASE_INFO[s.dominant_phase].label}</b> : '—'}</td>
                <td>{s.top_codes.join(', ') || '—'}</td>
                <td>{s.dynamic.mandiri}</td>
                <td>{s.dynamic.dimediasi}</td>
                <td>{s.dynamic.dibuka}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const STATUS_ICON = { completed: '✓', in_progress: '◐', not_started: '○' };

function ClassTab({ code }) {
  const [data, setData] = useState(null);
  const load = useCallback(() => {
    api.researcher.progress(code).then(setData);
  }, [code]);
  useEffect(load, [load]);
  if (!data) return <Loading />;

  const toggle = async (a) => {
    await api.researcher.toggle(code, a.id, !a.is_open);
    load();
  };

  const toggleAi = async () => {
    const on = !data.ai_student_enabled;
    if (
      on &&
      !window.confirm(
        'Aktifkan "Tanya Gari" (AI Gemini) untuk siswa kelas ini?\n\n' +
          'Pastikan persetujuan orang tua/wali sudah terkumpul dan pemakaiannya didampingi orang tua. ' +
          'Ketentuan Gemini API mensyaratkan pengguna 18+ (lihat ADR-018).',
      )
    )
      return;
    await api.researcher.toggleStudentAi(code, on);
    load();
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <section className={styles.aiBox}>
        <h2 style={{ margin: 0 }}>Tanya Gari (AI) untuk siswa</h2>
        <p className={styles.muted}>
          Status: <b>{data.ai_student_enabled ? 'Diizinkan' : 'Mati'}</b>. Siswa tetap harus mengonfirmasi
          “Orang tuaku sedang mendampingi” setiap sesi. Riwayat percakapan dapat diekspor di tab Ekspor data.
        </p>
        <div>
          <Button size="sm" onClick={toggleAi}>
            {data.ai_student_enabled ? 'Matikan untuk kelas ini' : 'Izinkan untuk kelas ini'}
          </Button>
        </div>
      </section>
      <section>
        <h2>Asesmen</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Asesmen</th>
                <th>Status</th>
                <th>Terkirim</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.assessments.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.is_open ? 'Dibuka' : 'Ditutup'}</td>
                  <td>{a.submitted}</td>
                  <td>
                    <Button size="sm" onClick={() => toggle(a)}>
                      {a.is_open ? 'Tutup' : 'Buka'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2>Progres siswa</h2>
        <p className={styles.muted}>✓ selesai · ◐ sedang · ○ belum mulai</p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kode siswa</th>
                {data.units.map((u) => (
                  <th key={u.slug} title={u.title}>
                    U{u.order_index}
                  </th>
                ))}
                <th>Petunjuk</th>
                <th>Terakhir aktif</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s) => (
                <tr key={s.username}>
                  <td>{s.username}</td>
                  {data.units.map((u) => (
                    <td key={u.slug} aria-label={s.units[u.slug]}>
                      {STATUS_ICON[s.units[u.slug]]}
                    </td>
                  ))}
                  <td>{s.hints_used}</td>
                  <td>{s.last_active_at ? new Date(s.last_active_at).toLocaleString('id-ID') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ExportTab({ code }) {
  const [msg, setMsg] = useState('');
  const download = async (dataset) => {
    setMsg('');
    try {
      const blob = await api.researcher.exportCsv(dataset, code);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${code}_${dataset}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setMsg(e.message);
    }
  };
  return (
    <div className={styles.links}>
      <p className={styles.muted}>File CSV memakai kode siswa (pseudonim), bukan identitas asli.</p>
      {DATASETS.map(([key, label]) => (
        <button key={key} type="button" className={styles.linkRow} onClick={() => download(key)}>
          {label} <span>⬇ CSV</span>
        </button>
      ))}
      {msg && <p className={styles.error}>{msg}</p>}
    </div>
  );
}

const INDICATOR_NAMES = {
  F1: 'Memahami informasi',
  F2: 'Mengidentifikasi masalah',
  F3: 'Merumuskan model',
  E1: 'Memilih strategi',
  E2: 'Konsep & prosedur',
  E3: 'Penalaran',
  I1: 'Menafsirkan hasil',
  I2: 'Mengevaluasi dalam konteks',
};

function AiNotice({ ai }) {
  if (ai?.enabled) return null;
  return (
    <p className={styles.muted}>
      ✨ Bantuan AI belum aktif. Isi <code>GEMINI_API_KEY</code> di <code>backend/.env</code>, lalu jalankan ulang
      backend.
    </p>
  );
}

function ScoringTab({ ai }) {
  const [queue, setQueue] = useState(null);
  const [i, setI] = useState(0);
  const [scores, setScores] = useState({});
  const [saved, setSaved] = useState('');
  const [suggest, setSuggest] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  useEffect(() => {
    api.researcher.queue().then(setQueue);
  }, []);
  if (!queue) return <Loading />;
  if (!queue.length) return <p className={styles.muted}>Belum ada jawaban asesmen yang terkirim.</p>;
  const item = queue[i];
  const current = { ...Object.fromEntries(Object.entries(item.my_scores).map(([k, v]) => [k, v.score])), ...scores };

  const save = async () => {
    const entries = Object.entries(current).map(([indicator, score]) => ({ indicator, score }));
    if (!entries.length) return;
    await api.researcher.score(item.item_response_id, entries);
    setSaved('Tersimpan ✓');
  };
  const go = (d) => {
    setI((v) => Math.min(queue.length - 1, Math.max(0, v + d)));
    setScores({});
    setSaved('');
    setSuggest(null);
    setAiError('');
  };

  const askAi = async () => {
    setAiBusy(true);
    setAiError('');
    try {
      setSuggest(await api.researcher.aiScore(item.item_response_id));
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiBusy(false);
    }
  };
  const applyAi = () =>
    setScores((s) => ({ ...s, ...Object.fromEntries(suggest.suggestions.map((x) => [x.indicator, x.score])) }));

  return (
    <Card>
      <p className={styles.muted}>
        Penilaian buta · jawaban {i + 1} dari {queue.length} · butir <b>{item.item_key}</b>
      </p>
      <h3>{item.prompt.title}</h3>
      <p>{plainSituation(item.prompt.situation)}</p>
      <div className={styles.pre}>
        {item.prompt.steps.map((s) => `• ${s.prompt}\n  → ${JSON.stringify(item.response?.[s.key] ?? '—')}`).join('\n')}
      </div>
      <p className={styles.muted}>Skor otomatis awal: {JSON.stringify(item.auto_scores || {})}</p>
      <AiNotice ai={ai} />
      {ai?.enabled && (
        <div className={styles.aiBox}>
          <Button size="sm" onClick={askAi} disabled={aiBusy}>
            {aiBusy ? 'Gari sedang membaca…' : '✨ Minta saran skor dari Gari (AI)'}
          </Button>
          {aiError && <p className={styles.error}>{aiError}</p>}
          {suggest && (
            <>
              <p className={styles.muted}>
                Saran AI ({suggest.model}) — <b>bukan skor final</b>. Periksa alasannya; Anda yang memutuskan.
              </p>
              <ul className={styles.aiList}>
                {suggest.suggestions.map((x) => (
                  <li key={x.indicator}>
                    <b>
                      {x.indicator} = {x.score}
                    </b>{' '}
                    — {x.reason}
                  </li>
                ))}
              </ul>
              {suggest.overall_note && <p className={styles.muted}>{suggest.overall_note}</p>}
              <Button size="sm" variant="ghost" onClick={applyAi}>
                Isi pilihan skor dengan saran ini (belum disimpan)
              </Button>
            </>
          )}
        </div>
      )}
      <div className={styles.scoreGrid}>
        {item.indicators.map((ind) => (
          <div key={ind} className={styles.scoreRow} role="radiogroup" aria-label={`${ind} ${INDICATOR_NAMES[ind]}`}>
            <b title={INDICATOR_NAMES[ind]}>{ind}</b>
            {[0, 1, 2, 3].map((sc) => (
              <Button
                key={sc}
                size="sm"
                variant={current[ind] === sc ? 'primary' : 'secondary'}
                aria-pressed={current[ind] === sc}
                onClick={() => setScores((s) => ({ ...s, [ind]: sc }))}
              >
                {sc}
              </Button>
            ))}
            <span className={styles.muted}>{INDICATOR_NAMES[ind]}</span>
          </div>
        ))}
      </div>
      <div className={styles.assessActions}>
        <Button onClick={() => go(-1)} disabled={i === 0}>
          ‹ Sebelumnya
        </Button>
        <Button onClick={save}>Simpan skor</Button>
        <span className={styles.saved}>{saved}</span>
        <Button onClick={() => go(1)} disabled={i === queue.length - 1}>
          Berikutnya ›
        </Button>
      </div>
    </Card>
  );
}

function SummaryTab({ code, ai }) {
  const [units, setUnits] = useState([]);
  const [unit, setUnit] = useState('');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.module('pgl').then((m) => {
      const req = m.units.filter((u) => !u.is_optional);
      setUnits(req);
      if (req.length) setUnit(req[0].slug);
    });
  }, []);
  const run = async () => {
    setBusy(true);
    setErr('');
    setRes(null);
    try {
      setRes(await api.researcher.aiSummary(code, unit));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  const List = ({ title, items }) => (
    <section>
      <h3>{title}</h3>
      <ul className={styles.aiList}>
        {(items || []).map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  );
  return (
    <Card>
      <p className={styles.muted}>
        Gari (AI) merangkum refleksi “Jelaskan ke temanmu” satu kelas. Teks dikirim ke Google tanpa kode siswa. Hasilnya
        deskriptif — bukan penilaian individu.
      </p>
      <AiNotice ai={ai} />
      <div className={styles.row}>
        <label htmlFor="sum-unit">Unit</label>
        <select id="sum-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
          {units.map((u) => (
            <option key={u.slug} value={u.slug}>
              U{u.order_index} · {u.title}
            </option>
          ))}
        </select>
        <Button onClick={run} disabled={!ai?.enabled || busy || !unit}>
          {busy ? 'Merangkum…' : '✨ Buat ringkasan'}
        </Button>
      </div>
      {err && <p className={styles.error}>{err}</p>}
      {res && (
        <div className={styles.aiBox}>
          <p className={styles.muted}>
            {res.reflection_count} refleksi · model {res.model}
          </p>
          <List title="Pemahaman yang tampak" items={res.understood} />
          <List title="Miskonsepsi / kesulitan" items={res.misconceptions} />
          <section>
            <h3>Pola keyakinan</h3>
            <p>{res.confidence_pattern}</p>
          </section>
          <List title="Saran tindak lanjut" items={res.teaching_suggestions} />
        </div>
      )}
    </Card>
  );
}

export default function ResearcherPage() {
  const [classes, setClasses] = useState(null);
  const [code, setCode] = useState('');
  const [tab, setTab] = useState('kelas');
  const [ai, setAi] = useState(null);

  useEffect(() => {
    api.researcher.aiStatus().then(setAi).catch(() => setAi({ enabled: false }));
  }, []);

  useEffect(() => {
    api.researcher.classes().then((c) => {
      setClasses(c);
      if (c.length) setCode(c[0].code);
    });
  }, []);
  if (!classes) return <Loading />;

  return (
    <div className={styles.page}>
      <div className={styles.mapHead}>
        <DuckMascot size={72} hat="grad" glasses />
        <div>
          <h1>Area Peneliti</h1>
          <p className={styles.muted}>Akun siswa dibuat lewat CLI backend (lihat README).</p>
        </div>
      </div>
      {classes.length === 0 ? (
        <p>Belum ada kelas. Buat dengan: <code>python -m app.cli create-students --class KLS8A --count 30</code></p>
      ) : (
        <>
          <div className={styles.row}>
            <label htmlFor="cls">Kelas</label>
            <select id="cls" value={code} onChange={(e) => setCode(e.target.value)}>
              {classes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.label} ({c.student_count} siswa)
                </option>
              ))}
            </select>
          </div>
          <div className={styles.tabs} role="tablist">
            {[
              ['kelas', 'Kelas & asesmen'],
              ['ekspor', 'Ekspor data'],
              ['nilai', 'Penilaian rubrik'],
              ['diagnostik', 'Diagnostik RMT'],
              ['ringkas', 'Ringkasan refleksi (AI)'],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                className={`${styles.tab} ${tab === k ? styles.tabOn : ''}`}
                onClick={() => setTab(k)}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === 'kelas' && <ClassTab key={code} code={code} />}
          {tab === 'ekspor' && <ExportTab code={code} />}
          {tab === 'nilai' && <ScoringTab ai={ai} />}
          {tab === 'diagnostik' && <DiagnosticsTab key={code} code={code} />}
          {tab === 'ringkas' && <SummaryTab key={code} code={code} ai={ai} />}
        </>
      )}
    </div>
  );
}
