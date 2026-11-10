import { describe, expect, it } from 'vitest';
import { headerWithAnnouncement, playScreenParts } from './play-screen.model';

describe('headerWithAnnouncement', () => {
  const header = { title: 'Hello, Operator!', message: 'Wrong number, pal!' };

  it('hides the line from screen readers while the announcement holds it', () => {
    expect(headerWithAnnouncement(header, 'Not solved yet. Wrong number, pal!').isMessageHeard).toBe(false);
  });

  it('leaves the line to be read while there is no announcement', () => {
    expect(headerWithAnnouncement(header, '').isMessageHeard).toBe(true);
  });
});

describe('playScreenParts (spec-007 FR-719)', () => {
  it('on the compact screen, shows the Status bar and the Workings strip in place of the header and counter', () => {
    expect(playScreenParts({ isCompact: true, hasToday: true })).toEqual({
      header: false,
      counterAlone: false,
      statusBar: true,
      strip: true,
    });
  });

  it('on the full screen with a Today button, keeps the header and puts the Today button beside the counter', () => {
    expect(playScreenParts({ isCompact: false, hasToday: true })).toEqual({
      header: true,
      counterAlone: false,
      statusBar: true,
      strip: false,
    });
  });

  it('on the full screen with no Today button, keeps the header and the counter alone, as before', () => {
    expect(playScreenParts({ isCompact: false, hasToday: false })).toEqual({
      header: true,
      counterAlone: true,
      statusBar: false,
      strip: false,
    });
  });
});
