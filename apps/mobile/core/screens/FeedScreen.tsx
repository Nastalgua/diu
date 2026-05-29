import { useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';

import {
  feedStack,
  isEndCard,
} from '@/core/components/feed-card/fake-data';
import {
  FeedPager,
  type FeedPagerHandle,
} from '@/core/components/feed-pager/FeedPager';
import { FeedEndPage } from '@/core/components/feed-pager/FeedEndPage';
import { FeedPage } from '@/core/components/feed-pager/FeedPage';
import { FeedViewportLayout } from '@/core/components/feed-pager/FeedViewportLayout';
import { useFeedScrollPosition } from '@/core/components/feed-pager/useFeedScrollPosition';
import { useFeedTabRefresh } from '@/core/components/feed-pager/useFeedTabRefresh';

export function FeedScreen() {
  const pagerRef = useRef<FeedPagerHandle>(null);
  const {
    sessionId,
    minimumIndex,
    onIndexChange,
    refresh,
    isRefreshing,
  } = useFeedScrollPosition();

  useFeedTabRefresh(refresh);

  const advancePager = () => {
    pagerRef.current?.advanceToNext();
  };

  return (
    <FeedViewportLayout>
      {({ pageHeight }) => (
        <View className="flex-1">
          <FeedPager
            ref={pagerRef}
            key={sessionId}
            items={feedStack}
            pageHeight={pageHeight}
            minimumIndex={minimumIndex}
            onIndexChange={onIndexChange}
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
