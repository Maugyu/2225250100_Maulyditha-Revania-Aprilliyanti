import { useEffect, useRef, useState } from 'react';
import { request } from '@/lib/api/client';
import { playSound } from '@/lib/sound';
import { chatKey, SUPERVISED_KEY } from '@/lib/storage/gariChat';
import RichText from '@/components/ui/RichText';
import { Button } from '@/components/ui';
import styles from './player.module.css';

const MAX = 300;
const HISTORY = 6;

/** Sapaan pembuka per proses — lokal, tanpa memanggil AI (hemat kuota). Mengarahkan ke tujuan langkah (MLE: intensionalitas). */
const GREETING = {
  formulate: 'Hai! Di langkah ini kita mengubah cerita jadi bahasa matematika. Bagian mana yang membuatmu ragu?',
  planning: 'Hai! Di sini kita menyusun rencana dulu sebelum menghitung. Menurutmu, langkah apa yang paling awal?',
  employ: 'Hai! Sekarang saatnya menghitung. Mau Gari bantu cek caramu, atau bingung mulai dari mana?',
  interpret: 'Hai! Di langkah ini kita mengartikan hasil hitungan ke dalam cerita. Apa arti angkamu menurutmu?',
  evaluate: 'Hai! Kita cek apakah hasilnya masuk akal. Apa yang membuatmu ragu?',
  reasoning: 'Hai! Di sini kita menjelaskan alasan. Coba ceritakan dulu apa yang kamu pikirkan.',
};
const DEFAULT_GREETING = 'Hai, aku Gari! Ada yang mau ditanyakan tentang langkah ini?';
const GENERAL_GREETING =
  'Hai, aku Gari! 🦆 Mau tanya apa tentang persamaan garis lurus? Misalnya arti gradien, atau unit mana yang perlu kamu ulang.';
const GENERAL_STARTERS = ['Apa itu gradien?', 'Bedanya m dan c apa?', 'Aku harus belajar apa dulu?'];

function isSupervised() {
  try {
    return sessionStorage.getItem(SUPERVISED_KEY) === '1';
  } catch {
    return false;
  }
}

function loadChat(key) {
  try {
    const raw = JSON.parse(sessionStorage.getItem(key) || 'null');
    return raw && Array.isArray(raw.messages) ? raw : null;
  } catch {
    return null;
  }
}

/** Pilihan cepat sebelum siswa bertanya — disesuaikan dengan keadaan langkah. */
export function starterChoices({ feedbackCode, hasAnswer }) {
  const out = [];
  if (feedbackCode) out.push('Kenapa jawabanku belum tepat?');
  out.push('Aku bingung mulai dari mana');
  out.push('Apa maksud soal ini?');
  if (hasAnswer && !feedbackCode) out.push('Cek caraku dong');
  return out.slice(0, 3);
}

