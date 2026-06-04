import { useCallback, useReducer, useRef } from 'react';

import {
  FeedScrollPosition,
  restoreFeedScrollPosition,
} from '@/core/components/feed-pager/FeedScrollPosition';

export function useFeedScrollPosition(
  feedSessionId: string,
  resumeIndex = 0
) {
  const trackedSessionIdRef = useRef<string | null>(null);
  const positionRef = useRef<FeedScrollPosition | null>(null);
  const pagerInitialIndexRef = useRef(0);
  const [, bump] = useReducer((version) => version + 1, 0);

  if (trackedSessionIdRef.current !== feedSessionId || !positionRef.current) {
    trackedSessionIdRef.current = feedSessionId;
    pagerInitialIndexRef.current = resumeIndex;
    positionRef.current = restoreFeedScrollPosition(
      feedSessionId,
      resumeIndex
    );
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
    initialIndex: pagerInitialIndexRef.current,
    minimumIndex: position.getMinimumIndex(),
    onIndexChange,
  };
}
