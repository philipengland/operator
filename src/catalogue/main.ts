// The component catalogue (spec-003, development only): every component of the library in every
// state and theme. Built by `npm run build:catalogue`; never part of the game's build.

import '../ui/foundations/tokens.css';
import './catalogue.css';
import { applyTheme, CLASSIC, type Theme } from '../ui/foundations/themes';

// The tiers, in the order the catalogue shows them (spec-003 AC-1).
const SECTIONS = ['Foundations', 'Simple components', 'Combined components', 'Screens'] as const;

// Every theme the catalogue can switch to; the other five arrive with User Story 4.
const THEMES: readonly Theme[] = [CLASSIC];

const root = document.getElementById('catalogue');
if (!root) {
  throw new Error('catalogue.html must contain <main id="catalogue">.');
}

applyTheme(document.documentElement, CLASSIC);
root.replaceChildren(heading('h1', 'Operator component catalogue'), themeSwitch(CLASSIC), ...SECTIONS.map(section));

function section(name: string): HTMLElement {
  const region = document.createElement('section');
  region.setAttribute('aria-label', name);
  region.append(heading('h2', name));
  return region;
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

function heading(level: 'h1' | 'h2', text: string): HTMLElement {
  const element = document.createElement(level);
  element.textContent = text;
  return element;
}
