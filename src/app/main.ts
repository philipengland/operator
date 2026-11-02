import { startSession } from './session';
import { createPlayScreen } from './view';

const root = document.getElementById('game');
if (!root) {
  throw new Error('index.html must contain <main id="game">.');
}

createPlayScreen(root, startSession());
