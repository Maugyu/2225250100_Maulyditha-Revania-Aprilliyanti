import { useId, useRef } from 'react';
import { pointerToSvg, ticks } from './coords';
import styles from './graph.module.css';

/**
 * Kanvas grafik SVG: grid, sumbu berlabel, area klip. Isi digambar lewat render-prop children(scale).
 * @param {{ scale: object, grid: object, onPointer?: (world:{x:number,y:number})=>void,
 *           xLabel?: string, yLabel?: string, ariaLabel: string, children: Function }} props
 */
export default function GraphCanvas({ scale, grid, onPointer, xLabel, yLabel, ariaLabel, children }) {
  const svgRef = useRef(null);
  const clip = `clip${useId().replace(/:/g, '')}`;
  const xStep = grid.x_step || 1;
  const yStep = grid.y_step || 1;
  const { toX, toY, xMin, xMax, yMin, yMax, width, height, pad } = scale;
  const axisY = yMin <= 0 && yMax >= 0 ? toY(0) : toY(yMin);
  const axisX = xMin <= 0 && xMax >= 0 ? toX(0) : toX(xMin);
  const xt = ticks(xMin, xMax, xStep);
  const yt = ticks(yMin, yMax, yStep);
  const labelEvery = (n) => (n > 16 ? 2 : 1);

  const handle = (e) => {
    if (!onPointer) return;
    const { px, py } = pointerToSvg(e, svgRef.current, scale);
    onPointer({ x: scale.fromX(px), y: scale.fromY(py) });
  };

  return (
    <svg
      ref={svgRef}
      className={styles.svg}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      onPointerDown={handle}
      style={{ cursor: onPointer ? 'crosshair' : 'default', touchAction: onPointer ? 'none' : 'auto' }}
    >
      <defs>
        <clipPath id={clip}>
          <rect x={pad} y={pad} width={width - 2 * pad} height={height - 2 * pad} />
        </clipPath>
      </defs>
      <rect x={pad} y={pad} width={width - 2 * pad} height={height - 2 * pad} className={styles.plotBg} />
      {xt.map((v) => (
        <line key={`gx${v}`} x1={toX(v)} x2={toX(v)} y1={pad} y2={height - pad} className={styles.grid} />
      ))}
      {yt.map((v) => (
        <line key={`gy${v}`} y1={toY(v)} y2={toY(v)} x1={pad} x2={width - pad} className={styles.grid} />
      ))}
      <line x1={pad} x2={width - pad} y1={axisY} y2={axisY} className={styles.axis} />
      <line y1={pad} y2={height - pad} x1={axisX} x2={axisX} className={styles.axis} />
      {xt.map((v, i) =>
        v !== 0 && i % labelEvery(xt.length) === 0 ? (
          <text key={`tx${v}`} x={toX(v)} y={axisY + 14} className={styles.tick} textAnchor="middle">
            {v}
          </text>
        ) : null,
      )}
      {yt.map((v, i) =>
        v !== 0 && i % labelEvery(yt.length) === 0 ? (
          <text key={`ty${v}`} x={axisX - 5} y={toY(v) + 4} className={styles.tick} textAnchor="end">
            {v}
          </text>
        ) : null,
      )}
      <text x={axisX - 5} y={axisY + 14} className={styles.tick} textAnchor="end">
        0
      </text>
      <text x={width - pad} y={axisY - 6} className={styles.axisLabel} textAnchor="end">
        {xLabel || 'x'}
      </text>
      <text x={axisX + 6} y={pad - 8} className={styles.axisLabel}>
        {yLabel || 'y'}
      </text>
      <g clipPath={`url(#${clip})`}>{children(scale)}</g>
    </svg>
  );
}

/** Garis y = mx + c di seluruh lebar grid (dipotong oleh clipPath). */
export function LinePath({ scale, m, c, className, dashed }) {
  const mv = Number(m);
  const cv = Number(c);
  const x1 = scale.xMin - 1;
  const x2 = scale.xMax + 1;
  return (
    <line
      x1={scale.toX(x1)}
      y1={scale.toY(mv * x1 + cv)}
      x2={scale.toX(x2)}
      y2={scale.toY(mv * x2 + cv)}
      className={className}
      strokeDasharray={dashed ? '9 7' : undefined}
    />
  );
}
