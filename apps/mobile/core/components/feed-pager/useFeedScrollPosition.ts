import { useCallback, useReducer, useRef, useState } from 'react';

import { loadFeedCards } from '@/core/components/feed-card/fake-data';
import { FeedScrollPosition } from '@/core/components/feed-pager/FeedScrollPosition';

function createSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useFeedScrollPosition() {
  const sessionIdRef = useRef<string | null>(null);
  const positionRef = useRef<FeedScrollPosition | null>(null);
  const [, bump] = useReducer((version) => version + 1, 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!sessionIdRef.current) {
    sessionIdRef.current = createSessionId();
  }

  if (!positionRef.current) {
    positionRef.current = new FeedScrollPosition(sessionIdRef.current);
  }

  const position = positionRef.current;

  const onIndexChange = useCallback(
    (nextIndex: number) => {
      position.settleIndex(nextIndex);
      bump();
    },
    [position]
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadFeedCards();
    sessionIdRef.current = createSessionId();
    positionRef.current = new FeedScrollPosition(sessionIdRef.current);
    bump();
    setIsRefreshing(false);
  }, []);

  return {
    sessionId: sessionIdRef.current,
    initialIndex: position.getIndex(),
    minimumIndex: position.getMinimumIndex(),
    onIndexChange,
    refresh,
    isRefreshing,
  };
}
