import { describe, expect, it } from 'vitest';
import { CLASSIC } from '../ui/foundations/themes';
import { playScreenProps } from './screen';
import { startSession } from './session';

const NO_FLAGS = { keypad: false, voice: false };
const justOpened = () => playScreenProps(startSession(), CLASSIC, NO_FLAGS);

describe('playScreenProps', () => {
});
