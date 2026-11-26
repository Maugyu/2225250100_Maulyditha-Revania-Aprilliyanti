/** Transformasi koordinat dunia <-> layar untuk grafik SVG (murni, dapat dites). */
import { Fraction } from '@/lib/math/fraction';

/**
 * @param {{x_min:number,x_max:number,y_min:number,y_max:number}} grid
 * @param {{width?:number,height?:number,equal?:boolean,pad?:number}} opts
 */
export function makeScale(grid, { width = 360, height = 300, equal = true, pad = 30 } = {}) {
  const { x_min: xMin, x_max: xMax, y_min: yMin, y_max: yMax } = grid;
  const ux = (width - 2 * pad) / (xMax - xMin);
  let uy = (height - 2 * pad) / (yMax - yMin);
  let h = height;
  if (equal) {
    uy = ux; // skala 1:1 agar sudut siku-siku tampak benar (US-06 AC3)
    h = ux * (yMax - yMin) + 2 * pad;
  }
  return {
    width,
    height: h,
    pad,
    ux,
    uy,
    xMin,
    xMax,
    yMin,
    yMax,
    toX: (x) => pad + (x - xMin) * ux,
    toY: (y) => h - pad - (y - yMin) * uy,
    fromX: (px) => xMin + (px - pad) / ux,
    fromY: (py) => yMin + (h - pad - py) / uy,
  };
}

export function snap(v, step = 1) {
  const r = Math.round(v / step) * step;
  return Object.is(r, -0) ? 0 : Number(r.toFixed(6));
}

export function ticks(min, max, step = 1) {
  const out = [];
  const start = Math.ceil(min / step) * step;
  for (let v = start; v <= max + 1e-9; v += step) out.push(Number(v.toFixed(6)));
  return out;
}

/** Titik-titik kisi (bilangan bulat) yang tepat dilalui garis y = mx + c di dalam grid. */
export function latticePointsOnLine(m, c, grid) {
  const pts = [];
  for (let x = Math.ceil(grid.x_min); x <= grid.x_max; x += 1) {
    const y = m.mul(new Fraction(x)).add(c);
    if (y.den === 1 && y.num >= grid.y_min && y.num <= grid.y_max) pts.push([x, y.num]);
  }
  return pts;
}

/** Konversi posisi pointer pada elemen SVG ke koordinat viewBox. */
export function pointerToSvg(evt, svg, scale) {
  const rect = svg.getBoundingClientRect();
  const px = ((evt.clientX - rect.left) / rect.width) * scale.width;
  const py = ((evt.clientY - rect.top) / rect.height) * scale.height;
  return { px, py };
}
