import { describe, expect, it } from 'vitest';
import { headerWithAnnouncement } from './play-screen.model';

describe('headerWithAnnouncement', () => {
  const header = { title: 'Hello, Operator!', message: 'Wrong number, pal!' };

  it('hides the line from screen readers while the announcement holds it', () => {
    expect(headerWithAnnouncement(header, 'Not solved yet. Wrong number, pal!').isMessageHeard).toBe(false);
  });

  it('leaves the line to be read while there is no announcement', () => {
    expect(headerWithAnnouncement(header, '').isMessageHeard).toBe(true);
  });
});
