import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DuckMascot, FeedbackBox, ProgressBar, SoundToggle } from '@/components/ui';
import { useSkin } from '@/lib/storage/skin';
import RichText from '@/components/ui/RichText';
import { checkStep, isGraded, OPEN_TYPES } from '@/lib/checkers';
import { uuid } from '@/lib/api/client';
import { sendOrQueue } from '@/lib/storage/outbox';
import { drafts } from '@/lib/storage/local';
import { playSound } from '@/lib/sound';
import { plainSituation } from '@/lib/content/markup';
import { STEP_COMPONENTS, PROCESS_LABEL } from './stepRegistry';
import { isExampleComplete } from './steps/WorkedExampleStep';
import HintPanel from './HintPanel';
import styles from './player.module.css';

const OFFER_HINT_AFTER = 2; // US-15 AC3
const OFFER_SOLUTION_AFTER = 3; // F-04

const emptyMeta = { tries: 0, hint: 0, solved: false, revealed: false, feedback: null, code: null };

/**
 * Pemutar aktivitas (F-04): satu langkah per layar, satu aksi utama (PP-02).
 */
export default function ActivityPlayer({ activity, username, aiAvailable = false }) {
  const navigate = useNavigate();
  const skin = useSkin(username);
  const steps = activity.content.steps;
  const situation = activity.content.situation;

  const restored = useMemo(() => {
    const d = drafts.load(username, activity.id);
    const server = activity.current_attempt;
    if (d && (!server || d.attemptClientId === server.client_id)) return d;
    if (server) {
      const idx = Math.max(0, steps.findIndex((s) => s.key === server.last_step_key));
      return { attemptClientId: server.client_id, index: idx, answers: {}, meta: {} };
    }
    return null;
  }, [activity, username, steps]);

  const [attemptId] = useState(() => restored?.attemptClientId || uuid());
  const [index, setIndex] = useState(restored?.index || 0);
  const [answers, setAnswers] = useState(restored?.answers || {});
  const [meta, setMeta] = useState(restored?.meta || {});
  const [panel, setPanel] = useState(null); // null | 'hint' | 'gari'
  const [busy, setBusy] = useState(false);
  const [showSituation, setShowSituation] = useState(false);
  const created = useRef(Boolean(restored));
  const headingRef = useRef(null);

  const step = steps[index];
  const m = meta[step.key] || emptyMeta;
  const value = answers[step.key];
  const Component = STEP_COMPONENTS[step.type];
  const graded = isGraded(step);
  const isOpen = OPEN_TYPES.includes(step.type);
  const isReflection = step.type === 'reflection';
  const isLast = index === steps.length - 1;

  // Buat attempt sekali (idempoten; antre bila offline).
  useEffect(() => {
    if (created.current) return;
    created.current = true;
    sendOrQueue('/attempts', 'POST', {
      client_id: attemptId,
      activity_id: activity.id,
      content_version: activity.content_version,
      started_at: new Date().toISOString(),
    }).catch(() => {});
  }, [attemptId, activity]);

  // Simpan draf setiap perubahan (FR-18).
  useEffect(() => {
    drafts.save(username, activity.id, { attemptClientId: attemptId, index, answers, meta });
  }, [username, activity.id, attemptId, index, answers, meta]);

  useEffect(() => {
    headingRef.current?.focus();
    setPanel(null);
  }, [index]);

  const setStepMeta = useCallback(
    (patch) => setMeta((all) => ({ ...all, [step.key]: { ...(all[step.key] || emptyMeta), ...patch } })),
    [step.key],
  );

  const record = (response, extra) =>
    sendOrQueue(`/attempts/${attemptId}/responses`, 'POST', {
      client_id: uuid(),
      step_key: step.key,
      step_type: step.type,
      try_number: extra.try_number,
      response,
      is_correct: extra.is_correct ?? null,
      feedback_code: extra.feedback_code ?? null,
      hint_level_max: m.hint,
      solution_revealed: extra.solution_revealed ?? false,
      answered_at: new Date().toISOString(),
    }).catch(() => {});

  const check = () => {
    const result = checkStep(step, value);
    if (result.code === 'INCOMPLETE') {
      // Isian belum lengkap tidak dihitung sebagai percobaan salah.
      setStepMeta({ feedback: { tone: 'info', text: result.message } });
      return;
    }
    const tries = m.tries + 1;
    record(value ?? {}, { try_number: tries, is_correct: result.correct, feedback_code: result.correct ? null : result.code });
    if (result.correct) {
      const extra = step.feedback?.correct || result.message;
      playSound('correct');
      setStepMeta({ tries, solved: true, code: null, feedback: { tone: 'correct', text: extra || 'Tepat! 🎉' } });
      return;
    }
    playSound('wrong');
    let text = result.message;
    if (tries >= OFFER_HINT_AFTER && m.hint === 0 && step.hints?.length) text += ' Butuh petunjuk dari Gari?';
    setStepMeta({ tries, code: result.code, feedback: { tone: 'warning', text } });
  };

  const saveOpen = () => {
    const text = (value?.text || '').trim();
    if (text.length < 3) {
      setStepMeta({ feedback: { tone: 'info', text: 'Tulis dulu jawabanmu dengan kalimatmu sendiri.' } });
      return;
    }
    record({ text }, { try_number: 1 });
    setStepMeta({ tries: 1, solved: true, feedback: null });
  };

  const saveReflection = async (skipped) => {
    const text = (value?.text || '').trim();
    if (!skipped && (text.length < 3 || !value?.confidence)) {
      setStepMeta({ feedback: { tone: 'info', text: 'Tulis penjelasanmu dan pilih tingkat keyakinan, atau pilih “Lewati”.' } });
      return;
    }
    setBusy(true);
    await sendOrQueue('/reflections', 'POST', {
      client_id: uuid(),
      unit_slug: activity.unit.slug,
      prompt_key: step.prompt_key,
      explanation: skipped ? null : text,
      transfer: skipped ? null : (value?.transfer || '').trim() || null,
      confidence: skipped ? null : value.confidence,
      skipped,
    }).catch(() => {});
    setBusy(false);
    setStepMeta({ solved: true, feedback: skipped ? { tone: 'info', text: 'Dilewati. Kamu bisa menjelaskannya lain kali.' } : null });
  };

  const revealSolution = () => {
    record(value ?? {}, { try_number: m.tries, is_correct: false, solution_revealed: true });
    setStepMeta({ solved: true, revealed: true, feedback: { tone: 'info', text: step.solution || 'Pembahasan dibuka.' } });
  };

  const finish = async () => {
    setBusy(true);
    await sendOrQueue(`/attempts/${attemptId}`, 'PATCH', {
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).catch(() => {});
    drafts.clear(username, activity.id);
    setBusy(false);
    if (activity.next_activity_id) navigate(`/aktivitas/${activity.next_activity_id}`, { replace: true });
    else navigate(`/modul/${activity.module_slug}?selesai=${activity.unit.slug}`, { replace: true });
  };

  const next = () => {
    if (isLast) {
      finish();
      return;
    }
    const nextKey = steps[index + 1].key;
    sendOrQueue(`/attempts/${attemptId}`, 'PATCH', { last_step_key: nextKey }).catch(() => {});
    setIndex(index + 1);
  };

  // Tentukan aksi utama tunggal.
  let primary;
  const exampleDone = step.type === 'worked_example' ? isExampleComplete(step, value, m.solved) : true;
  if (isReflection && !m.solved) primary = { label: 'Simpan & lihat pola', onClick: () => saveReflection(false) };
  else if (isOpen && !m.solved) primary = { label: 'Simpan jawaban', onClick: saveOpen };
  else if (graded && !m.solved) {
    const blankShown = step.type !== 'worked_example' || (value?.revealed ?? 1) > step.lines.findIndex((l) => l.blank);
    primary = { label: 'Cek jawaban', onClick: check, disabled: !blankShown, sound: 'none' };
  } else primary = { label: isLast ? 'Selesai' : 'Lanjut', onClick: next, disabled: !exampleDone };

  const hasHints = Boolean(step.hints?.length) && !m.solved;
  const openHints = () => {
    if (panel !== 'hint' && m.hint === 0) setStepMeta({ hint: 1 });
    setPanel((p) => (p === 'hint' ? null : 'hint'));
  };
  const processLabel = PROCESS_LABEL[step.process];
  const plain = plainSituation(situation);
  const bodyHasSituation = step.type === 'info' && (step.body || '').includes(plain.slice(0, 20));
  const showSituationBox = situation && index === 0 && step.type !== 'identify_info' && !bodyHasSituation;
  const showSituationCard = situation && step.type !== 'identify_info' && index > 0;

  return (
    <div className={styles.player}>
      <header className={styles.head}>
        <div className={styles.headRow}>
          <Button variant="ghost" size="sm" to={`/modul/${activity.module_slug}`} aria-label="Tutup aktivitas, progres tersimpan">
            ✕
          </Button>
          <div className={styles.headTitle}>
            <span className={styles.unitName}>{activity.unit.title}</span>
            <strong>{activity.title}</strong>
          </div>
          <span className={styles.stepCount}>
            Langkah {index + 1}/{steps.length}
          </span>
          <SoundToggle />
        </div>
        <ProgressBar value={index + (m.solved || !graded ? 1 : 0)} max={steps.length} label="Kemajuan aktivitas" />
      </header>

      <main className={styles.body}>
        <div className={styles.stepTop}>
          {processLabel && <span className={styles.process}>{processLabel}</span>}
          <h1 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
            {step.title || activity.title}
          </h1>
        </div>

        {showSituationCard && (
          <div className={styles.situationCard}>
            <button type="button" className={styles.situationToggle} aria-expanded={showSituation} onClick={() => setShowSituation((v) => !v)}>
              📄 {showSituation ? 'Sembunyikan situasi' : 'Baca lagi situasinya'}
            </button>
            {showSituation && <RichText text={plain} className={styles.prose} />}
          </div>
        )}

        {showSituationBox && <RichText text={plain} className={`${styles.situationBox} ${styles.prose}`} />}

        {Component ? (
          <Component
            key={step.key}
            step={step}
            situation={situation}
            value={value}
            solved={m.solved}
            disabled={m.solved}
            onChange={(v) => setAnswers((a) => ({ ...a, [step.key]: v }))}
          />
        ) : (
          <p>Jenis langkah belum didukung: {step.type}</p>
        )}

        {m.feedback && (
          <FeedbackBox tone={m.feedback.tone}>
            <RichText text={m.feedback.text} as="span" />
          </FeedbackBox>
        )}
        {m.feedback?.tone === 'warning' && aiAvailable && panel !== 'gari' && (
          <Button variant="ghost" size="sm" onClick={() => setPanel('gari')}>
            💬 Tanya Gari: kenapa belum tepat?
          </Button>
        )}

        {isOpen && m.solved && step.model_answer && (
          <div className={styles.modelAnswer}>
            <strong>Bandingkan dengan contoh jawaban:</strong>
            <RichText text={step.model_answer} as="span" />
            <p className={styles.help}>Jawabanmu tidak harus sama persis. Apa yang mirip, apa yang berbeda?</p>
          </div>
        )}

        {graded && !m.solved && m.tries >= OFFER_SOLUTION_AFTER && (
          <Button variant="ghost" size="sm" onClick={revealSolution}>
            Lihat pembahasan
          </Button>
        )}
        {isReflection && !m.solved && (
          <Button variant="ghost" size="sm" onClick={() => saveReflection(true)}>
            Lewati
          </Button>
        )}
      </main>

      {((panel === 'hint' && hasHints) || (panel === 'gari' && aiAvailable)) && (
        <HintPanel
          mode={panel}
          hints={step.hints || []}
          level={Math.max(1, m.hint)}
          ai={{ available: aiAvailable, activityId: activity.id, step, currentAnswer: value, feedbackCode: m.code }}
          onMore={() => setStepMeta({ hint: Math.min(step.hints.length, m.hint + 1) })}
          onSwitch={setPanel}
          onClose={() => setPanel(null)}
        />
      )}

      <footer className={styles.actionBar}>
        <Button variant="secondary" onClick={() => setIndex(index - 1)} disabled={index === 0} aria-label="Langkah sebelumnya">
          ‹<span className={styles.hideSm}> Kembali</span>
        </Button>
        <Button variant="primary" onClick={primary.onClick} disabled={primary.disabled || busy} data-sound={primary.sound}>
          {primary.label}
        </Button>
        <Button
          variant="secondary"
          disabled={!hasHints}
          onClick={openHints}
          aria-label="Petunjuk"
          aria-expanded={panel === 'hint'}
        >
          💡<span className={styles.hideSm}> Petunjuk</span>
        </Button>
        {aiAvailable && (
          <Button
            variant="secondary"
            className={styles.gariBtn}
            onClick={() => setPanel((p) => (p === 'gari' ? null : 'gari'))}
            aria-label="Tanya Gari"
            aria-expanded={panel === 'gari'}
          >
            <DuckMascot size={26} skin={skin} headOnly />
            <span className={styles.hideSm}> Tanya Gari</span>
          </Button>
        )}
      </footer>
    </div>
  );
}
