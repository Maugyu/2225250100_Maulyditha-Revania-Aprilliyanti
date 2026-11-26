/**
 * Pecahan eksak (pembilang/penyebut bulat) agar pembandingan jawaban bebas galat floating-point.
 * Aturan parsing sama dengan backend app/services/scoring.py::parse_number.
 */

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export class Fraction {
  constructor(num, den = 1) {
    if (!Number.isInteger(num) || !Number.isInteger(den) || den === 0) {
      throw new Error('Pecahan tidak valid');
    }
    const s = den < 0 ? -1 : 1;
    const g = gcd(num, den);
    this.num = (s * num) / g;
    this.den = (s * den) / g;
  }

  static from(value) {
    if (value instanceof Fraction) return value;
    if (typeof value === 'number') return Fraction.fromDecimalString(String(value));
    const f = parseNumber(value);
    if (!f) throw new Error(`Bukan angka: ${value}`);
    return f;
  }

  static fromDecimalString(s) {
    const neg = s.startsWith('-');
    const body = neg ? s.slice(1) : s;
    if (!/^\d+(\.\d+)?$/.test(body)) return null;
    const [int, dec = ''] = body.split('.');
    const den = 10 ** dec.length;
    const num = Number(int) * den + (dec ? Number(dec) : 0);
    return new Fraction(neg ? -num : num, den);
  }

  equals(other) {
    return this.num === other.num && this.den === other.den;
  }
  negate() {
    return new Fraction(-this.num, this.den);
  }
  reciprocal() {
    return new Fraction(this.den, this.num);
  }
  isZero() {
    return this.num === 0;
  }
  add(o) {
    return new Fraction(this.num * o.den + o.num * this.den, this.den * o.den);
  }
  sub(o) {
    return this.add(o.negate());
  }
  mul(o) {
    return new Fraction(this.num * o.num, this.den * o.den);
  }
  div(o) {
    return new Fraction(this.num * o.den, this.den * o.num);
  }
  valueOf() {
    return this.num / this.den;
  }
  /** Teks ramah tampilan: "-1/2", "3", "2.500" tidak dipakai di sini. */
  toString() {
    return this.den === 1 ? String(this.num) : `${this.num}/${this.den}`;
  }
  /** Representasi LaTeX. */
  toTex() {
    if (this.den === 1) return String(this.num);
    const sign = this.num < 0 ? '-' : '';
    return `${sign}\\tfrac{${Math.abs(this.num)}}{${this.den}}`;
  }
}

/**
 * Menerima: bulat, desimal koma/titik, pecahan a/b, pemisah ribuan titik ("5.000"), "Rp" diabaikan.
 * @returns {Fraction|null}
 */
export function parseNumber(raw) {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).trim().replace(/\s+/g, '').replace(/^rp/i, '').replace(/[−–]/g, '-');
  if (!s) return null;
  try {
    if (s.includes('/')) {
      const [a, b] = s.split('/', 2);
      const fa = parseNumber(a);
      const fb = parseNumber(b);
      if (!fa || !fb || fb.isZero()) return null;
      return fa.div(fb);
    }
    if (s.includes(',')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s) && !/^-?0\./.test(s)) {
      s = s.replace(/\./g, ''); // 5.000 -> 5000 (format Indonesia)
    }
    return Fraction.fromDecimalString(s);
  } catch {
    return null;
  }
}

export function formatNumber(value) {
  const f = value instanceof Fraction ? value : parseNumber(value);
  if (!f) return String(value);
  if (f.den === 1) return f.num.toLocaleString('id-ID');
  return f.toString();
}
