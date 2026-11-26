/**
 * Efek suara (F-26) — disintesis dengan Web Audio API, tanpa berkas audio & tanpa dependensi.
 *
 * Prinsip:
 * - Suara adalah umpan balik (benar / perlu dicek / tombol), bukan hadiah: tanpa fanfare atau poin (PP-10).
 * - Nada "salah" dibuat lembut & menurun pelan agar tidak terasa menghukum.
 * - Dapat dimatikan kapan saja; pilihan disimpan per perangkat.
 * - Tidak dipakai untuk benar/salah di asesmen (PP-09) — asesmen memang tidak memeriksa jawaban di klien.
 */

const KEY = 'sound';
const listeners = new Set();
let ctx = null;

export function isSoundOn() {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSoundOn(on) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* abaikan */
  }
  listeners.forEach((fn) => fn(on));
}

export function onSoundChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function audio() {
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  if (!(ctx instanceof AC)) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** Satu nada pendek dengan selubung lembut (tanpa bunyi "klik" di awal/akhir). */
function tone(ac, { freq, to, start = 0, dur = 0.12, type = 'sine', gain = 0.12 }) {
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const SOUNDS = {
  tap: [{ freq: 660, dur: 0.05, type: 'triangle', gain: 0.05 }],
  correct: [
    { freq: 659, dur: 0.12 },
    { freq: 880, start: 0.1, dur: 0.18 },
  ],
  wrong: [
    { freq: 330, to: 262, dur: 0.22, type: 'triangle', gain: 0.1 },
  ],
  // "Kwek" pendek saat Gari diketuk di beranda.
  quack: [
    { freq: 520, to: 360, dur: 0.11, type: 'sawtooth', gain: 0.05 },
    { freq: 560, to: 380, start: 0.13, dur: 0.1, type: 'sawtooth', gain: 0.04 },
  ],
  send: [{ freq: 520, to: 780, dur: 0.09, gain: 0.06 }],
  receive: [
    { freq: 784, dur: 0.07, gain: 0.07 },
    { freq: 1047, start: 0.07, dur: 0.1, gain: 0.06 },
  ],
};

export function playSound(name) {
  if (!isSoundOn() || !SOUNDS[name]) return;
  try {
    const ac = audio();
    if (!ac) return;
    SOUNDS[name].forEach((t) => tone(ac, t));
  } catch {
    /* audio tidak tersedia — aplikasi tetap berjalan tanpa suara */
  }
}

/**
 * Suara ketuk global: satu pendengar untuk semua tombol, agar tidak perlu menyentuh tiap komponen.
 * Tombol dengan data-sound="none" tidak berbunyi (mis. "Cek jawaban" yang punya suara benar/salah sendiri).
 */
export function installTapSound(root = document) {
  const handler = (e) => {
    const el = e.target.closest?.('button, a[href], [role="button"], input[type="checkbox"], input[type="radio"]');
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    if (el.closest('[data-sound="none"]')) return;
    playSound('tap');
  };
  root.addEventListener('click', handler, true);
  return () => root.removeEventListener('click', handler, true);
}
