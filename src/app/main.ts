import { applyAction, startSession } from './session';
import { createPlayScreen } from './view';

const root = document.getElementById('game');
if (!root) {
  throw new Error('index.html must contain <main id="game">.');
}

let state = startSession();
const screen = createPlayScreen(root, state, (action) => {
  state = applyAction(state, action);
  screen.update(state);
});
