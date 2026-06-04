import { useCallback, useEffect, useRef, useState } from 'react';
import type { TPrimarySource } from '@diu/types';

import {
  feedStack,
  loadFeedCards,
  type TFeedStackItem,
} from '@/core/components/feed-card/fake-data';
import { getDefaultSessionFeedStorage } from '@/core/session/default-session-feed-storage';
import { SessionClient } from '@/core/session/SessionClient';
import {
  getApiBaseUrl,
  PREFETCH_THRESHOLD,
  shouldUseFakeFeed,
} from '@/core/session/config';
import {
  appendSessionPage,
  sessionPageToStack,
  stackHasEndCard,
} from '@/core/session/session-page';
import {
  isResumableSnapshot,
  localCalendarDay,
  type SessionFeedStorage,
  type SessionSnapshot,
} from '@/core/session/session-feed-storage';

export type SessionFeedClient = Pick<
  SessionClient,
  'createSession' | 'fetchNextPage' | 'recordTackle'
>;

export type UseSessionFeedOptions = {
  client?: SessionFeedClient;
  useFakeFeed?: boolean;
  loadFakeFeed?: () => Promise<TFeedStackItem[]>;
  prefetchThreshold?: number;
  storage?: SessionFeedStorage;
  now?: () => number;
};

type SessionFeedState = {
  sessionId: string | null;
  stack: TFeedStackItem[];
  cursor: string | null;
  hasMore: boolean;
  resumeIndex: number;
  isLoading: boolean;
  error: string | null;
};

function shouldPrefetch(
  currentIndex: number,
  stackLength: number,
  threshold: number
): boolean {
  return stackLength - currentIndex <= threshold;
}

function snapshotFromState(
  state: Pick<
    SessionFeedState,
    'sessionId' | 'stack' | 'cursor' | 'hasMore' | 'resumeIndex'
  >,
  now: number
): SessionSnapshot | null {
  if (!state.sessionId) return null;

  return {
    sessionId: state.sessionId,
    stack: state.stack,
    cursor: state.cursor,
    hasMore: state.hasMore,
    resumeIndex: state.resumeIndex,
    lastActiveAt: now,
    calendarDay: localCalendarDay(now),
  };
}

