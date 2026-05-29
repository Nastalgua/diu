import { useCallback, useEffect, useRef, useState } from 'react';

import {
  feedStack,
  loadFeedCards,
  type TFeedStackItem,
} from '@/core/components/feed-card/fake-data';
import { SessionClient } from '@/core/session/SessionClient';
import { sessionPageToStack } from '@/core/session/session-page';
import { getApiBaseUrl, shouldUseFakeFeed } from '@/core/session/config';

export type SessionFeedClient = Pick<SessionClient, 'createSession'>;

export type UseSessionFeedOptions = {
  client?: SessionFeedClient;
  useFakeFeed?: boolean;
  loadFakeFeed?: () => Promise<TFeedStackItem[]>;
};

type SessionFeedState = {
  sessionId: string | null;
  stack: TFeedStackItem[];
  isLoading: boolean;
  error: string | null;
};

export function useSessionFeed(options: UseSessionFeedOptions = {}) {
  const useFake = options.useFakeFeed ?? shouldUseFakeFeed();
  const clientRef = useRef<SessionFeedClient | null>(null);
  const defaultClientRef = useRef<SessionClient | null>(null);

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
          isLoading: false,
          error: null,
        }
      : { sessionId: null, stack: [], isLoading: true, error: null }
  );

  const loadSession = useCallback(async () => {
    if (useFake) {
      const stack = await loadFakeRef.current();
      return {
        sessionId: 'fake-session',
        stack,
      };
    }

    const client = clientRef.current ?? defaultClientRef.current!;
    const page = await client.createSession();
    return {
      sessionId: page.sessionId,
      stack: sessionPageToStack(page),
    };
  }, [useFake]);

  const applySession = useCallback(
    ({ sessionId, stack }: { sessionId: string; stack: TFeedStackItem[] }) => {
      setState({
        sessionId,
        stack,
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

  return {
    sessionId: state.sessionId,
    stack: state.stack,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
    retry,
  };
}

export { feedStack };
