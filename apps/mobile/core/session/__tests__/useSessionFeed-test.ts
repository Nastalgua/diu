import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { TSessionPage } from '@diu/types';

import { sessionPageToStack } from '@/core/session/session-page';
import { testCard } from '@/core/session/test-card';
import {
  createSessionFeedStorage,
  localCalendarDay,
  type SessionSnapshot,
} from '@/core/session/session-feed-storage';
import { useSessionFeed } from '@/core/session/useSessionFeed';

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

const initialPage: TSessionPage = {
  sessionId: 'server-session-abc',
  cards: [testCard('api-1', 'First card'), testCard('api-2', 'Second card')],
  cursor: '2',
  hasMore: true,
};

describe('useSessionFeed', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('resumes a same-day persisted snapshot without creating a new session', async () => {
    const now = new Date('2024-11-14T12:00:00').getTime();
    const storage = createSessionFeedStorage(memoryStore());
    const persistedStack = sessionPageToStack(initialPage);
    const snapshot: SessionSnapshot = {
      sessionId: 'server-session-abc',
      stack: persistedStack,
      cursor: '2',
      hasMore: true,
      resumeIndex: 1,
      lastActiveAt: now,
      calendarDay: localCalendarDay(now),
    };

    await storage.save(snapshot);

    const createSession = jest.fn();
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
        storage,
        now: () => now,
      })
    );

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-abc');
    });

    expect(result.current.stack).toEqual(persistedStack);
    expect(result.current.resumeIndex).toBe(1);
    expect(createSession).not.toHaveBeenCalled();
  });

  test('starts a new session when the persisted snapshot is from a prior calendar day', async () => {
    const yesterday = new Date('2024-11-14T20:00:00').getTime();
    const today = new Date('2024-11-15T09:00:00').getTime();
    const storage = createSessionFeedStorage(memoryStore());
    const persistedStack = sessionPageToStack(initialPage);

    await storage.save({
      sessionId: 'server-session-abc',
      stack: persistedStack,
      cursor: '2',
      hasMore: true,
      resumeIndex: 1,
      lastActiveAt: yesterday,
      calendarDay: localCalendarDay(yesterday),
    });

    const freshPage: TSessionPage = {
      sessionId: 'server-session-new-day',
      cards: [testCard('api-9', 'Fresh first card')],
      cursor: '1',
      hasMore: true,
    };
    const createSession = jest.fn().mockResolvedValue(freshPage);
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
        storage,
        now: () => today,
      })
    );

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-new-day');
    });

    expect(result.current.stack).toEqual(sessionPageToStack(freshPage));
    expect(result.current.resumeIndex).toBe(0);
    expect(createSession).toHaveBeenCalledTimes(1);
    expect(await storage.load()).toMatchObject({
      sessionId: 'server-session-new-day',
      calendarDay: localCalendarDay(today),
    });
  });

  test('starts a new session when the persisted snapshot is older than the stale window', async () => {
    const now = new Date('2024-11-14T18:00:00').getTime();
    const sevenHoursAgo = now - 7 * 60 * 60 * 1000;
    const storage = createSessionFeedStorage(memoryStore());
    const persistedStack = sessionPageToStack(initialPage);

    await storage.save({
      sessionId: 'server-session-abc',
      stack: persistedStack,
      cursor: '2',
      hasMore: true,
      resumeIndex: 1,
      lastActiveAt: sevenHoursAgo,
      calendarDay: localCalendarDay(now),
    });

    const freshPage: TSessionPage = {
      sessionId: 'server-session-fresh',
      cards: [testCard('api-9', 'Fresh first card')],
      cursor: '1',
      hasMore: true,
    };
    const createSession = jest.fn().mockResolvedValue(freshPage);
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
        storage,
        now: () => now,
      })
    );

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-fresh');
    });

    expect(result.current.stack).toEqual(sessionPageToStack(freshPage));
    expect(result.current.resumeIndex).toBe(0);
    expect(createSession).toHaveBeenCalledTimes(1);
    expect(await storage.load()).toMatchObject({
      sessionId: 'server-session-fresh',
      lastActiveAt: now,
    });
  });

  test('loads initial session stack from SessionClient', async () => {
    const createSession = jest.fn().mockResolvedValue(initialPage);
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-abc');
    });

    expect(result.current.stack).toEqual(sessionPageToStack(initialPage));
    expect(createSession).toHaveBeenCalledTimes(1);
  });

  test('surfaces fetch error instead of loading forever', async () => {
    const createSession = jest
      .fn()
      .mockRejectedValue(new Error('Network request failed'));
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.error).toBe('Network request failed');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.sessionId).toBeNull();
    expect(result.current.stack).toEqual([]);
  });

  test('initial fetch failure does not persist a partial session snapshot', async () => {
    const storage = createSessionFeedStorage(memoryStore());
    const createSession = jest
      .fn()
      .mockRejectedValue(new Error('Network request failed'));
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
        storage,
      })
    );

    await waitFor(() => {
      expect(result.current.error).toBe('Network request failed');
    });

    expect(await storage.load()).toBeNull();
  });

  test('retry loads session after initial fetch failure', async () => {
    const storage = createSessionFeedStorage(memoryStore());
    const createSession = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network request failed'))
      .mockResolvedValueOnce(initialPage);
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
        storage,
      })
    );

    await waitFor(() => {
      expect(result.current.error).toBe('Network request failed');
    });

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-abc');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.stack).toEqual(sessionPageToStack(initialPage));
    expect(createSession).toHaveBeenCalledTimes(2);
    expect(await storage.load()).toMatchObject({
      sessionId: 'server-session-abc',
      resumeIndex: 0,
    });
  });

  test('prefetches next page when approaching the end of the loaded stack', async () => {
    const nextPage: TSessionPage = {
      sessionId: 'server-session-abc',
      cards: [testCard('api-3', 'Third card'), testCard('api-4', 'Fourth card')],
      cursor: '4',
      hasMore: true,
    };
    const createSession = jest.fn().mockResolvedValue(initialPage);
    const fetchNextPage = jest.fn().mockResolvedValue(nextPage);

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.stack).toHaveLength(2);
    });

    await act(async () => {
      result.current.prefetchIfNeeded(0);
    });

    await waitFor(() => {
      expect(result.current.stack).toHaveLength(4);
    });

    expect(fetchNextPage).toHaveBeenCalledWith('server-session-abc', '2');
    expect(result.current.stack.map((item) => item.id)).toEqual([
      'api-1',
      'api-2',
      'api-3',
      'api-4',
    ]);
  });

  test('prefetch failure leaves stack and resume index unchanged', async () => {
    const nextPage: TSessionPage = {
      sessionId: 'server-session-abc',
      cards: [testCard('api-3', 'Third card')],
      cursor: '3',
      hasMore: true,
    };
    const createSession = jest.fn().mockResolvedValue(initialPage);
    const fetchNextPage = jest
      .fn()
      .mockRejectedValueOnce(new Error('Prefetch failed'))
      .mockResolvedValueOnce(nextPage);

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.stack).toHaveLength(2);
    });

    await act(async () => {
      result.current.updateResumeIndex(1);
    });

    const stackBeforeFailure = result.current.stack;
    const resumeIndexBeforeFailure = result.current.resumeIndex;

    await act(async () => {
      result.current.prefetchIfNeeded(1);
    });

    await waitFor(() => {
      expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    expect(result.current.stack).toEqual(stackBeforeFailure);
    expect(result.current.resumeIndex).toBe(resumeIndexBeforeFailure);
    expect(result.current.sessionId).toBe('server-session-abc');
    expect(result.current.error).toBeNull();

    await act(async () => {
      result.current.prefetchIfNeeded(1);
    });

    await waitFor(() => {
      expect(result.current.stack).toHaveLength(3);
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(2);
    expect(result.current.stack.map((item) => item.id)).toEqual([
      'api-1',
      'api-2',
      'api-3',
    ]);
  });

  test('does not prefetch when far from the end of the loaded stack', async () => {
    const largeInitialPage: TSessionPage = {
      sessionId: 'server-session-abc',
      cards: [
        testCard('api-1', 'First card'),
        testCard('api-2', 'Second card'),
        testCard('api-3', 'Third card'),
        testCard('api-4', 'Fourth card'),
      ],
      cursor: '4',
      hasMore: true,
    };
    const createSession = jest.fn().mockResolvedValue(largeInitialPage);
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
        prefetchThreshold: 2,
      })
    );

    await waitFor(() => {
      expect(result.current.stack).toHaveLength(4);
    });

    await act(async () => {
      result.current.prefetchIfNeeded(0);
    });

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  test('stops prefetching once the end card is in the stack', async () => {
    const terminalPage: TSessionPage = {
      sessionId: 'server-session-abc',
      cards: [testCard('api-3', 'Third card')],
      cursor: null,
      hasMore: false,
      endCard: {
        kind: 'end',
        id: 'end',
        title: 'Caught up',
        description: "You're through today's stack.",
      },
    };
    const createSession = jest.fn().mockResolvedValue(initialPage);
    const fetchNextPage = jest.fn().mockResolvedValue(terminalPage);

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.stack).toHaveLength(2);
    });

    await act(async () => {
      result.current.prefetchIfNeeded(1);
    });

    await waitFor(() => {
      expect(result.current.stack.some((item) => item.id === 'end')).toBe(true);
    });

    await act(async () => {
      result.current.prefetchIfNeeded(1);
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  test('refresh clears the persisted snapshot before loading a new session', async () => {
    const now = new Date('2024-11-14T12:00:00').getTime();
    const storage = createSessionFeedStorage(memoryStore());
    const persistedStack = sessionPageToStack(initialPage);

    await storage.save({
      sessionId: 'server-session-abc',
      stack: persistedStack,
      cursor: '2',
      hasMore: true,
      resumeIndex: 1,
      lastActiveAt: now,
      calendarDay: localCalendarDay(now),
    });

    const refreshedPage: TSessionPage = {
      sessionId: 'server-session-xyz',
      cards: [testCard('api-9', 'Fresh first card')],
      cursor: '1',
      hasMore: true,
    };
    const createSession = jest.fn().mockResolvedValue(refreshedPage);
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
        storage,
        now: () => now,
      })
    );

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-abc');
      expect(result.current.resumeIndex).toBe(1);
    });

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-xyz');
      expect(result.current.resumeIndex).toBe(0);
    });

    expect(await storage.load()).toMatchObject({
      sessionId: 'server-session-xyz',
      resumeIndex: 0,
    });
    expect(createSession).toHaveBeenCalledTimes(1);
  });

  test('refresh requests a new session and replaces the stack', async () => {
    const refreshedPage: TSessionPage = {
      sessionId: 'server-session-xyz',
      cards: [testCard('api-9', 'Fresh first card')],
      cursor: '1',
      hasMore: true,
    };
    const createSession = jest
      .fn()
      .mockResolvedValueOnce(initialPage)
      .mockResolvedValueOnce(refreshedPage);
    const fetchNextPage = jest.fn().mockResolvedValue({
      sessionId: 'server-session-abc',
      cards: [testCard('api-3', 'Prefetched card')],
      cursor: '3',
      hasMore: true,
    });

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-abc');
    });

    await act(async () => {
      result.current.prefetchIfNeeded(1);
    });

    await waitFor(() => {
      expect(result.current.stack).toHaveLength(3);
    });

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-xyz');
    });

    expect(createSession).toHaveBeenCalledTimes(2);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    expect(result.current.stack).toEqual(sessionPageToStack(refreshedPage));
    expect(result.current.isLoading).toBe(false);
  });

  test('refresh keeps the feed mounted while the new session loads', async () => {
    let resolveRefresh!: (page: TSessionPage) => void;
    const createSession = jest
      .fn()
      .mockResolvedValueOnce(initialPage)
      .mockImplementationOnce(
        () =>
          new Promise<TSessionPage>((resolve) => {
            resolveRefresh = resolve;
          })
      );

    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-abc');
    });

    let refreshPromise!: Promise<string | null>;
    await act(async () => {
      refreshPromise = result.current.refresh();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.sessionId).toBe('server-session-abc');
    expect(result.current.stack).toEqual(sessionPageToStack(initialPage));

    await act(async () => {
      resolveRefresh({
        sessionId: 'server-session-xyz',
        cards: [testCard('api-9', 'Fresh first card')],
        cursor: '1',
        hasMore: true,
      });
      await refreshPromise;
    });

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-xyz');
    });
  });

  test('refresh failure keeps the prior session usable', async () => {
    const refreshedPage: TSessionPage = {
      sessionId: 'server-session-xyz',
      cards: [testCard('api-9', 'Fresh first card')],
      cursor: '1',
      hasMore: true,
    };
    const createSession = jest
      .fn()
      .mockResolvedValueOnce(initialPage)
      .mockRejectedValueOnce(new Error('Refresh failed'));
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-abc');
    });

    const stackBeforeRefresh = result.current.stack;
    const resumeIndexBeforeRefresh = result.current.resumeIndex;

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.sessionId).toBe('server-session-abc');
    expect(result.current.stack).toEqual(stackBeforeRefresh);
    expect(result.current.resumeIndex).toBe(resumeIndexBeforeRefresh);
    expect(result.current.error).toBe('Refresh failed');
    expect(result.current.isLoading).toBe(false);
    expect(createSession).toHaveBeenCalledTimes(2);

    createSession.mockResolvedValueOnce(refreshedPage);

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-xyz');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.stack).toEqual(sessionPageToStack(refreshedPage));
    expect(createSession).toHaveBeenCalledTimes(3);
  });

  test('refresh failure keeps the persisted snapshot intact', async () => {
    const now = new Date('2024-11-14T12:00:00').getTime();
    const storage = createSessionFeedStorage(memoryStore());
    const persistedStack = sessionPageToStack(initialPage);
    const snapshot: SessionSnapshot = {
      sessionId: 'server-session-abc',
      stack: persistedStack,
      cursor: '2',
      hasMore: true,
      resumeIndex: 1,
      lastActiveAt: now,
      calendarDay: localCalendarDay(now),
    };

    await storage.save(snapshot);

    const createSession = jest
      .fn()
      .mockRejectedValue(new Error('Refresh failed'));
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
        storage,
        now: () => now,
      })
    );

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-abc');
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(await storage.load()).toMatchObject({
      sessionId: 'server-session-abc',
      resumeIndex: 1,
      stack: persistedStack,
    });
  });

  test('deduplicates cards when appending a page with overlapping ids', async () => {
    const overlappingPage: TSessionPage = {
      sessionId: 'server-session-abc',
      cards: [testCard('api-2', 'Second card'), testCard('api-3', 'Third card')],
      cursor: '3',
      hasMore: true,
    };
    const createSession = jest.fn().mockResolvedValue(initialPage);
    const fetchNextPage = jest.fn().mockResolvedValue(overlappingPage);

    const { result } = renderHook(() =>
      useSessionFeed({
        client: {
          createSession,
          fetchNextPage,
          recordTackle: jest.fn(),
        },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.stack).toHaveLength(2);
    });

    await act(async () => {
      result.current.prefetchIfNeeded(1);
    });

    await waitFor(() => {
      expect(result.current.stack).toHaveLength(3);
    });

    expect(result.current.stack.map((item) => item.id)).toEqual([
      'api-1',
      'api-2',
      'api-3',
    ]);
  });
});
