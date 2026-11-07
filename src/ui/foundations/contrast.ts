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
  const [red = 0, green = 0, blue = 0] = channelsOf(colour).map((channel) => linear(channel / CHANNEL_MAX));
  return RED_WEIGHT * red + GREEN_WEIGHT * green + BLUE_WEIGHT * blue;
}

function linear(value: number): number {
  return value <= LINEAR_THRESHOLD ? value / LINEAR_SLOPE : ((value + GAMMA_OFFSET) / GAMMA_SCALE) ** GAMMA;
}

/** The colour of `share` of `foreground` laid over `background`, as #RRGGBB. */
export function blend(foreground: string, background: string, share: number): string {
  const [front, back] = [channelsOf(foreground), channelsOf(background)];
  const mixed = front.map((channel, index) => Math.round(share * channel + (1 - share) * (back[index] ?? 0)));
  return `#${mixed.map((channel) => channel.toString(HEX_BASE).padStart(2, '0')).join('')}`.toUpperCase();
}

/** Red, green and blue of a #RRGGBB colour, 0 to 255. */
function channelsOf(colour: string): readonly number[] {
  return (colour.match(/[0-9a-f]{2}/gi) ?? []).map((pair) => Number.parseInt(pair, HEX_BASE));
}
