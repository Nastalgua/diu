import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import type { TCard } from '@diu/types';

import { DiuText } from '@/core/components/text/Text';
import type { TFeedStackItem } from '@/core/components/feed-card/fake-data';
import { primarySourceKey } from '@/core/session/primary-source-key';
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
  resumeIndex: number;
  isRefreshing: boolean;
  onPrefetchIfNeeded: (currentIndex: number) => void;
  onResumeIndexChange: (index: number) => void;
  onTackleToggle: (card: TCard, next: boolean) => void;
};

function FeedSessionStack({
  sessionId,
  stack,
  resumeIndex,
  isRefreshing,
  onPrefetchIfNeeded,
  onResumeIndexChange,
  onTackleToggle,
}: FeedSessionStackProps) {
  const pagerRef = useRef<FeedPagerHandle>(null);
  const { initialIndex, minimumIndex, onIndexChange } =
    useFeedScrollPosition(sessionId, resumeIndex);
  const [savedCardIds, setSavedCardIds] = useState<Set<string>>(
    () => new Set()
  );
  const [tackledPrimarySources, setTackledPrimarySources] = useState<
    Set<string>
  >(() => new Set());

  const toggleSave = useCallback((cardId: string) => {
    setSavedCardIds((current) => {
      const next = new Set(current);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  const toggleTackle = useCallback(
    (card: TCard) => {
      const key = primarySourceKey(card.primarySource);
      let adding = false;

      setTackledPrimarySources((current) => {
        adding = !current.has(key);
        const next = new Set(current);
        if (adding) {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });

      onTackleToggle(card, adding);
    },
    [onTackleToggle]
  );

  const handleIndexChange = useCallback(
    (index: number) => {
      onIndexChange(index);
      onResumeIndexChange(index);
      onPrefetchIfNeeded(index);
    },
    [onIndexChange, onPrefetchIfNeeded, onResumeIndexChange]
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
            initialIndex={initialIndex}
            minimumIndex={minimumIndex}
            onIndexChange={handleIndexChange}
            keyExtractor={(item) => item.id}
            renderPage={(item) =>
              isEndCard(item) ? (
                <FeedEndPage endCard={item} />
              ) : (
                <FeedPage
                  card={item}
                  isSaved={savedCardIds.has(item.id)}
                  isTackling={tackledPrimarySources.has(
                    primarySourceKey(item.primarySource)
                  )}
                  onSaveToggle={() => {
                    toggleSave(item.id);
                  }}
                  onTackleToggle={() => {
                    toggleTackle(item);
                  }}
                />
              )
            }
          />
          {isRefreshing ? (
            <View
              testID="feed-refresh-loading"
              className="bg-surface/80 absolute inset-0 items-center justify-center"
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
    resumeIndex,
    isLoading,
    error,
    refresh: refreshSession,
    retry,
    prefetchIfNeeded,
    updateResumeIndex,
    recordTackle,
  } = useSessionFeed();

  const handleTackleToggle = useCallback(
    (card: TCard, next: boolean) => {
      if (next) {
        void recordTackle(card.primarySource);
      }
    },
    [recordTackle]
  );
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
      resumeIndex={resumeIndex}
      isRefreshing={isRefreshing}
      onPrefetchIfNeeded={prefetchIfNeeded}
      onResumeIndexChange={updateResumeIndex}
      onTackleToggle={handleTackleToggle}
    />
  );
}
