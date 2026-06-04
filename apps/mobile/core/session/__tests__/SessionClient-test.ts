import {
  CardClass,
  FocusRequired,
  GeneralType,
  type TSessionPage,
} from '@diu/types';

import { SessionClient } from '@/core/session/SessionClient';

const mockSessionPage: TSessionPage = {
  sessionId: 'server-session-abc',
  cards: [
    {
      id: 'api-1',
      title: 'Server-authored card',
      description: 'From the session API',
      duration: 600,
      focusRequired: FocusRequired.MEDIUM,
      class: CardClass.GENERAL,
      classType: GeneralType.MEETING,
      primarySource: { integration: 'fixture', sourceId: 'api-1' },
    },
  ],
  cursor: '1',
  hasMore: true,
};

const FIXED_NOW = new Date('2026-06-03T12:00:00Z').getTime();

describe('SessionClient', () => {
  test('createSession returns parsed session page from GET /session', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSessionPage,
    });

    const client = new SessionClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchMock,
      now: () => FIXED_NOW,
    });

    const page = await client.createSession();

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/session', {
      headers: { 'X-Local-Calendar-Day': '2026-06-03' },
    });
    expect(page.sessionId).toBe('server-session-abc');
    expect(page.cards[0].title).toBe('Server-authored card');
    expect(page.hasMore).toBe(true);
  });

  test('fetchNextPage returns parsed session page from cursor endpoint', async () => {
    const nextPage: TSessionPage = {
      sessionId: 'server-session-abc',
      cards: [
        {
          id: 'api-2',
          title: 'Second batch card',
          description: 'From cursor fetch',
          duration: 300,
          focusRequired: FocusRequired.LOW,
          class: CardClass.GENERAL,
          classType: GeneralType.MEETING,
          primarySource: { integration: 'fixture', sourceId: 'api-2' },
        },
      ],
      cursor: '2',
      hasMore: false,
      endCard: {
        kind: 'end',
        id: 'end',
        title: 'Caught up',
        description: "You're through today's stack.",
      },
    };

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => nextPage,
    });

    const client = new SessionClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchMock,
      now: () => FIXED_NOW,
    });

    const page = await client.fetchNextPage('server-session-abc', '1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/session/server-session-abc/cards?cursor=1',
      { headers: { 'X-Local-Calendar-Day': '2026-06-03' } }
    );
    expect(page.cards[0].id).toBe('api-2');
    expect(page.hasMore).toBe(false);
  });

  test('recordTackle POSTs primary source with calendar day header', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    const client = new SessionClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchMock,
      now: () => FIXED_NOW,
    });

    await client.recordTackle({
      integration: 'github',
      sourceId: 'pr-142',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/session/tackle',
      {
        method: 'POST',
        headers: {
          'X-Local-Calendar-Day': '2026-06-03',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primarySource: { integration: 'github', sourceId: 'pr-142' },
        }),
      }
    );
  });
});
