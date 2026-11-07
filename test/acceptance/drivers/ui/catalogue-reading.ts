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
  const control = children.find((line) => !/^\s*- text\b/.test(line));
  if (control !== undefined) {
    return parseNode(control);
  }
  if (children.length > 0) {
    // Only text: a screen reader reads all of it, in order.
    const words = children.map((line) => parseNode(line)?.name ?? '').filter((name) => name !== '');
    return { role: 'text', name: words.join(' '), states: [] };
  }
  // A group whose only content is text is written on one line: `- group "None yet": Found 0 of 2`.
  const inlineText = snapshot.split('\n')[0]?.match(/^- [a-z]+(?: "(?:[^"\\]|\\.)*")?(?: \[[^\]]+\])*: (.+)$/)?.[1];
  return inlineText === undefined ? null : { role: 'text', name: inlineText, states: [] };
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
  return readView(group.locator(':scope > *').first(), await group.ariaSnapshot());
}

/** A part of a screen, read like a sample: its own ARIA snapshot, as if it were a group's content. */
export async function readPartView(part: Locator): Promise<SampleView> {
  const snapshot = await part.ariaSnapshot();
  const asGroup = ['- part:', ...snapshot.split('\n').map((line) => `  ${line}`)].join('\n');
  return readView(part, asGroup);
}

