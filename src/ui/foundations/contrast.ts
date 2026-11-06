// WCAG 2.2 contrast between two #RRGGBB colours (spec-003 AC-21, research R6).
// Formulas: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance and #dfn-contrast-ratio.

const CHANNEL_MAX = 255;
const HEX_BASE = 16;
const LINEAR_THRESHOLD = 0.04045;
const LINEAR_SLOPE = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_SCALE = 1.055;
const GAMMA = 2.4;
const RED_WEIGHT = 0.2126;
const GREEN_WEIGHT = 0.7152;
const BLUE_WEIGHT = 0.0722;
const FLARE = 0.05;

/** How many times brighter the lighter colour is than the darker, from 1 (same) to 21 (black on white). */
export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return ((lighter ?? 0) + FLARE) / ((darker ?? 0) + FLARE);
}

function relativeLuminance(colour: string): number {
  const [red = 0, green = 0, blue = 0] = (colour.match(/[0-9a-f]{2}/gi) ?? []).map((pair) => linear(Number.parseInt(pair, HEX_BASE) / CHANNEL_MAX));
  return RED_WEIGHT * red + GREEN_WEIGHT * green + BLUE_WEIGHT * blue;
}

function linear(value: number): number {
  return value <= LINEAR_THRESHOLD ? value / LINEAR_SLOPE : ((value + GAMMA_OFFSET) / GAMMA_SCALE) ** GAMMA;
}
