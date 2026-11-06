// The component catalogue (spec-003, development only): every component of the library in every
// state and theme. Built by `npm run build:catalogue`; never part of the game's build.

import '../ui/foundations/tokens.css';
import './catalogue.css';
import { applyTheme, CLASSIC, type Theme } from '../ui/foundations/themes';
import { LIBRARY, type CatalogueEntry, type CatalogueSection } from './library';
import { SAMPLES, type Sample } from './samples';


// Every theme the catalogue can switch to; the other five arrive with User Story 4.
const THEMES: readonly Theme[] = [CLASSIC];

const root = document.getElementById('catalogue');
if (!root) {
  throw new Error('catalogue.html must contain <main id="catalogue">.');
}

applyTheme(document.documentElement, CLASSIC);
root.replaceChildren(heading('h1', 'Operator component catalogue'), themeSwitch(CLASSIC), ...(Object.keys(LIBRARY) as CatalogueSection[]).map(section));

/** A tier: its heading, then one region per component (spec-003 AC-1). */
function section(name: CatalogueSection): HTMLElement {
  return region(name, heading('h2', name), ...LIBRARY[name].map(componentRegion));
}

/**
 * One component, named by the component, with its samples; until it is built, which part builds it;
 * once built, for combined components, what it is built from (spec-003 AC-7).
 */
function componentRegion(entry: CatalogueEntry): HTMLElement {
  const placeholder = entry.notBuiltYet ? [paragraph(entry.notBuiltYet)] : [];
  const parts = entry.builtFrom ? [paragraph(`Built from: ${entry.builtFrom.join(', ')}`)] : [];
  const samples = document.createElement('div');
  samples.className = 'samples';
  samples.append(...(SAMPLES[entry.name] ?? []).map(sampleGroup));
  return region(entry.name, heading('h3', entry.name), ...placeholder, ...parts, samples);
}

/** A sample: a group named by its label, holding the component first and a visible caption. */
function sampleGroup(sample: Sample): HTMLElement {
  const group = document.createElement('div');
  group.className = 'sample';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', sample.label);
  const caption = paragraph(sample.label);
  caption.className = 'sample-label';
  caption.setAttribute('aria-hidden', 'true');
  group.append(sample.render(), caption);
  return group;
}

function region(name: string, ...children: readonly HTMLElement[]): HTMLElement {
  const element = document.createElement('section');
  element.setAttribute('aria-label', name);
  element.append(...children);
  return element;
}

function paragraph(text: string): HTMLElement {
  const element = document.createElement('p');
  element.textContent = text;
  return element;
}

/** A group named "Theme" with one button per theme; the shown theme is pressed (FR-325). */
function themeSwitch(current: Theme): HTMLElement {
  const group = document.createElement('div');
  group.className = 'theme-switch';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Theme');
  group.append(
    ...THEMES.map((theme) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = theme.label;
      button.setAttribute('aria-pressed', String(theme === current));
      return button;
    }),
  );
  return group;
}

function heading(level: 'h1' | 'h2' | 'h3', text: string): HTMLElement {
  const element = document.createElement(level);
  element.textContent = text;
  return element;
}
