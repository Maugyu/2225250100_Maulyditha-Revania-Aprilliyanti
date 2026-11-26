import { describe, expect, it } from 'vitest';
import { Fraction, parseNumber } from '@/lib/math/fraction';
import {
  checkChoice,
  checkDefineVariables,
  checkIdentify,
  checkKnownAsked,
  checkLinearModel,
  checkNumeric,
  checkPlotPoints,
  checkReadPoints,
  isGraded,
} from '@/lib/checkers';
import { latticePointsOnLine, makeScale, snap } from '@/features/graph/coords';
import { tokenize } from '@/lib/content/markup';
import { equationTex } from '@/features/graph/SlopeExplorer';

describe('parseNumber', () => {
  it.each([
    ['2', 2],
    ['-3/4', -0.75],
    ['0,5', 0.5],
    ['2.5', 2.5],
    ['5.000', 5000],
    ['Rp25.000', 25000],
    ['4/2', 2],
    ['−8', -8],
  ])('%s → %s', (raw, val) => {
    expect(Number(parseNumber(raw))).toBe(val);
  });
  it.each(['', 'abc', '1/0', null])('menolak %s', (raw) => {
    expect(parseNumber(raw)).toBeNull();
  });
  it('pecahan disederhanakan', () => {
    expect(parseNumber('-6/4').equals(new Fraction(-3, 2))).toBe(true);
  });
});

describe('checkNumeric', () => {
  const step = { answer: '-1/2', wrong_answers: [{ value: '-2', code: 'ARITH', message: 'atas/bawah' }] };
  it('benar dengan bentuk setara', () => {
    expect(checkNumeric('-2/4', step).correct).toBe(true);
    expect(checkNumeric('-0,5', step).correct).toBe(true);
  });
  it('mendeteksi SIGN_FLIP otomatis', () => {
    expect(checkNumeric('1/2', step).code).toBe('SIGN_FLIP');
  });
  it('memakai katalog konten lebih dulu', () => {
    const r = checkNumeric('-2', step);
    expect(r.code).toBe('ARITH');
    expect(r.message).toBe('atas/bawah');
  });
  it('mendeteksi RECIPROCAL', () => {
    expect(checkNumeric('2', step).code).toBe('RECIPROCAL');
  });
  it('isian kosong = INCOMPLETE', () => {
    expect(checkNumeric('', step).code).toBe('INCOMPLETE');
  });
});

describe('checkLinearModel', () => {
  const step = { answer: { m: '2500', c: '5000' } };
  it('benar', () => expect(checkLinearModel({ m: '2.500', c: '5000' }, step).correct).toBe(true));
  it('M_C_SWAP', () => expect(checkLinearModel({ m: '5000', c: '2500' }, step).code).toBe('M_C_SWAP'));
  it('SIGN_FLIP', () => expect(checkLinearModel({ m: '-2500', c: '5000' }, step).code).toBe('SIGN_FLIP'));
  it('c = 0 boleh', () => expect(checkLinearModel({ m: '4000', c: '0' }, { answer: { m: '4000', c: '0' } }).correct).toBe(true));
});

