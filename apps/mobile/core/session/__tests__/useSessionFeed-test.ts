import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  CardClass,
  FocusRequired,
  GeneralType,
  type TCard,
  type TSessionPage,
} from '@diu/types';

import { sessionPageToStack } from '@/core/session/session-page';
import { useSessionFeed } from '@/core/session/useSessionFeed';

const card = (id: string, title: string): TCard => ({
  id,
  title,
  description: `Description for ${title}`,
  duration: 600,
  focusRequired: FocusRequired.MEDIUM,
  class: CardClass.GENERAL,
  classType: GeneralType.MEETING,
});

const initialPage: TSessionPage = {
  sessionId: 'server-session-abc',
  cards: [card('api-1', 'First card'), card('api-2', 'Second card')],
  cursor: '2',
  hasMore: true,
};

describe('useSessionFeed', () => {
  test('loads initial session stack from SessionClient', async () => {
    const createSession = jest.fn().mockResolvedValue(initialPage);
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: { createSession, fetchNextPage },
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
        client: { createSession, fetchNextPage },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.error).toBe('Network request failed');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.sessionId).toBeNull();
  });

  test('prefetches next page when approaching the end of the loaded stack', async () => {
    const nextPage: TSessionPage = {
      sessionId: 'server-session-abc',
      cards: [card('api-3', 'Third card'), card('api-4', 'Fourth card')],
      cursor: '4',
      hasMore: true,
    };
    const createSession = jest.fn().mockResolvedValue(initialPage);
    const fetchNextPage = jest.fn().mockResolvedValue(nextPage);

    const { result } = renderHook(() =>
      useSessionFeed({
        client: { createSession, fetchNextPage },
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

  test('does not prefetch when far from the end of the loaded stack', async () => {
    const largeInitialPage: TSessionPage = {
      sessionId: 'server-session-abc',
      cards: [
        card('api-1', 'First card'),
        card('api-2', 'Second card'),
        card('api-3', 'Third card'),
        card('api-4', 'Fourth card'),
      ],
      cursor: '4',
      hasMore: true,
    };
    const createSession = jest.fn().mockResolvedValue(largeInitialPage);
    const fetchNextPage = jest.fn();

    const { result } = renderHook(() =>
      useSessionFeed({
        client: { createSession, fetchNextPage },
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
      cards: [card('api-3', 'Third card')],
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
        client: { createSession, fetchNextPage },
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

  test('refresh requests a new session and replaces the stack', async () => {
    const refreshedPage: TSessionPage = {
      sessionId: 'server-session-xyz',
      cards: [card('api-9', 'Fresh first card')],
      cursor: '1',
      hasMore: true,
    };
    const createSession = jest
      .fn()
      .mockResolvedValueOnce(initialPage)
      .mockResolvedValueOnce(refreshedPage);
    const fetchNextPage = jest.fn().mockResolvedValue({
      sessionId: 'server-session-abc',
      cards: [card('api-3', 'Prefetched card')],
      cursor: '3',
      hasMore: true,
    });

    const { result } = renderHook(() =>
      useSessionFeed({
        client: { createSession, fetchNextPage },
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
        client: { createSession, fetchNextPage },
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
        cards: [card('api-9', 'Fresh first card')],
        cursor: '1',
        hasMore: true,
      });
      await refreshPromise;
    });

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-xyz');
    });
  });

  test('deduplicates cards when appending a page with overlapping ids', async () => {
    const overlappingPage: TSessionPage = {
      sessionId: 'server-session-abc',
      cards: [card('api-2', 'Second card'), card('api-3', 'Third card')],
      cursor: '3',
      hasMore: true,
    };
    const createSession = jest.fn().mockResolvedValue(initialPage);
    const fetchNextPage = jest.fn().mockResolvedValue(overlappingPage);

    const { result } = renderHook(() =>
      useSessionFeed({
        client: { createSession, fetchNextPage },
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
