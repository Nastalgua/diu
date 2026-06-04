import {
  CardClass,
  FocusRequired,
  GeneralType,
  type TCard,
} from '@diu/types';

import type { TFeedStackItem } from '@/core/components/feed-card/fake-data';
import {
  createSessionFeedStorage,
  isResumableSnapshot,
  localCalendarDay,
  type SessionSnapshot,
} from '@/core/session/session-feed-storage';

function memoryStore() {
  const data = new Map<string, string>();

  return {
    getItem: async (key: string) => data.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: async (key: string) => {
      data.delete(key);
    },
  };
}

const sampleCard: TCard = {
  id: 'api-1',
  title: 'First card',
  description: 'Description',
  duration: 600,
  focusRequired: FocusRequired.MEDIUM,
  class: CardClass.GENERAL,
  classType: GeneralType.MEETING,
  primarySource: { integration: 'fixture', sourceId: 'api-1' },
};

const sampleStack: TFeedStackItem[] = [sampleCard];

const sampleSnapshot: SessionSnapshot = {
  sessionId: 'server-session-abc',
  stack: sampleStack,
  cursor: '2',
  hasMore: true,
  resumeIndex: 1,
  lastActiveAt: 1_700_000_000_000,
  calendarDay: '2024-11-14',
};

describe('session-feed-storage', () => {
  test('round-trips a session snapshot through save and load', async () => {
    const storage = createSessionFeedStorage(memoryStore());

    await storage.save(sampleSnapshot);

    await expect(storage.load()).resolves.toEqual(sampleSnapshot);
  });

  test('clear removes a persisted snapshot', async () => {
    const storage = createSessionFeedStorage(memoryStore());

    await storage.save(sampleSnapshot);
    await storage.clear();

    await expect(storage.load()).resolves.toBeNull();
  });

  test('load returns null when nothing was saved', async () => {
    const storage = createSessionFeedStorage(memoryStore());

    await expect(storage.load()).resolves.toBeNull();
  });
});

describe('isResumableSnapshot', () => {
  test('allows resume on the same local calendar day', () => {
    const noon = new Date('2024-11-14T12:00:00').getTime();

    expect(
      isResumableSnapshot(
        {
          ...sampleSnapshot,
          calendarDay: localCalendarDay(noon),
          lastActiveAt: noon - 60 * 60 * 1000,
        },
        noon
      )
    ).toBe(true);
  });

  test('rejects resume when the calendar day changed', () => {
    const today = new Date('2024-11-15T09:00:00').getTime();

    expect(
      isResumableSnapshot(
        { ...sampleSnapshot, calendarDay: '2024-11-14' },
        today
      )
    ).toBe(false);
  });

  test('rejects resume when last activity is older than the stale window', () => {
    const now = new Date('2024-11-14T18:00:00').getTime();
    const sevenHoursAgo = now - 7 * 60 * 60 * 1000;

    expect(
      isResumableSnapshot(
        {
          ...sampleSnapshot,
          calendarDay: localCalendarDay(now),
          lastActiveAt: sevenHoursAgo,
        },
        now
      )
    ).toBe(false);
  });

  test('allows resume when last activity is within the stale window', () => {
    const now = new Date('2024-11-14T18:00:00').getTime();
    const oneHourAgo = now - 60 * 60 * 1000;

    expect(
      isResumableSnapshot(
        {
          ...sampleSnapshot,
          calendarDay: localCalendarDay(now),
          lastActiveAt: oneHourAgo,
        },
        now
      )
    ).toBe(true);
  });
});
