// spec-003 research R2 (FR-303, FR-304): combined components and screens may only lay out their
// parts. Only simple components give anything its look. This check reads their stylesheets from
// disk: Vitest replaces CSS imports with empty strings, so it cannot run inside src/.

// Properties that give a part its look rather than its place.
const STYLING = /^(color|background(-.+)?|border(-color|-radius)?|box-shadow|font-(family|size|weight)|outline)$/;

/** The declarations in a stylesheet that style rather than lay out. */
export function stylingDeclarationsIn(css: string): readonly string[] {
  return Array.from(css.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g), ([, property = '', value = '']) => ({ property, value: value.trim() }))
    .filter(({ property, value }) => STYLING.test(property) && value !== 'none')
    .map(({ property, value }) => `${property}: ${value}`);
}
