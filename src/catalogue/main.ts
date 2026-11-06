// The component catalogue (spec-003, development only): every component of the library in every
// state and theme. Built by `npm run build:catalogue`; never part of the game's build.
// `catalogue.html#play-screen` shows the play screen alone at full size, its switches below it.

import '../ui/foundations/tokens.css';
import './catalogue.css';
import { applyTheme, CLASSIC, THEMES, type Theme } from '../ui/foundations/themes';
import { createPlayScreen } from '../ui/screens/play-screen';
import { LIBRARY, type CatalogueEntry, type CatalogueSection } from './library';
import { SAMPLES, type Sample } from './samples';
import { screenSamplesFor, type ScreenSampleName } from './screen-samples';

const SCREEN_VIEW = '#play-screen';
const FIRST_SCREEN_SAMPLE: ScreenSampleName = 'Just opened';

const root = document.getElementById('catalogue');
if (!root) {
  throw new Error('catalogue.html must contain <main id="catalogue">.');
}
const catalogue = root;

// The theme shown, and what to redraw when it changes: the samples whose words are the theme's.
// Not remembered between visits (FR-325).
let shownTheme = CLASSIC;
let redrawInTheme: Array<(theme: Theme) => void> = [];

applyTheme(document.documentElement, shownTheme);
window.addEventListener('hashchange', render);
render();

function render(): void {
  redrawInTheme = [];
  const isScreenView = window.location.hash === SCREEN_VIEW;
  catalogue.className = isScreenView ? 'screen-view' : '';
  catalogue.replaceChildren(...(isScreenView ? screenView() : catalogueView()));
}

function catalogueView(): readonly HTMLElement[] {
  return [heading('h1', 'Operator component catalogue'), themeSwitch(), ...(Object.keys(LIBRARY) as CatalogueSection[]).map(section)];
}

/** The play screen alone, filling the phone's screen; the switches and the way back are below it. */
function screenView(): readonly HTMLElement[] {
  const { screen, sampleSwitch } = playScreenWithSampleSwitch();
  const screenRegion = region('Play screen', screen);
  screenRegion.className = 'screen-view__screen';
  const controls = document.createElement('div');
  controls.className = 'screen-view__controls';
  controls.append(themeSwitch(), sampleSwitch, link('Back to the catalogue', '#'));
  return [screenRegion, controls];
}

/** A tier: its heading, then one region per component (spec-003 AC-1). */
function section(name: CatalogueSection): HTMLElement {
  return region(name, heading('h2', name), ...LIBRARY[name].map(componentRegion));
}

/** One component, named by the component, with its samples and, for combined components and screens, what it is built from (spec-003 AC-7). */
function componentRegion(entry: CatalogueEntry): HTMLElement {
  const parts = entry.builtFrom ? [paragraph(`Built from: ${entry.builtFrom.join(', ')}`)] : [];
  return region(entry.name, heading('h3', entry.name), ...parts, ...componentSamples(entry.name));
}

/** A component's samples; the play screen's are switched in place, and it can be opened alone. */
function componentSamples(name: string): readonly HTMLElement[] {
  if (name === 'Play screen') {
    const { screen, sampleSwitch } = playScreenWithSampleSwitch();
    return [link('Open the play screen alone', SCREEN_VIEW), sampleSwitch, screen];
  }
  const samples = document.createElement('div');
  samples.className = 'samples';
  samples.append(...(SAMPLES[name] ?? []).map(sampleGroup));
  return [samples];
}

/** The play screen with a "Screen sample" switch that shows each sample in place (spec-003 AC-17). */
function playScreenWithSampleSwitch(): { readonly screen: HTMLElement; readonly sampleSwitch: HTMLElement } {
  let shownSample = FIRST_SCREEN_SAMPLE;
  const playScreen = createPlayScreen(screenSamplesFor(shownTheme)[shownSample]);
  const names = Object.keys(screenSamplesFor(shownTheme)) as ScreenSampleName[];
  const sampleSwitch = switchGroup('Screen sample', names, shownSample, (name) => {
    shownSample = name;
    playScreen.update(screenSamplesFor(shownTheme)[name]);
  });
  redrawInTheme.push((theme) => playScreen.update(screenSamplesFor(theme)[shownSample]));
  return { screen: playScreen.element, sampleSwitch };
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
  const drawn = sample.render(shownTheme);
  group.append(drawn, ...(sample.speaksInTheme ? speakingInEveryTheme(group, sample, drawn) : []), caption);
  return group;
}

/**
 * A sample whose words change with the theme keeps the size of its longest wording: invisible
 * copies in every theme's words share its place, so switching theme moves nothing (spec-003 AC-19).
 * The shown sample stays first and is redrawn on a switch.
 */
function speakingInEveryTheme(group: HTMLElement, sample: Sample, firstDrawn: HTMLElement): readonly HTMLElement[] {
  group.classList.add('sample--speaks');
  let drawn = firstDrawn;
  redrawInTheme.push((theme) => {
    const redrawn = sample.render(theme);
    drawn.replaceWith(redrawn);
    drawn = redrawn;
  });
  return THEMES.map((theme) => {
    const sizeKeeper = sample.render(theme);
    sizeKeeper.classList.add('sample__size-keeper');
    sizeKeeper.setAttribute('aria-hidden', 'true');
    return sizeKeeper;
  });
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

function link(text: string, href: string): HTMLElement {
  const element = document.createElement('a');
  element.href = href;
  element.textContent = text;
  return element;
}

/** A group named "Theme" with one button per theme; the shown theme is pressed (FR-325). */
function themeSwitch(): HTMLElement {
  const labels = THEMES.map((theme) => theme.label);
  return switchGroup('Theme', labels, shownTheme.label, (label) => showTheme(THEMES.find((theme) => theme.label === label) ?? CLASSIC));
}

/** Every colour changes through the four theme colours; only the samples that speak are redrawn, so nothing moves (spec-003 AC-19). */
function showTheme(theme: Theme): void {
  shownTheme = theme;
  applyTheme(document.documentElement, theme);
  redrawInTheme.forEach((redraw) => redraw(theme));
}

/** A named group of buttons, one per choice; the chosen one is pressed. */
function switchGroup<Choice extends string>(name: string, choices: readonly Choice[], current: Choice, onChoose: (choice: Choice) => void): HTMLElement {
  const group = document.createElement('div');
  group.className = 'switch';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', name);
  const buttons = choices.map((choice) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = choice;
    button.setAttribute('aria-pressed', String(choice === current));
    button.addEventListener('click', () => {
      buttons.forEach((other, index) => other.setAttribute('aria-pressed', String(choices[index] === choice)));
      onChoose(choice);
    });
    return button;
  });
  group.append(...buttons);
  return group;
}

function heading(level: 'h1' | 'h2' | 'h3', text: string): HTMLElement {
  const element = document.createElement(level);
  element.textContent = text;
  return element;
}
