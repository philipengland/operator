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