describe('checker lain', () => {
  it('identify_info', () => {
    const step = { relevant: ['s1', 's2'] };
    expect(checkIdentify(['s1', 's2'], step).correct).toBe(true);
    expect(checkIdentify(['s1', 's2', 's5'], step).code).toBe('IRRELEVANT_SELECTED');
    expect(checkIdentify(['s1'], step).code).toBe('MISSED_INFO');
  });
  it('known_asked mencari angka di label maupun nilai', () => {
    const step = { required_values: ['120', '75', '7', '10'] };
    const ok = {
      known: [
        { label: 'Pukul 07.00', value: '120 liter' },
        { label: 'Pukul 10.00', value: '75 L' },
      ],
      asked: 'pengurangan per jam',
    };
    expect(checkKnownAsked(ok, step).correct).toBe(true);
    expect(checkKnownAsked({ ...ok, known: [ok.known[0]] }, step).code).toBe('MISSED_INFO');
    expect(checkKnownAsked({ ...ok, asked: '' }, step).code).toBe('INCOMPLETE');
  });
  it('define_variables mendeteksi tertukar', () => {
    const step = { answer: { x: 'jarak', y: 'biaya' } };
    expect(checkDefineVariables({ x: 'biaya', y: 'jarak' }, step).code).toBe('XY_SWAP');
  });
  it('plot_points', () => {
    const step = { points: [[0, 1], [2, 5]] };
    expect(checkPlotPoints([[2, 5], [0, 1]], step).correct).toBe(true);
    expect(checkPlotPoints([[0, 1], [5, 2]], step).code).toBe('XY_SWAP');
    expect(checkPlotPoints([[0, 1]], step).code).toBe('INCOMPLETE');
  });
  it('read_point menerima titik mana pun pada garis', () => {
    const step = { line: { m: '1/2', c: '1' } };
    expect(checkReadPoints([['0', '1'], ['2', '2']], step).correct).toBe(true);
    expect(checkReadPoints([['-2', '0'], ['4', '3']], step).correct).toBe(true);
    expect(checkReadPoints([['0', '1'], ['1', '2']], step).code).toBe('NOT_ON_LINE');
  });
  it('choice memakai umpan balik per opsi', () => {
    const step = { answer: 'a', options: [{ id: 'a' }, { id: 'b', code: 'M_C_SWAP', feedback: 'tertukar' }] };
    expect(checkChoice('b', step)).toMatchObject({ correct: false, code: 'M_C_SWAP', message: 'tertukar' });
  });
  it('isGraded', () => {
    expect(isGraded({ type: 'info' })).toBe(false);
    expect(isGraded({ type: 'explore' })).toBe(false);
    expect(isGraded({ type: 'explore', question: {} })).toBe(true);
    expect(isGraded({ type: 'worked_example', lines: [{ blank: {} }] })).toBe(true);
  });
});

describe('koordinat & markup', () => {
  it('skala 1:1 dan bolak-balik', () => {
    const s = makeScale({ x_min: -4, x_max: 4, y_min: -5, y_max: 5 });
    expect(s.ux).toBe(s.uy);
    expect(s.fromX(s.toX(3))).toBeCloseTo(3);
    expect(s.fromY(s.toY(-2))).toBeCloseTo(-2);
  });
  it('snap', () => {
    expect(snap(2.9)).toBe(3);
    expect(snap(-0.2)).toBe(0);
    expect(snap(23, 5)).toBe(25);
  });
  it('titik kisi pada garis', () => {
    const pts = latticePointsOnLine(parseNumber('1/2'), parseNumber('1'), { x_min: -4, x_max: 4, y_min: -4, y_max: 4 });
    expect(pts).toEqual([[-4, -1], [-2, 0], [0, 1], [2, 2], [4, 3]]);
  });
  it('tokenize', () => {
    const t = tokenize('Lihat [[gradien|kemiringan]] $m$ dan **ini** {{s1|Rp5.000}}');
    expect(t.map((x) => x.type)).toEqual(['text', 'term', 'text', 'math', 'text', 'bold', 'text', 'span']);
  });
  it('persamaan rapi', () => {
    expect(equationTex(new Fraction(1), new Fraction(-3))).toBe('y = x - 3');
    expect(equationTex(new Fraction(-1, 2), new Fraction(0))).toBe('y = -\\tfrac{1}{2}x');
    expect(equationTex(new Fraction(0), new Fraction(2))).toBe('y = 2');
  });
});

describe('checkPlan (RMT — Perencanaan Tindakan)', () => {
  const step = { answer: ['p1', 'p2', 'p3', 'p4'] };
  it('urutan benar', async () => {
    const { checkPlan } = await import('@/lib/checkers');
    expect(checkPlan(['p1', 'p2', 'p3', 'p4'], step).correct).toBe(true);
  });
  it('menyebut posisi pertama yang keliru', async () => {
    const { checkPlan } = await import('@/lib/checkers');
    const r = checkPlan(['p1', 'p3', 'p2', 'p4'], step);
    expect(r.code).toBe('PLAN_ORDER');
    expect(r.message).toMatch(/Langkah ke-2/);
  });
  it('rencana belum lengkap tidak dihitung salah', async () => {
    const { checkPlan } = await import('@/lib/checkers');
    expect(checkPlan(['p1'], step).code).toBe('INCOMPLETE');
  });
});
