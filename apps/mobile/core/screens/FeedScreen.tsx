import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { DiuText } from '@/core/components/text/Text';
import type { TFeedStackItem } from '@/core/components/feed-card/fake-data';
import { isEndCard } from '@/core/session/session-page';
import {
  FeedPager,
  type FeedPagerHandle,
} from '@/core/components/feed-pager/FeedPager';
import { FeedEndPage } from '@/core/components/feed-pager/FeedEndPage';
import { FeedPage } from '@/core/components/feed-pager/FeedPage';
import { FeedViewportLayout } from '@/core/components/feed-pager/FeedViewportLayout';
import { useFeedScrollPosition } from '@/core/components/feed-pager/useFeedScrollPosition';
import { useFeedTabRefresh } from '@/core/components/feed-pager/useFeedTabRefresh';
import { useSessionFeed } from '@/core/session/useSessionFeed';
type FeedSessionStackProps = {
  sessionId: string;
  stack: TFeedStackItem[];
  isRefreshing: boolean;
  onPrefetchIfNeeded: (currentIndex: number) => void;
};

function FeedSessionStack({
  sessionId,
  stack,
  isRefreshing,
  onPrefetchIfNeeded,
}: FeedSessionStackProps) {
  const pagerRef = useRef<FeedPagerHandle>(null);
  const { minimumIndex, onIndexChange } = useFeedScrollPosition(sessionId);

  const advancePager = () => {
    pagerRef.current?.advanceToNext();
  };

  const handleIndexChange = useCallback(
    (index: number) => {
      onIndexChange(index);
      onPrefetchIfNeeded(index);
    },
    [onIndexChange, onPrefetchIfNeeded]
  );

  useEffect(() => {
    onPrefetchIfNeeded(0);
  }, [stack.length, onPrefetchIfNeeded]);

  return (
    <FeedViewportLayout>
      {({ pageHeight }) => (
        <View className="flex-1">
          <FeedPager
            ref={pagerRef}
            key={sessionId}
            items={stack}
            pageHeight={pageHeight}
            minimumIndex={minimumIndex}
            onIndexChange={handleIndexChange}
            keyExtractor={(item) => item.id}
            renderPage={(item) =>
              isEndCard(item) ? (
                <FeedEndPage endCard={item} />
              ) : (
                <FeedPage
                  card={item}
                  onSave={advancePager}
                  onTackle={advancePager}
                />
              )
            }
          />
          {isRefreshing ? (
            <View
              testID="feed-refresh-loading"
              className="absolute inset-0 items-center justify-center bg-surface/80"
            >
              <ActivityIndicator size="large" color="#D85A30" />
            </View>
          ) : null}
        </View>
      )}
    </FeedViewportLayout>
  );
}

export function FeedScreen() {
  const {
    sessionId,
    stack,
    isLoading,
    error,
    refresh: refreshSession,
    retry,
    prefetchIfNeeded,
  } = useSessionFeed();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshSession();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshSession]);

  useFeedTabRefresh(refresh);

  if (error && !sessionId) {
    return (
      <FeedViewportLayout>
        {() => (
          <View
            testID="feed-session-error"
            className="flex-1 items-center justify-center gap-4 px-6"
          >
            <DiuText variant="sectionHead" className="text-center">
              Could not load today&apos;s stack
            </DiuText>
            <DiuText variant="bodySm" className="text-center">
              {error}
            </DiuText>
            <Pressable
              testID="feed-session-retry"
              accessibilityRole="button"
              accessibilityLabel="Retry"
              className="bg-accent rounded-full px-6 py-3"
              onPress={() => {
                void retry();
              }}
            >
              <DiuText variant="label" className="text-white">
                Retry
              </DiuText>
            </Pressable>
          </View>
        )}
      </FeedViewportLayout>
    );
  }

  if (isLoading || !sessionId) {
    return (
      <FeedViewportLayout>
        {() => (
          <View
            testID="feed-session-loading"
            className="flex-1 items-center justify-center"
          >
            <ActivityIndicator size="large" color="#D85A30" />
          </View>
        )}
      </FeedViewportLayout>
    );
  }

  return (
    <FeedSessionStack
      sessionId={sessionId}
      stack={stack}
      isRefreshing={isRefreshing}
      onPrefetchIfNeeded={prefetchIfNeeded}
    />
  );
}
