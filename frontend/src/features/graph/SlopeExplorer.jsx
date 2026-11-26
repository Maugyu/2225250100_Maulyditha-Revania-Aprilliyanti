import { useMemo, useState } from 'react';
import { Fraction, parseNumber } from '@/lib/math/fraction';
import { MathText } from '@/components/ui/RichText';
import GraphCanvas, { LinePath } from './GraphCanvas';
import { makeScale } from './coords';
import styles from './graph.module.css';

/** Nilai gradien yang dapat dipilih: termasuk pasangan tegak lurus (2 & −½, 3 & −⅓, 3/2 & −2/3). */
export const M_VALUES = [
  '-4', '-3', '-2', '-3/2', '-1', '-2/3', '-1/2', '-1/3', '0',
  '1/3', '1/2', '2/3', '1', '3/2', '2', '3', '4',
].map((v) => parseNumber(v));
export const C_VALUES = Array.from({ length: 15 }, (_, i) => new Fraction(i - 6)); // -6..8

const GRID = { x_min: -6, x_max: 6, y_min: -6, y_max: 8 };

function indexOf(list, value) {
  const f = parseNumber(value) || new Fraction(0);
  const i = list.findIndex((v) => v.equals(f));
  return i >= 0 ? i : Math.floor(list.length / 2);
}

/** Teks LaTeX persamaan y = mx + c yang rapi (tanpa "1x", "+ -3", "+ 0"). */
export function equationTex(m, c, y = 'y') {
  let mx;
  if (m.isZero()) mx = '';
  else if (m.equals(new Fraction(1))) mx = 'x';
  else if (m.equals(new Fraction(-1))) mx = '-x';
  else mx = `${m.toTex()}x`;
  let cs = '';
  if (!c.isZero()) cs = mx ? (c.num < 0 ? ` - ${c.negate().toTex()}` : ` + ${c.toTex()}`) : c.toTex();
  if (!mx && c.isZero()) cs = '0';
  return `${y} = ${mx}${cs}`;
}

const spoken = (f) => (f.den === 1 ? String(f.num) : `${f.num} per ${f.den}`);

