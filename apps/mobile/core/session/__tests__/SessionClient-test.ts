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
    },
  ],
  cursor: '1',
  hasMore: true,
};

describe('SessionClient', () => {
  test('createSession returns parsed session page from GET /session', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSessionPage,
    });

    const client = new SessionClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchMock,
    });

    const page = await client.createSession();

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/session');
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
    });

    const page = await client.fetchNextPage('server-session-abc', '1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/session/server-session-abc/cards?cursor=1'
    );
    expect(page.cards[0].id).toBe('api-2');
    expect(page.hasMore).toBe(false);
  });
});