export function useSessionFeed(options: UseSessionFeedOptions = {}) {
  const useFake = options.useFakeFeed ?? shouldUseFakeFeed();
  const prefetchThreshold = options.prefetchThreshold ?? PREFETCH_THRESHOLD;
  const storage = options.storage ?? getDefaultSessionFeedStorage();
  const nowOptionRef = useRef(options.now);
  nowOptionRef.current = options.now;

  const getNow = useCallback(() => {
    if (nowOptionRef.current) return nowOptionRef.current();
    return Date.now();
  }, []);
  const clientRef = useRef<SessionFeedClient | null>(null);
  const defaultClientRef = useRef<SessionClient | null>(null);
  const prefetchingRef = useRef(false);

  if (options.client) {
    clientRef.current = options.client;
  } else if (!defaultClientRef.current) {
    defaultClientRef.current = new SessionClient({
      baseUrl: getApiBaseUrl(),
    });
  }

  const loadFakeRef = useRef(options.loadFakeFeed ?? loadFeedCards);
  loadFakeRef.current = options.loadFakeFeed ?? loadFeedCards;

  const [state, setState] = useState<SessionFeedState>(() =>
    useFake
      ? {
          sessionId: 'fake-session',
          stack: feedStack,
          cursor: null,
          hasMore: false,
          resumeIndex: 0,
          isLoading: false,
          error: null,
        }
      : {
          sessionId: null,
          stack: [],
          cursor: null,
          hasMore: false,
          resumeIndex: 0,
          isLoading: true,
          error: null,
        }
  );

  const persistSnapshot = useCallback(
    (next: SessionFeedState) => {
      if (useFake) return;

      const snapshot = snapshotFromState(next, getNow());
      if (!snapshot) return;

      void storage.save(snapshot);
    },
    [getNow, storage, useFake]
  );

  const loadSession = useCallback(async () => {
    if (useFake) {
      const stack = await loadFakeRef.current();
      return {
        sessionId: 'fake-session',
        stack,
        cursor: null as string | null,
        hasMore: false,
      };
    }

    const client = clientRef.current ?? defaultClientRef.current!;
    const page = await client.createSession();
    return {
      sessionId: page.sessionId,
      stack: sessionPageToStack(page),
      cursor: page.cursor,
      hasMore: page.hasMore,
    };
  }, [useFake]);

  const applySession = useCallback(
    ({
      sessionId,
      stack,
      cursor,
      hasMore,
      resumeIndex = 0,
    }: {
      sessionId: string;
      stack: TFeedStackItem[];
      cursor: string | null;
      hasMore: boolean;
      resumeIndex?: number;
    }) => {
      const next: SessionFeedState = {
        sessionId,
        stack,
        cursor,
        hasMore,
        resumeIndex,
        isLoading: false,
        error: null,
      };

      setState(next);
      persistSnapshot(next);
      return sessionId;
    },
    [persistSnapshot]
  );

  const applyError = useCallback((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Session fetch failed';

    setState((current) => ({
      ...current,
      isLoading: false,
      error: message,
    }));
  }, []);

  useEffect(() => {
    if (useFake) return;

    let cancelled = false;

    async function bootstrap() {
      try {
        const snapshot = await storage.load();
        if (
          !cancelled &&
          snapshot &&
          isResumableSnapshot(snapshot, getNow())
        ) {
          applySession({
            sessionId: snapshot.sessionId,
            stack: snapshot.stack,
            cursor: snapshot.cursor,
            hasMore: snapshot.hasMore,
            resumeIndex: snapshot.resumeIndex,
          });
          return;
        }

        const session = await loadSession();
        if (!cancelled) {
          applySession(session);
        }
      } catch (error) {
        if (!cancelled) {
          applyError(error);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [applyError, applySession, getNow, loadSession, storage, useFake]);

  const refresh = useCallback(async () => {
    prefetchingRef.current = false;
    setState((current) => ({
      ...current,
      error: null,
    }));

    try {
      const session = await loadSession();
      if (!useFake) {
        await storage.clear();
      }
      return applySession({
        ...session,
        resumeIndex: 0,
      });
    } catch (error) {
      applyError(error);
      return null;
    }
  }, [applyError, applySession, loadSession, storage, useFake]);

  const retry = useCallback(async () => {
    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
    }));

    try {
      return applySession(await loadSession());
    } catch (error) {
      applyError(error);
      return null;
    }
  }, [applyError, applySession, loadSession]);

  const updateResumeIndex = useCallback(
    (resumeIndex: number) => {
      setState((current) => {
        if (!current.sessionId) return current;

        const next = { ...current, resumeIndex };
        persistSnapshot(next);
        return next;
      });
    },
    [persistSnapshot]
  );

  const prefetchIfNeeded = useCallback(
    (currentIndex: number) => {
      if (useFake) return;

      const { sessionId, stack, cursor, hasMore } = state;

      if (
        !sessionId ||
        !hasMore ||
        cursor === null ||
        stackHasEndCard(stack) ||
        !shouldPrefetch(currentIndex, stack.length, prefetchThreshold) ||
        prefetchingRef.current
      ) {
        return;
      }

      prefetchingRef.current = true;
      const client = clientRef.current ?? defaultClientRef.current!;

      void client
        .fetchNextPage(sessionId, cursor)
        .then((page) => {
          setState((current) => {
            const next = {
              ...current,
              stack: appendSessionPage(current.stack, page),
              cursor: page.cursor,
              hasMore: page.hasMore,
            };
            persistSnapshot(next);
            return next;
          });
        })
        .catch(() => {
          // Prefetch failures are non-fatal; stack and index stay unchanged.
        })
        .finally(() => {
          prefetchingRef.current = false;
        });
    },
    [persistSnapshot, prefetchThreshold, state, useFake]
  );

  const recordTackle = useCallback(
    async (primarySource: TPrimarySource) => {
      if (useFake) {
        return;
      }

      const client = clientRef.current ?? defaultClientRef.current!;
      await client.recordTackle(primarySource);
    },
    [useFake]
  );

  return {
    sessionId: state.sessionId,
    stack: state.stack,
    resumeIndex: state.resumeIndex,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
    retry,
    prefetchIfNeeded,
    updateResumeIndex,
    recordTackle,
  };
}

export { feedStack };
