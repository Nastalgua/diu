import { useCallback, useEffect, useRef, useState } from 'react';

import {
  feedStack,
  loadFeedCards,
  type TFeedStackItem,
} from '@/core/components/feed-card/fake-data';
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

export type SessionFeedClient = Pick<
  SessionClient,
  'createSession' | 'fetchNextPage'
>;

export type UseSessionFeedOptions = {
  client?: SessionFeedClient;
  useFakeFeed?: boolean;
  loadFakeFeed?: () => Promise<TFeedStackItem[]>;
  prefetchThreshold?: number;
};

type SessionFeedState = {
  sessionId: string | null;
  stack: TFeedStackItem[];
  cursor: string | null;
  hasMore: boolean;
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

export function useSessionFeed(options: UseSessionFeedOptions = {}) {
  const useFake = options.useFakeFeed ?? shouldUseFakeFeed();
  const prefetchThreshold = options.prefetchThreshold ?? PREFETCH_THRESHOLD;
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
          isLoading: false,
          error: null,
        }
      : {
          sessionId: null,
          stack: [],
          cursor: null,
          hasMore: false,
          isLoading: true,
          error: null,
        }
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
    }: {
      sessionId: string;
      stack: TFeedStackItem[];
      cursor: string | null;
      hasMore: boolean;
    }) => {
      setState({
        sessionId,
        stack,
        cursor,
        hasMore,
        isLoading: false,
        error: null,
      });
      return sessionId;
    },
    []
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

    void loadSession()
      .then((session) => {
        if (cancelled) return;
        applySession(session);
      })
      .catch((error) => {
        if (cancelled) return;
        applyError(error);
      });

    return () => {
      cancelled = true;
    };
  }, [applyError, applySession, loadSession, useFake]);

  const refresh = useCallback(async () => {
    prefetchingRef.current = false;
    setState((current) => ({
      ...current,
      error: null,
    }));

    try {
      return applySession(await loadSession());
    } catch (error) {
      applyError(error);
      return null;
    }
  }, [applyError, applySession, loadSession]);

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
          setState((current) => ({
            ...current,
            stack: appendSessionPage(current.stack, page),
            cursor: page.cursor,
            hasMore: page.hasMore,
          }));
        })
        .finally(() => {
          prefetchingRef.current = false;
        });
    },
    [prefetchThreshold, state, useFake]
  );

  return {
    sessionId: state.sessionId,
    stack: state.stack,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
    retry,
    prefetchIfNeeded,
  };
}

export { feedStack };
