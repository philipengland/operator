// Mascot (simple component): the telephone operator character from the design guide, at the
// small size, painted in the theme's own colours (spec-003 FR-311; docs/contracts/component-library.md).
// Decoration: hidden from screen readers.

export type MascotPaint = 'ink' | 'paper' | 'accent';

export interface MascotShape {
  readonly tag: 'circle' | 'ellipse' | 'path' | 'rect';
  /** Geometry and stroke width, in the design guide's 84 × 84 drawing. */
  readonly geometry: Readonly<Record<string, string>>;
  readonly fill?: MascotPaint;
  readonly stroke?: MascotPaint;
}

export interface MascotModel {
  readonly sizeInPixels: number;
  readonly viewBox: string;
  readonly shapes: readonly MascotShape[];
}

const SMALL_SIZE_IN_PIXELS = 76;
const DRAWING = '0 0 84 84';

// The design guide's small mascot, shape for shape; its colours #1A1A1A, #F1E6CF and #BF1E1E are
// the Classic ink, paper and accent, so each theme repaints it.
const SHAPES: readonly MascotShape[] = [
  { tag: 'circle', geometry: { cx: '20', cy: '18', r: '11' }, fill: 'ink' },
  { tag: 'circle', geometry: { cx: '64', cy: '18', r: '11' }, fill: 'ink' },
  { tag: 'circle', geometry: { cx: '42', cy: '46', r: '31' }, fill: 'ink' },
  { tag: 'ellipse', geometry: { cx: '42', cy: '54', rx: '21', ry: '17' }, fill: 'paper' },
  { tag: 'circle', geometry: { cx: '32', cy: '38', r: '9', 'stroke-width': '2' }, fill: 'paper', stroke: 'ink' },
  { tag: 'circle', geometry: { cx: '54', cy: '38', r: '9', 'stroke-width': '2' }, fill: 'paper', stroke: 'ink' },
  { tag: 'path', geometry: { d: 'M32 38 L41 38 A9 9 0 0 1 32 47 Z' }, fill: 'ink' },
  { tag: 'path', geometry: { d: 'M54 38 L63 38 A9 9 0 0 1 54 47 Z' }, fill: 'ink' },
  { tag: 'ellipse', geometry: { cx: '42', cy: '50', rx: '5', ry: '3.5' }, fill: 'ink' },
  { tag: 'path', geometry: { d: 'M31 58 Q42 72 53 58 Z', 'stroke-width': '2.5', 'stroke-linejoin': 'round' }, fill: 'accent', stroke: 'ink' },
  { tag: 'path', geometry: { d: 'M11 44 Q8 8 42 8 Q76 8 73 44', 'stroke-width': '5', 'stroke-linecap': 'round' }, stroke: 'accent' },
  { tag: 'rect', geometry: { x: '4', y: '38', width: '12', height: '18', rx: '6', 'stroke-width': '2' }, fill: 'accent', stroke: 'paper' },
  { tag: 'rect', geometry: { x: '68', y: '38', width: '12', height: '18', rx: '6', 'stroke-width': '2' }, fill: 'accent', stroke: 'paper' },
];

export function mascotModel(): MascotModel {
  return { sizeInPixels: SMALL_SIZE_IN_PIXELS, viewBox: DRAWING, shapes: SHAPES };
}
