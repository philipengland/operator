// Layer 3 — reading a catalogue sample: its node in the accessibility tree, the text it shows, and
// its look in the theme's own colour names (spec-003). No assertions here; the DSL decides.

import type { Locator } from '@playwright/test';
import type { SampleAppearance, SampleView } from '../catalogue.driver';
import type { Box } from '../phone.driver';

// Unknown positions: NaN compares false, so nothing unread can pass a layout check.
export const NO_BOX: Box = { left: Number.NaN, top: Number.NaN, right: Number.NaN, bottom: Number.NaN };

export interface HeardNode {
  readonly role: string;
  readonly name: string | null;
  readonly states: readonly string[];
}

/**
 * The first node inside a group's ARIA snapshot (Playwright's YAML form), e.g.
 * `- group "Main":\n  - button "Put it through!, Check" [disabled]`. Null when nothing is heard.
 */
export function firstNodeIn(snapshot: string): HeardNode | null {
  const children = snapshot.split('\n').filter((line) => /^\s{2,}- /.test(line));
  // A field's visible label is read as text before the field: prefer the first node that is not
  // plain text, so a sample is heard as the control it shows.
  const child = children.find((line) => !/^\s*- text\b/.test(line)) ?? children[0];
  return child === undefined ? null : parseNode(child);
}

/** One line of an ARIA snapshot: role, quoted name or text, and [states]. */
function parseNode(line: string): HeardNode | null {
  const match = line.match(/^\s*- ([a-z]+)(?: "((?:[^"\\]|\\.)*)")?((?: \[[^\]]+\])*)(?::\s*(.*))?$/);
  if (!match) {
    return null;
  }
  const [, role = '', quotedName, states = '', textAfterColon] = match;
  const name = quotedName ?? (role === 'text' ? (textAfterColon ?? null) : null);
  return { role, name: name?.replace(/\\"/g, '"') ?? null, states: Array.from(states.matchAll(/\[([^\]=]+)/g), ([, state = '']) => state) };
}

/** A shown sample: its first element is the component; the group's ARIA snapshot is what is heard. */
export async function readSampleView(group: Locator): Promise<SampleView> {
  const content = group.locator(':scope > *').first();
  const heard = firstNodeIn(await group.ariaSnapshot());
  const states = heard?.states ?? [];
  return {
    text: await shownText(content),
    heardAs: heard?.name ?? null,
    isButton: heard?.role === 'button',
    isTextbox: heard?.role === 'textbox',
    isUnavailable: states.includes('disabled'),
    isSelected: states.includes('pressed'),
    box: await boxOf(content),
  };
}

async function boxOf(element: Locator): Promise<Box> {
  const box = await element.boundingBox();
  return box ? { left: box.x, top: box.y, right: box.x + box.width, bottom: box.y + box.height } : NO_BOX;
}

/** The text a sample shows: a field's value, or its hint when empty; otherwise its visible text. */
export async function shownText(content: Locator): Promise<string> {
  return content.evaluate((element) => {
    const field = element instanceof HTMLInputElement ? element : element.querySelector('input');
    const text = field ? field.value || field.placeholder : (element as HTMLElement).innerText;
    return text.replace(/\s+/g, ' ').trim();
  });
}

/** The element whose text a sample shows: its field when it has one, otherwise the component. */
export function textElement(group: Locator): Locator {
  const content = group.locator(':scope > *').first();
  return content.locator('input').or(content.locator(':scope:not(:has(input))')).first();
}

/** Runs in the page: the first family in the element's font stack that is loaded and in use. */
export function readTypeface(element: Element): string {
  const unquote = (family: string) => family.trim().replace(/^["']|["']$/g, '');
  const families = getComputedStyle(element).fontFamily.split(',').map(unquote);
  const loaded = new Set(
    Array.from(document.fonts)
      .filter((face) => face.status === 'loaded')
      .map((face) => unquote(face.family)),
  );
  return families.find((family) => loaded.has(family)) ?? families[families.length - 1] ?? '';
}

/** Runs in the page: the element's fill, outline, shadow and corners, as theme colour names. */
export function readAppearance(element: Element): SampleAppearance {
  const rootStyle = getComputedStyle(document.documentElement);
  const tokens = ['ink', 'paper', 'tile', 'accent'] as const;
  const asRgb = (hex: string): string => {
    const value = Number.parseInt(hex.trim().replace('#', ''), 16);
    return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`;
  };
  const tokenColours = tokens.map((token) => [token, asRgb(rootStyle.getPropertyValue(`--${token}`))] as const);
  const nameOf = (colour: string | undefined) => {
    if (!colour || colour === 'transparent' || colour === 'rgba(0, 0, 0, 0)') {
      return 'none' as const;
    }
    return tokenColours.find(([, rgb]) => rgb === colour)?.[0] ?? ('other' as const);
  };
  const style = getComputedStyle(element);
  const shadow = style.boxShadow === 'none' ? undefined : style.boxShadow.match(/rgba?\([^)]*\)/)?.[0];
  const borderStyle = style.borderTopStyle;
  const outline = borderStyle === 'solid' || borderStyle === 'dashed' ? borderStyle : 'none';
  const radius = (corner: string) => Number.parseFloat(corner);
  const others = [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius].map(radius);
  return {
    fill: nameOf(style.backgroundColor),
    outline,
    outlineColour: outline === 'none' ? 'none' : nameOf(style.borderTopColor),
    shadow: nameOf(shadow),
    hasTailCorner: others.every((corner) => radius(style.borderBottomLeftRadius) < corner),
  };
}

/**
 * Runs in the page: the WCAG contrast seen in a PNG screenshot with colour removed. Each pixel
 * becomes its relative luminance (the grey WCAG measures); the background is the most common
 * grey, and the sample is the grey that stands out most from it. Decoded from a Blob, which the
 * catalogue's content security policy allows (a data: URL would be blocked).
 */
export async function readGreyscaleContrast(pngBase64: string): Promise<number> {
  const bytes = Uint8Array.from(atob(pngBase64), (character) => character.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d');
  if (!context || bitmap.width === 0) {
    return 0;
  }
  context.drawImage(bitmap, 0, 0);
  const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
  const linear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const counts = new Map<number, number>();
  for (let index = 0; index < data.length; index += 4) {
    const luminance = 0.2126 * linear(data[index] ?? 0) + 0.7152 * linear(data[index + 1] ?? 0) + 0.0722 * linear(data[index + 2] ?? 0);
    const grey = Math.round(luminance * 1000) / 1000;
    counts.set(grey, (counts.get(grey) ?? 0) + 1);
  }
  const greys = [...counts.keys()];
  const background = greys.reduce((most, grey) => ((counts.get(grey) ?? 0) > (counts.get(most) ?? 0) ? grey : most));
  const contrastWith = (grey: number) => (Math.max(grey, background) + 0.05) / (Math.min(grey, background) + 0.05);
  return Math.max(...greys.map(contrastWith));
}
