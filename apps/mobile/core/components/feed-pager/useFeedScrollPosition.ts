import { useCallback, useReducer, useRef } from 'react';

import { FeedScrollPosition } from '@/core/components/feed-pager/FeedScrollPosition';

export function useFeedScrollPosition(feedSessionId: string) {
  const trackedSessionIdRef = useRef<string | null>(null);
  const positionRef = useRef<FeedScrollPosition | null>(null);
  const [, bump] = useReducer((version) => version + 1, 0);

  if (
    trackedSessionIdRef.current !== feedSessionId ||
    !positionRef.current
  ) {
    trackedSessionIdRef.current = feedSessionId;
    positionRef.current = new FeedScrollPosition(feedSessionId);
  }

  const position = positionRef.current;

  const onIndexChange = useCallback(
    (nextIndex: number) => {
      position.settleIndex(nextIndex);
      bump();
    },
    [position]
  );

  return {
    initialIndex: position.getIndex(),
    minimumIndex: position.getMinimumIndex(),
    onIndexChange,
  };
}
