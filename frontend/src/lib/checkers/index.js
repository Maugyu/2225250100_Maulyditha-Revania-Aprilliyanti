/**
 * Pemeriksa jawaban latihan (ADR-009, F-10). Murni & dapat dites.
 * Setiap fungsi mengembalikan { correct: boolean, code?: string, message?: string }.
 */
import { Fraction, parseNumber } from '@/lib/math/fraction';

export const MESSAGES = {
  SIGN_FLIP: 'Nilainya sudah tepat, coba periksa tanda positif/negatifnya.',
  ORDER_MISMATCH: 'Urutan titik di atas dan di bawah harus sama.',
  RECIPROCAL: 'Garis tegak lurus: dibalik dan diganti tandanya.',
  M_C_SWAP: 'Mana yang berubah per satuan (m), dan mana yang nilai awal (c)?',
  XY_SWAP: 'Ingat urutan (x, y): mendatar dulu, lalu tegak.',
  ARITH: 'Periksa kembali perhitunganmu di langkah ini.',
  IRRELEVANT_SELECTED: 'Ada bagian yang kamu tandai tapi tidak dibutuhkan untuk menjawab. Cek lagi.',
  MISSED_INFO: 'Masih ada informasi penting yang belum masuk.',
  EXTRA_POINT: 'Ada titik yang tidak ada di tabel. Ketuk titik itu untuk menghapusnya.',
  NOT_ON_LINE: 'Titik itu tidak tepat berada di garis. Cari persilangan grid yang dilewati garis.',
  INCOMPLETE: 'Lengkapi dulu semua isian.',
  INVALID: 'Tulis jawaban berupa angka, misalnya 3, -2, 0,5, atau 1/2.',
  PLAN_ORDER: 'Urutan rencananya belum tepat. Langkah mana yang harus ada lebih dulu agar langkah berikutnya bisa dikerjakan?',
};

const ok = (message) => ({ correct: true, message });
const wrong = (code, message) => ({ correct: false, code, message: message || MESSAGES[code] });

/** Numerik dengan katalog jawaban salah dari konten + deteksi tanda & kebalikan otomatis. */
export function checkNumeric(raw, step) {
  const value = parseNumber(raw);
  if (!value) return wrong('INCOMPLETE', MESSAGES.INVALID);
  const key = Fraction.from(step.answer);
  if (value.equals(key)) return ok();
  for (const w of step.wrong_answers || []) {
    const wv = parseNumber(w.value);
    if (wv && wv.equals(value)) return wrong(w.code || 'ARITH', w.message);
  }
  if (!key.isZero() && value.equals(key.negate())) return wrong('SIGN_FLIP');
  if (!key.isZero() && !value.isZero() && value.equals(key.reciprocal().negate())) return wrong('RECIPROCAL');
  return wrong('ARITH');
}

export function checkChoice(selected, step) {
  if (!selected) return wrong('INCOMPLETE', 'Pilih salah satu jawaban.');
  if (selected === step.answer) return ok();
  const opt = (step.options || []).find((o) => o.id === selected);
  return wrong(opt?.code || 'ARITH', opt?.feedback || 'Belum tepat. Coba pikirkan lagi.');
}

/** Model y = mx + c terstruktur. */
export function checkLinearModel(resp, step) {
  const m = parseNumber(resp?.m);
  const c = parseNumber(resp?.c);
  if (!m || !c) return wrong('INCOMPLETE', 'Isi nilai m dan c (boleh 0, negatif, atau pecahan).');
  const km = Fraction.from(step.answer.m);
  const kc = Fraction.from(step.answer.c);
  if (m.equals(km) && c.equals(kc)) return ok();
  if (m.equals(kc) && c.equals(km)) return wrong('M_C_SWAP');
  if ((m.equals(km.negate()) && c.equals(kc)) || (m.equals(km) && c.equals(kc.negate()))) {
    return wrong('SIGN_FLIP');
  }
  if (m.equals(km)) return wrong('ARITH', 'Gradien (m) sudah tepat. Periksa nilai c.');
  if (c.equals(kc)) return wrong('ARITH', 'Nilai c sudah tepat. Periksa gradien (m).');
  return wrong('ARITH');
}

export function checkIdentify(selected, step) {
  const sel = new Set(selected || []);
  const rel = new Set(step.relevant);
  const missed = [...rel].filter((id) => !sel.has(id));
  const extra = [...sel].filter((id) => !rel.has(id));
  if (!missed.length && !extra.length) return ok();
  if (extra.length) return wrong('IRRELEVANT_SELECTED');
  return wrong('MISSED_INFO');
}

/** Ambil semua angka dari teks ("Rp5.000", "07.00", "120 liter"). */
export function extractNumbers(text) {
  const tokens = String(text || '').match(/-?\d+(?:[.,]\d+)*/g) || [];
  return tokens.map((t) => parseNumber(t)).filter(Boolean);
}