/** Teks untuk dibacakan: buang notasi LaTeX & markup agar mesin suara tidak membaca simbol. */
export function speakable(text) {
  return String(text || '')
    .replace(/\$([^$]+)\$/g, (_, m) => m.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1 per $2').replace(/[\\{}^_]/g, ' '))
    .replace(/\*\*|\[\[[^|\]]*\|?|\]\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * "Tanya Gari" — chat AI untuk siswa, dipakai bersama orang tua/wali (ADR-018).
 * Interaktif: sapaan sesuai langkah, pilihan balasan cepat, Gari bertanya balik, bisa dibacakan.
 * Gari membimbing tanpa memberi jawaban akhir (PP-04, ditegakkan juga di server).
 * Tanpa `step` = obrolan umum dari bilah samping (ADR-021), memakai POST /ai/chat.
 */
export default function TanyaGari({ activityId, step, currentAnswer, feedbackCode = null, process }) {
  const general = !step;
  const storeKey = chatKey(activityId, step?.key);
  const [supervised, setSupervised] = useState(isSupervised);
  const [messages, setMessages] = useState(() => loadChat(storeKey)?.messages || []);
  const [choices, setChoices] = useState(() => loadChat(storeKey)?.choices || null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight; // scrollTop didukung semua browser (scrollTo tidak selalu)
  }, [messages, busy]);

  // Percakapan tidak hilang saat panel ditutup/dibuka lagi (hanya selama sesi browser).
  useEffect(() => {
    try {
      sessionStorage.setItem(storeKey, JSON.stringify({ messages: messages.slice(-20), choices }));
    } catch {
      /* abaikan */
    }
  }, [storeKey, messages, choices]);

  useEffect(() => () => canSpeak() && window.speechSynthesis.cancel(), []);

  if (!supervised) {
    return (
      <div className={styles.aiGate}>
        <strong>Tanya Gari (AI)</strong>
        <p>
          Gari bisa menjawab pertanyaanmu memakai AI dari Google. Pakai fitur ini <b>bersama orang tua/wali</b>, ya.
          Jangan tulis nama, alamat, atau nomor HP.
        </p>
        <Button
          size="sm"
          onClick={() => {
            try {
              sessionStorage.setItem(SUPERVISED_KEY, '1');
            } catch {
              /* abaikan */
            }
            setSupervised(true);
          }}
        >
          ✅ Orang tuaku sedang mendampingi
        </Button>
      </div>
    );
  }

  const ask = async (raw) => {
    const q = raw.trim();
    if (q.length < 2 || busy) return;
    setError('');
    setText('');
    setChoices(null);
    // Sapaan lokal tidak dikirim sebagai riwayat — hanya percakapan sungguhan.
    const history = messages.filter((m) => !m.local).slice(-HISTORY).map(({ role, text: t }) => ({ role, text: t }));
    setMessages((m) => [...m, { role: 'siswa', text: q }]);
    setBusy(true);
    playSound('send');
    try {
      const res = general
        ? await request('/ai/chat', { method: 'POST', body: { question: q, history, supervised: true } })
        : await request('/ai/ask', {
            method: 'POST',
            body: {
              activity_id: activityId,
              step_key: step.key,
              question: q,
              history,
              current_answer: currentAnswer && typeof currentAnswer === 'object' ? currentAnswer : null,
              feedback_code: feedbackCode || null,
              supervised: true,
            },
          });
      setMessages((m) => [...m, { role: 'gari', text: res.reply }]);
      setChoices(Array.isArray(res.choices) && res.choices.length ? res.choices : null);
      playSound('receive');
    } catch (err) {
      setError(err.isNetwork ? 'Tanya Gari butuh internet.' : err.message);
      setMessages((m) => m.slice(0, -1));
      setText(q);
    } finally {
      setBusy(false);
    }
  };

  const speak = (i, t) => {
    if (!canSpeak()) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    if (speaking === i) {
      setSpeaking(null);
      return;
    }
    const u = new window.SpeechSynthesisUtterance(speakable(t));
    u.lang = 'id-ID';
    u.rate = 0.95;
    u.onend = () => setSpeaking(null);
    u.onerror = () => setSpeaking(null);
    setSpeaking(i);
    synth.speak(u);
  };

  const greeting = general ? GENERAL_GREETING : GREETING[process] || DEFAULT_GREETING;
  const shown = messages.length ? messages : [{ role: 'gari', text: greeting, local: true }];
  const starters = general ? GENERAL_STARTERS : starterChoices({ feedbackCode, hasAnswer: Boolean(currentAnswer) });
  const quick = busy ? [] : choices || (messages.some((m) => m.role === 'siswa') ? [] : starters);

  return (
    <div className={styles.aiChat}>
      <ol className={styles.aiMessages} ref={listRef} aria-live="polite">
        {shown.map((m, i) => (
          <li key={i} className={m.role === 'gari' ? styles.msgGari : styles.msgMe}>
            <span className="visually-hidden">{m.role === 'gari' ? 'Gari: ' : 'Kamu: '}</span>
            <RichText text={m.text} as="span" />
            {m.role === 'gari' && canSpeak() && (
              <button
                type="button"
                className={styles.speakBtn}
                onClick={() => speak(i, m.text)}
                aria-label={speaking === i ? 'Berhenti membacakan' : 'Bacakan pesan Gari'}
                aria-pressed={speaking === i}
              >
                {speaking === i ? '⏹' : '🔊'}
              </button>
            )}
          </li>
        ))}
        {busy && (
          <li className={styles.msgGari}>
            <span className="visually-hidden">Gari sedang mengetik</span>
            <span className={styles.typing} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </li>
        )}
      </ol>

      {quick.length > 0 && (
        <div className={styles.chips} role="group" aria-label="Pilihan balasan cepat">
          {quick.map((c) => (
            <button key={c} type="button" className={styles.chip} onClick={() => ask(c)} data-sound="none">
              {c}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(text);
        }}
        className={styles.aiForm}
      >
        <label htmlFor={`ask-${step?.key || 'umum'}`} className="visually-hidden">
          Pertanyaan untuk Gari
        </label>
        <input
          id={`ask-${step?.key || 'umum'}`}
          value={text}
          maxLength={MAX}
          placeholder="Tulis pertanyaanmu…"
          onChange={(e) => setText(e.target.value)}
        />
        <Button size="sm" type="submit" disabled={busy || text.trim().length < 2} data-sound="none">
          Kirim
        </Button>
      </form>
      {error && <p className={styles.aiError}>{error}</p>}
      <p className={styles.help}>Gari tidak memberi jawaban akhir dan bisa keliru. Percakapan disimpan untuk guru/peneliti.</p>
    </div>
  );
}