async function readView(content: Locator, groupSnapshot: string): Promise<SampleView> {
  const heard = firstNodeIn(groupSnapshot);
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

/**
 * The text a sample shows: a field's value, or its hint when empty; otherwise its rendered text,
 * leaving out words only a screen reader gets (visually hidden and heard). An icon's character,
 * hidden inside an icon that is named as a whole or hidden, stands for its drawing and counts.
 */
export async function shownText(content: Locator): Promise<string> {
  return content.evaluate((element) => {
    const field = element instanceof HTMLInputElement ? element : element.querySelector('input');
    if (field) {
      return field.value || field.placeholder;
    }
    const isHeardOnly = (part: Element) => {
      const box = part.getBoundingClientRect();
      return box.width <= 1 && box.height <= 1 && part.textContent !== '' && !part.closest('[aria-hidden="true"], [role="img"]');
    };
    const heardOnly = Array.from(element.querySelectorAll<HTMLElement>('*')).filter(isHeardOnly);
    const displays = heardOnly.map((part) => part.style.display);
    heardOnly.forEach((part) => (part.style.display = 'none'));
    const text = (element as HTMLElement).innerText;
    heardOnly.forEach((part, index) => (part.style.display = displays[index] ?? ''));
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

/**
 * Runs in the page: every colour drawn by a visible element, as #RRGGBB — text, fill, outlines,
 * borders, shadows and a drawing's paint. Fully transparent colours draw nothing and are left out;
 * a part-transparent one is kept as written, so it can never match a theme colour.
 */
export function readColoursInUse(): readonly string[] {
  const asHex = (colour: string): string | null => {
    const [red, green, blue, alpha = 1] = colour.match(/[\d.]+/g)?.map(Number) ?? [];
    if (blue === undefined || alpha === 0) {
      return null; // "none", "transparent" or fully transparent: nothing is drawn
    }
    const hex = `#${[red, green, blue].map((channel) => Number(channel).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
    return alpha === 1 ? hex : colour;
  };
  const drawnBy = (element: Element): readonly string[] => {
    const style = getComputedStyle(element);
    const sides = ['Top', 'Right', 'Bottom', 'Left'] as const;
    const borders = sides
      .filter((side) => style.getPropertyValue(`border-${side.toLowerCase()}-style`) !== 'none' && Number.parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0)
      .map((side) => style.getPropertyValue(`border-${side.toLowerCase()}-color`));
    const outline = style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0 ? [style.outlineColor] : [];
    const shadows = style.boxShadow === 'none' ? [] : (style.boxShadow.match(/rgba?\([^)]*\)/g) ?? []);
    const paint = element instanceof SVGElement && !(element instanceof SVGSVGElement) ? [style.fill, style.stroke] : [];
    return [style.color, style.backgroundColor, ...borders, ...outline, ...shadows, ...paint];
  };
  const isVisible = (element: Element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility === 'visible';
  const elements = [document.documentElement, document.body, ...Array.from(document.body.querySelectorAll('*'))].filter(isVisible);
  const colours = new Set(elements.flatMap(drawnBy).map(asHex).filter((colour): colour is string => colour !== null));
  return [...colours];
}

/** The page's dots as declared on the root element: its paper, and the dot size and spacing. */
export interface DeclaredDots {
  readonly paper: string;
  readonly hasDots: boolean;
  readonly sizeInPixels: number;
  readonly everyPixels: number;
}

/**
 * Runs in the page: the root element's paper (#RRGGBB) and, when its background image is a
 * radial gradient, the dot's size (twice the first stop's radius) and spacing (the tile size).
 */
export function readDeclaredDots(): DeclaredDots {
  const style = getComputedStyle(document.documentElement);
  const [red = 0, green = 0, blue = 0] = style.backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
  const paper = `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
  const hasDots = style.backgroundImage.startsWith('radial-gradient');
  const firstStopRadius = Number.parseFloat(style.backgroundImage.match(/\)\s+([\d.]+)px/)?.[1] ?? 'NaN');
  const tile = Number.parseFloat(style.backgroundSize);
  return { paper, hasDots, sizeInPixels: firstStopRadius * 2, everyPixels: tile };
}

/**
 * Runs in the page: the colour at the middle of a screenshot of one tile of the dot grid, which
 * is the middle of a dot, as #RRGGBB; null when it is the paper (no dot drawn there). The middle,
 * not the darkest pixel: WebKit draws a darker 2 × 2 speck at the very corner of the document.
 */
export async function readDotColour([pngBase64, paper]: readonly [string, string]): Promise<string | null> {
  // Decoded here, inside the page function: a function run in the page cannot call others.
  const bytes = Uint8Array.from(atob(pngBase64), (character) => character.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d');
  context?.drawImage(bitmap, 0, 0);
  const middle = context?.getImageData(Math.floor(bitmap.width / 2), Math.floor(bitmap.height / 2), 1, 1).data ?? new Uint8ClampedArray(4);
  const colour = `#${Array.from(middle.slice(0, 3), (channel) => channel.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
  return colour === paper.toUpperCase() ? null : colour;
}

/** What to look for when asking whether the page's dots show through part of the screen. */
export interface DotSearch {
  readonly pngBase64: string;
  readonly area: Rectangle;
  readonly dotColour: string;
  readonly paper: string;
  readonly tile: number;
}

/**
 * Runs in the page: whether a screenshot of an area shows the page's dot pattern, meaning a point
 * of the page's dot grid that is the dot colour with paper 3 pixels to each side (within one level
 * per channel). Text edges can be the dot colour too, but never in that pattern.
 */
export async function readDotsShowing({ pngBase64, area, dotColour, paper, tile }: DotSearch): Promise<boolean> {
  // Decoded here, inside the page function: a function run in the page cannot call others.
  const bytes = Uint8Array.from(atob(pngBase64), (character) => character.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d');
  context?.drawImage(bitmap, 0, 0);
  const data = context?.getImageData(0, 0, bitmap.width, bitmap.height).data ?? new Uint8ClampedArray();
  const channelsOf = (colour: string) => (colour.match(/[0-9a-f]{2}/gi) ?? []).map((pair) => Number.parseInt(pair, 16));
  const [dot, page] = [channelsOf(dotColour), channelsOf(paper)];
  const scale = bitmap.width / area.width;
  const isColourAt = (x: number, y: number, colour: readonly number[]) => {
    const [column, row] = [Math.floor((x - area.x) * scale), Math.floor((y - area.y) * scale)];
    if (column < 0 || row < 0 || column >= bitmap.width || row >= bitmap.height) {
      return false;
    }
    const index = (row * bitmap.width + column) * 4;
    return colour.every((value, channel) => Math.abs((data[index + channel] ?? 0) - value) <= 1);
  };
  const gap = 3;
  const firstCentre = (from: number, scroll: number) => Math.ceil((from + scroll - tile / 2) / tile) * tile + tile / 2 - scroll;
  for (let y = firstCentre(area.y, window.scrollY); y < area.y + area.height; y += tile) {
    for (let x = firstCentre(area.x, window.scrollX); x < area.x + area.width; x += tile) {
      const isDot = isColourAt(x, y, dot);
      const hasPaperAround = [[gap, 0], [-gap, 0], [0, gap], [0, -gap]].every(([dx = 0, dy = 0]) => isColourAt(x + dx, y + dy, page));
      if (isDot && hasPaperAround) {
        return true;
      }
    }
  }
  return false;
}

export interface Rectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Runs in the page: the inside of every surface drawn in a part (the part itself and every element
 * in it that has a fill or an outline, at least 8 pixels each way), in viewport pixels. An
 * outlined shape counts even if its fill is missing, so a missing fill is seen. Each is kept
 * inside its outline and its rounded corners.
 */
export function readDrawnSurfaces(part: Element): readonly Rectangle[] {
  const isDrawn = (element: Element) => {
    const style = getComputedStyle(element);
    const fill = style.backgroundColor;
    const hasFill = fill !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(fill) && !/\/\s*0\)$/.test(fill);
    const hasOutline = style.borderTopStyle !== 'none' && Number.parseFloat(style.borderTopWidth) > 0;
    return hasFill || hasOutline;
  };
  // The largest rectangle inside a rounded shape stays 30% of the corner radius in from each side
  // (1 − 1/√2 ≈ 0.29), so even a pill-shaped key keeps most of its inside.
  const cornerShare = 0.3;
  const inside = (element: Element): Rectangle => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const outline = Number.parseFloat(style.borderTopWidth) || 0;
    const corner = Math.min(Number.parseFloat(style.borderTopLeftRadius) || 0, box.width / 2, box.height / 2);
    const inset = outline + corner * cornerShare + 1;
    return { x: box.left + inset, y: box.top + inset, width: box.width - 2 * inset, height: box.height - 2 * inset };
  };
  const smallest = 8;
  return [part, ...Array.from(part.querySelectorAll('*'))]
    .filter(isDrawn)
    .map(inside)
    .filter((rectangle) => rectangle.width >= smallest && rectangle.height >= smallest);
}
