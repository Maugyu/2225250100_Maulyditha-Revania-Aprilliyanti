import { useMemo } from 'react';
import { parseNumber } from '@/lib/math/fraction';
import { MathText } from '@/components/ui/RichText';
import GraphCanvas, { LinePath } from './GraphCanvas';
import { latticePointsOnLine, makeScale, snap } from './coords';
import styles from './graph.module.css';

const same = (a, b) => a[0] === b[0] && a[1] === b[1];

function gridOf(step) {
  const g = step.grid || { x_min: -5, x_max: 5, y_min: -5, y_max: 5 };
  return { x_step: 1, y_step: 1, ...g };
}

/** Plot titik dari tabel (F-06 mode plot). Titik menempel ke kisi; ketuk lagi untuk menghapus. */
export function PlotPoints({ step, points, onChange, solved }) {
  const grid = gridOf(step);
  const equal = grid.x_step === grid.y_step && !grid.y_label;
  const scale = useMemo(() => makeScale(grid, { equal, height: 340 }), [grid, equal]);
  const placed = points || [];

  const toggle = ({ x, y }) => {
    const p = [snap(x, grid.x_step), snap(y, grid.y_step)];
    if (p[0] < grid.x_min || p[0] > grid.x_max || p[1] < grid.y_min || p[1] > grid.y_max) return;
    const exists = placed.some((q) => same(q, p));
    onChange(exists ? placed.filter((q) => !same(q, p)) : [...placed, p]);
  };

  const target = step.points;
  const lineThrough =
    solved && step.show_line && target.length >= 2
      ? (() => {
          const [a, b] = [target[0], target[target.length - 1]];
          const m = (b[1] - a[1]) / (b[0] - a[0]);
          return { m, c: a[1] - m * a[0] };
        })()
      : null;

  return (
    <div className={styles.wrap}>
      {step.table && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{step.table.x_label}</th>
              <th scope="col">{step.table.y_label}</th>
            </tr>
          </thead>
          <tbody>
            {target.map(([x, y]) => (
              <tr key={`${x},${y}`}>
                <td>{x}</td>
                <td>{y}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <GraphCanvas
        scale={scale}
        grid={grid}
        xLabel={grid.x_label}
        yLabel={grid.y_label}
        onPointer={solved ? undefined : toggle}
        ariaLabel={`Grid untuk menempatkan titik. Titik terpasang: ${placed.map((p) => `(${p[0]}, ${p[1]})`).join(', ') || 'belum ada'}`}
      >
        {(s) => (
          <>
            {lineThrough && <LinePath scale={s} m={lineThrough.m} c={lineThrough.c} className={styles.lineGhost} />}
            {placed.map(([x, y]) => (
              <circle key={`${x},${y}`} cx={s.toX(x)} cy={s.toY(y)} r="7" className={styles.point} />
            ))}
          </>
        )}
      </GraphCanvas>
      <p className={styles.status} aria-live="polite">
        <span className={styles.chip}>
          {placed.length} dari {target.length} titik
        </span>
        {placed.length > 0 && !solved && (
          <span className={styles.chip}>Terakhir: ({placed.at(-1).join(', ')})</span>
        )}
      </p>
    </div>
  );
}

/**
 * Baca titik dari grafik (F-06 mode baca) dengan fading:
 * level 1 = titik disorot & koordinat terisi otomatis; level 2 = disorot, ketik sendiri; level 3 = tanpa sorotan.
 */
export function ReadPoints({ step, points, onChange, solved }) {
  const grid = gridOf(step);
  const scale = useMemo(() => makeScale(grid), [grid]);
  const m = parseNumber(step.line.m);
  const c = parseNumber(step.line.c);
  const lattice = useMemo(() => latticePointsOnLine(m, c, grid), [m, c, grid]);
  const value = points && points.length === 2 ? points : [['', ''], ['', '']];

  const setCoord = (i, j, v) => {
    const next = value.map((p) => [...p]);
    next[i][j] = v;
    onChange(next);
  };

  const pick = (pt) => {
    if (step.level !== 1 || solved) return;
    const filled = value.filter((p) => p[0] !== '' && p[1] !== '');
    const already = filled.some((p) => Number(p[0]) === pt[0] && Number(p[1]) === pt[1]);
    if (already) return;
    const next = filled.length >= 2 ? [value[1], pt.map(String)] : [...filled, pt.map(String)];
    while (next.length < 2) next.push(['', '']);
    onChange(next.map((p) => p.map(String)));
  };

  const picked = value.filter((p) => p[0] !== '' && p[1] !== '').map((p) => [Number(p[0]), Number(p[1])]);

  return (
    <div className={styles.wrap}>
      <GraphCanvas scale={scale} grid={grid} ariaLabel="Grafik sebuah garis lurus">
        {(s) => (
          <>
            <LinePath scale={s} m={m} c={c} className={styles.line1} />
            {step.level <= 2 &&
              lattice.map((pt) => (
                <g key={pt.join(',')}>
                  <circle
                    cx={s.toX(pt[0])}
                    cy={s.toY(pt[1])}
                    r="9"
                    className={picked.some((q) => same(q, pt)) ? styles.pointPicked : styles.pointCandidate}
                    onClick={() => pick(pt)}
                    role={step.level === 1 ? 'button' : undefined}
                    aria-label={step.level === 1 ? `Pilih titik (${pt[0]}, ${pt[1]})` : undefined}
                  />
                  {step.level === 1 && picked.some((q) => same(q, pt)) && (
                    <text x={s.toX(pt[0]) + 11} y={s.toY(pt[1]) - 9} className={styles.triLabel}>
                      ({pt[0]}, {pt[1]})
                    </text>
                  )}
                </g>
              ))}
          </>
        )}
      </GraphCanvas>
      <div className={styles.coordInputs}>
        {[0, 1].map((i) => (
          <div key={i} className={styles.coordRow}>
            <span>Titik {i + 1}:</span>
            <MathText tex="(" />
            <input
              aria-label={`x titik ${i + 1}`}
              inputMode="text"
              value={value[i][0]}
              readOnly={step.level === 1 || solved}
              onChange={(e) => setCoord(i, 0, e.target.value)}
            />
            ,
            <input
              aria-label={`y titik ${i + 1}`}
              inputMode="text"
              value={value[i][1]}
              readOnly={step.level === 1 || solved}
              onChange={(e) => setCoord(i, 1, e.target.value)}
            />
            <MathText tex=")" />
          </div>
        ))}
      </div>
    </div>
  );
}