export function checkKnownAsked(resp, step) {
  const rows = resp?.known || [];
  const asked = (resp?.asked || '').trim();
  if (!rows.some((r) => (r.label || r.value || '').trim()) || !asked) {
    return wrong('INCOMPLETE', 'Isi minimal satu baris "Diketahui" dan bagian "Ditanya".');
  }
  const found = rows.flatMap((r) => [...extractNumbers(r.label), ...extractNumbers(r.value)]);
  const missing = (step.required_values || []).filter((v) => {
    const target = parseNumber(v);
    return !found.some((f) => f.equals(target));
  });
  if (missing.length) return wrong('MISSED_INFO');
  return ok();
}

export function checkDefineVariables(resp, step) {
  if (!resp?.x || !resp?.y) return wrong('INCOMPLETE', 'Pilih arti x dan y.');
  if (resp.x === step.answer.x && resp.y === step.answer.y) return ok();
  if (resp.x === step.answer.y && resp.y === step.answer.x) {
    return wrong('XY_SWAP', 'Tertukar: x adalah yang memengaruhi, y adalah yang dipengaruhi.');
  }
  return wrong('ARITH', 'Belum tepat. Apa yang menentukan, dan apa yang dihitung?');
}

const key = (p) => `${p[0]},${p[1]}`;

/** Plot titik: semua titik target harus ada, tanpa titik tambahan. */
export function checkPlotPoints(placed, step) {
  const target = new Set(step.points.map(key));
  const got = new Set((placed || []).map(key));
  const extra = [...got].filter((k) => !target.has(k));
  const missing = [...target].filter((k) => !got.has(k));
  if (!extra.length && !missing.length) return ok();
  if (extra.length) {
    const swapped = extra.some((k) => {
      const [x, y] = k.split(',');
      return target.has(`${y},${x}`);
    });
    return swapped ? wrong('XY_SWAP') : wrong('EXTRA_POINT');
  }
  return wrong('INCOMPLETE', `Masih ada ${missing.length} titik yang belum ditempatkan.`);
}

/** Baca dua titik: keduanya berbeda dan berada di garis y = mx + c. */
export function checkReadPoints(points, step) {
  const ps = (points || []).map((p) => [parseNumber(p?.[0]), parseNumber(p?.[1])]);
  if (ps.length < 2 || ps.some(([x, y]) => !x || !y)) return wrong('INCOMPLETE', 'Isi koordinat dua titik.');
  const m = Fraction.from(step.line.m);
  const c = Fraction.from(step.line.c);
  const onLine = ([x, y]) => m.mul(x).add(c).equals(y);
  if (ps[0][0].equals(ps[1][0]) && ps[0][1].equals(ps[1][1])) {
    return wrong('INCOMPLETE', 'Pilih dua titik yang berbeda.');
  }
  const bad = ps.find((p) => !onLine(p));
  if (!bad) return ok();
  if (onLine([bad[1], bad[0]])) return wrong('XY_SWAP');
  return wrong('NOT_ON_LINE');
}

/** Rencana (RMT): urutan langkah harus sama dengan kunci. Pesan menyebut posisi pertama yang keliru. */
export function checkPlan(order, step) {
  const got = order || [];
  if (got.length < step.answer.length) return wrong('INCOMPLETE', 'Susun semua langkah ke dalam rencanamu dulu.');
  const firstWrong = step.answer.findIndex((id, i) => got[i] !== id);
  if (firstWrong < 0) return ok('Rencana yang rapi! Sekarang kerjakan sesuai rencanamu.');
  return wrong('PLAN_ORDER', `Langkah ke-${firstWrong + 1} belum tepat. ${MESSAGES.PLAN_ORDER}`);
}

/** Pemetaan jenis langkah -> pemeriksa. Langkah terbuka (interpret, dll.) tidak dinilai. */
export function checkStep(step, response) {
  switch (step.type) {
    case 'numeric':
    case 'check_back':
      return checkNumeric(response?.value, step);
    case 'choice':
      return checkChoice(response?.selected, step);
    case 'explore':
      return step.question ? checkChoice(response?.selected, step.question) : ok();
    case 'linear_model':
      return checkLinearModel(response, step);
    case 'identify_info':
      return checkIdentify(response?.selected, step);
    case 'known_asked':
      return checkKnownAsked(response, step);
    case 'define_variables':
      return checkDefineVariables(response, step);
    case 'plot_points':
      return checkPlotPoints(response?.points, step);
    case 'read_point':
      return checkReadPoints(response?.points, step);
    case 'plan':
      return checkPlan(response?.order, step);
    case 'worked_example': {
      const blank = (step.lines || []).find((l) => l.blank)?.blank;
      return blank ? checkNumeric(response?.value, blank) : ok();
    }
    default:
      return ok();
  }
}

/** Langkah yang harus dijawab benar (atau dibuka pembahasannya) sebelum lanjut. */
export function isGraded(step) {
  if (step.type === 'explore') return Boolean(step.question);
  if (step.type === 'worked_example') return (step.lines || []).some((l) => l.blank);
  return [
    'numeric', 'check_back', 'choice', 'linear_model', 'identify_info', 'known_asked',
    'define_variables', 'plot_points', 'read_point', 'plan',
  ].includes(step.type);
}

export const OPEN_TYPES = ['interpret', 'evaluate', 'explain'];
