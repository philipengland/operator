// spec-007 research R1, R2: seeded random numbers, the same on every device and in every later
// version. A seed text becomes a number by 32-bit FNV-1a; mulberry32 draws from it.

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** 32-bit FNV-1a over the text's characters. Seeds are plain ASCII, where characters and bytes agree. */
export function seedNumber(seedText: string): number {
  let hash = FNV_OFFSET_BASIS;
  for (const character of seedText) {
    hash = Math.imul(hash ^ (character.codePointAt(0) ?? 0), FNV_PRIME) >>> 0;
  }
  return hash;
}

export interface Random {
  /** A whole number from 0 to `below` − 1. */
  whole(below: number): number;
}

// mulberry32's constants. Integer multiplication and shifts give the same bits in every JavaScript
// engine, and a 32-bit value over 2^32 times a small number is exact, so nothing depends on rounding.
const MULBERRY_STEP = 0x6d2b79f5;
const SHIFT_15 = 15;
const SHIFT_7 = 7;
const SHIFT_14 = 14;
const MULBERRY_ODD = 61;
const TWO_TO_THE_32 = 4_294_967_296;

/** mulberry32 from a 32-bit seed (research R1). Each call to `whole` moves it on. */
export function randomFrom(seed: number): Random {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + MULBERRY_STEP) >>> 0;
    let mixed = Math.imul(state ^ (state >>> SHIFT_15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> SHIFT_7), mixed | MULBERRY_ODD);
    return ((mixed ^ (mixed >>> SHIFT_14)) >>> 0) / TWO_TO_THE_32;
  };
  return { whole: (below) => Math.floor(next() * below) };
}
