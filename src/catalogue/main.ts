// The component catalogue (spec-003, development only): every component of the library in every
// state and theme. Built by `npm run build:catalogue`; never part of the game's build.

const root = document.getElementById('catalogue');
if (!root) {
  throw new Error('catalogue.html must contain <main id="catalogue">.');
}