function Slider({ id, label, list, index, onChange, disabled, tag }) {
  const v = list[index];
  return (
    <div className={styles.sliderRow}>
      <label htmlFor={id}>
        {tag}
        <MathText tex={label} />
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={list.length - 1}
        step={1}
        value={index}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${label.replace(/[\\_{}]/g, '')} = ${spoken(v)}`}
      />
      <output htmlFor={id}>
        <MathText tex={v.toTex()} />
      </output>
    </div>
  );
}

function RightAngle({ scale, p, m1, m2 }) {
  const dir = (m) => {
    const dx = scale.ux;
    const dy = -Number(m) * scale.uy;
    const len = Math.hypot(dx, dy);
    return [dx / len, dy / len];
  };
  const [a1, b1] = dir(m1);
  const [a2, b2] = dir(m2);
  const s = 14;
  const P = [scale.toX(Number(p.x)), scale.toY(Number(p.y))];
  const pts = [
    [P[0] + a1 * s, P[1] + b1 * s],
    [P[0] + (a1 + a2) * s, P[1] + (b1 + b2) * s],
    [P[0] + a2 * s, P[1] + b2 * s],
  ];
  return <polyline points={pts.map((q) => q.join(',')).join(' ')} className={styles.right} />;
}

/**
 * Penjelajah Gradien (F-05). Mode: 'single' | 'two' | 'compare'.
 * onChange menerima keadaan terkini agar dapat dicatat sebagai data proses.
 */
export default function SlopeExplorer({ step, onChange }) {
  const init = step.initial || {};
  const [mi, setMi] = useState(() => indexOf(M_VALUES, init.m ?? '1'));
  const [ci, setCi] = useState(() => indexOf(C_VALUES, init.c ?? '0'));
  const [m2i, setM2i] = useState(() => indexOf(M_VALUES, init.m2 ?? '-1'));
  const [c2i, setC2i] = useState(() => indexOf(C_VALUES, init.c2 ?? '0'));
  const ctx = step.context;
  const [xi, setXi] = useState(ctx ? Math.min(3, ctx.x_max) : 0);

  const m = M_VALUES[mi];
  const c = C_VALUES[ci];
  const m2 = M_VALUES[m2i];
  const c2 = C_VALUES[c2i];

  const emit = (patch) => {
    const state = { m: m.toString(), c: c.toString(), m2: m2.toString(), c2: c2.toString(), x: xi, ...patch };
    onChange?.(state);
  };

  const scale = useMemo(
    () =>
      step.mode === 'compare'
        ? makeScale({ x_min: 0, x_max: ctx.x_max, y_min: 0, y_max: ctx.y_max }, { equal: false, height: 300 })
        : makeScale(GRID),
    [step.mode, ctx],
  );

  if (step.mode === 'compare') {
    const lines = ctx.lines.map((l) => ({ ...l, m: parseNumber(l.m), c: parseNumber(l.c) }));
    const xf = new Fraction(xi);
    return (
      <div className={styles.wrap}>
        <GraphCanvas
          scale={scale}
          grid={{ x_step: 1, y_step: ctx.y_step || 5 }}
          xLabel={ctx.x_label}
          yLabel={ctx.y_label}
          ariaLabel={`Grafik ${lines.map((l) => `${l.label}: y = ${l.m}x + ${l.c}`).join(', ')}`}
        >
          {(s) => (
            <>
              {lines.map((l, i) => (
                <LinePath key={l.label} scale={s} m={l.m} c={l.c} className={i ? styles.line2 : styles.line1} dashed={i === 1} />
              ))}
              <line x1={s.toX(xi)} x2={s.toX(xi)} y1={s.pad} y2={s.height - s.pad} className={styles.marker} />
              {lines.map((l) => (
                <circle key={l.label} cx={s.toX(xi)} cy={s.toY(Number(l.m.mul(xf).add(l.c)))} r="6" className={styles.point} />
              ))}
            </>
          )}
        </GraphCanvas>
        <div className={styles.sliderRow}>
          <label htmlFor="cmp-x">Jam ke-</label>
          <input
            id="cmp-x"
            type="range"
            min={0}
            max={ctx.x_max}
            value={xi}
            onChange={(e) => {
              setXi(Number(e.target.value));
              emit({ x: Number(e.target.value) });
            }}
            aria-valuetext={`${xi} jam`}
          />
          <output>{xi}</output>
        </div>
        <div className={styles.status} aria-live="polite">
          {lines.map((l, i) => (
            <span key={l.label} className={styles.chip}>
              <span className={`${styles.lineTag} ${i ? styles.tag2 : styles.tag1}`} />
              {l.label}: {Number(l.m.mul(xf).add(l.c)).toLocaleString('id-ID')} ribu
            </span>
          ))}
        </div>
      </div>
    );
  }

  const two = step.mode === 'two';
  let status = null;
  let intersect = null;
  if (two) {
    if (m.equals(m2)) status = c.equals(c2) ? 'Berimpit (garis yang sama)' : 'Sejajar ∥';
    else {
      const x = c2.sub(c).div(m.sub(m2));
      intersect = { x, y: m.mul(x).add(c) };
      status = m.mul(m2).equals(new Fraction(-1)) ? 'Tegak lurus ⟂' : 'Berpotongan';
    }
  }
  const tri = step.show_triangle && !two;

  return (
    <div className={styles.wrap}>
      <div className={styles.equation} aria-live="polite">
        <span className={`${styles.lineTag} ${styles.tag1}`} hidden={!two} />
        <MathText tex={equationTex(m, c)} />
        {two && (
          <>
            {'  '}
            <span className={`${styles.lineTag} ${styles.tag2}`} />
            <MathText tex={equationTex(m2, c2)} />
          </>
        )}
      </div>
      <GraphCanvas
        scale={scale}
        grid={GRID}
        ariaLabel={`Grafik garis ${equationTex(m, c).replace(/\\tfrac\{(\d+)\}\{(\d+)\}/g, '$1/$2')}${two ? ` dan ${equationTex(m2, c2)}` : ''}`}
      >
        {(s) => (
          <>
            {tri && (
              <g>
                <polygon
                  points={`${s.toX(0)},${s.toY(Number(c))} ${s.toX(1)},${s.toY(Number(c))} ${s.toX(1)},${s.toY(Number(c) + Number(m))}`}
                  className={styles.triFill}
                />
                <line x1={s.toX(0)} y1={s.toY(Number(c))} x2={s.toX(1)} y2={s.toY(Number(c))} className={styles.rise} />
                <line x1={s.toX(1)} y1={s.toY(Number(c))} x2={s.toX(1)} y2={s.toY(Number(c) + Number(m))} className={styles.rise} />
                <text x={s.toX(0.5)} y={s.toY(Number(c)) + (Number(m) >= 0 ? 15 : -7)} className={styles.triLabel} textAnchor="middle">
                  jalan 1
                </text>
                <text x={s.toX(1) + 5} y={s.toY(Number(c) + Number(m) / 2) + 4} className={styles.triLabel}>
                  {Number(m) >= 0 ? 'naik' : 'turun'} {Math.abs(Number(m)).toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                </text>
              </g>
            )}
            <LinePath scale={s} m={m} c={c} className={styles.line1} />
            {two && <LinePath scale={s} m={m2} c={c2} className={styles.line2} dashed />}
            <circle cx={s.toX(0)} cy={s.toY(Number(c))} r="5" className={styles.point} />
            {intersect && status.startsWith('Tegak') && <RightAngle scale={s} p={intersect} m1={m} m2={m2} />}
            {intersect && <circle cx={s.toX(Number(intersect.x))} cy={s.toY(Number(intersect.y))} r="5" className={styles.pointPicked} />}
          </>
        )}
      </GraphCanvas>

      <div className={styles.controls}>
        <Slider
          id="sl-m"
          label={two ? 'm_1' : 'm'}
          list={M_VALUES}
          index={mi}
          disabled={step.lock_m || step.lock_line1}
          tag={two ? <span className={`${styles.lineTag} ${styles.tag1}`} /> : null}
          onChange={(i) => {
            setMi(i);
            emit({ m: M_VALUES[i].toString() });
          }}
        />
        <Slider
          id="sl-c"
          label={two ? 'c_1' : 'c'}
          list={C_VALUES}
          index={ci}
          disabled={step.lock_c || step.lock_line1}
          tag={two ? <span className={`${styles.lineTag} ${styles.tag1}`} /> : null}
          onChange={(i) => {
            setCi(i);
            emit({ c: C_VALUES[i].toString() });
          }}
        />
        {two && (
          <>
            <Slider
              id="sl-m2"
              label="m_2"
              list={M_VALUES}
              index={m2i}
              tag={<span className={`${styles.lineTag} ${styles.tag2}`} />}
              onChange={(i) => {
                setM2i(i);
                emit({ m2: M_VALUES[i].toString() });
              }}
            />
            <Slider
              id="sl-c2"
              label="c_2"
              list={C_VALUES}
              index={c2i}
              tag={<span className={`${styles.lineTag} ${styles.tag2}`} />}
              onChange={(i) => {
                setC2i(i);
                emit({ c2: C_VALUES[i].toString() });
              }}
            />
          </>
        )}
      </div>

      {two && (
        <div className={styles.status} aria-live="polite">
          <span className={styles.chip}>
            <MathText tex={`m_1 \\times m_2 = ${m.mul(m2).toTex()}`} />
          </span>
          <span className={`${styles.chip} ${styles.chipStrong}`}>{status}</span>
          {intersect && (
            <span className={styles.chip}>
              Titik potong <MathText tex={`(${intersect.x.toTex()},\\ ${intersect.y.toTex()})`} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
