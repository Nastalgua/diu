import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';

import { notifyFeedSwipeStart } from '@/core/components/feed-pager/feedSnapFeedback';

export type FeedPagerHandle = {
  advanceToNext: () => void;
};

export type FeedPagerProps<T> = {
  items: T[];
  pageHeight: number;
  initialIndex?: number;
  minimumIndex?: number;
  onIndexChange?: (index: number) => void;
  renderPage: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
};

function indexFromOffset(offsetY: number, pageHeight: number, itemCount: number) {
  if (itemCount === 0) return 0;

  const rawIndex = Math.round(offsetY / pageHeight);
  return Math.min(Math.max(rawIndex, 0), itemCount - 1);
}

function FeedPagerInner<T>(
  {
    items,
    pageHeight,
    initialIndex = 0,
    minimumIndex = 0,
    onIndexChange,
    renderPage,
    keyExtractor,
  }: FeedPagerProps<T>,
  ref: React.Ref<FeedPagerHandle>
) {
  const listRef = useRef<FlatList<T>>(null);
  const currentIndexRef = useRef(initialIndex);
  const swipeFeedbackSentRef = useRef(false);

  useEffect(() => {
    if (initialIndex <= 0 || pageHeight <= 0) return;

    listRef.current?.scrollToOffset({
      offset: initialIndex * pageHeight,
      animated: false,
    });
    currentIndexRef.current = initialIndex;
  }, [initialIndex, pageHeight]);

  const settleAtIndex = useCallback(
    (nextIndex: number) => {
      const clampedIndex = Math.min(
        Math.max(nextIndex, 0),
        items.length - 1
      );
      const maxDelta = 1;
      const boundedIndex = Math.max(
        Math.min(
          Math.max(clampedIndex, currentIndexRef.current - maxDelta),
          currentIndexRef.current + maxDelta
        ),
        minimumIndex
      );

      if (boundedIndex !== clampedIndex) {
        listRef.current?.scrollToOffset({
          offset: boundedIndex * pageHeight,
          animated: true,
        });
      }

      if (boundedIndex === currentIndexRef.current) return;

      currentIndexRef.current = boundedIndex;
      onIndexChange?.(boundedIndex);
    },
    [items.length, minimumIndex, onIndexChange, pageHeight]
  );

  const handleScrollBeginDrag = useCallback(() => {
    if (swipeFeedbackSentRef.current) return;

    swipeFeedbackSentRef.current = true;
    notifyFeedSwipeStart();
  }, []);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      swipeFeedbackSentRef.current = false;
      const offsetY = event.nativeEvent.contentOffset.y;
      const targetIndex = indexFromOffset(offsetY, pageHeight, items.length);
      settleAtIndex(targetIndex);
    },
    [items.length, pageHeight, settleAtIndex]
  );

  const advanceToNext = useCallback(() => {
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= items.length) return;

    listRef.current?.scrollToOffset({
      offset: nextIndex * pageHeight,
      animated: true,
    });
    settleAtIndex(nextIndex);
  }, [items.length, pageHeight, settleAtIndex]);

  useImperativeHandle(ref, () => ({ advanceToNext }), [advanceToNext]);

  return (
    <FlatList
      ref={listRef}
      testID="feed-pager"
      data={items}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => (
        <View style={{ height: pageHeight }}>{renderPage(item, index)}</View>
      )}
      pagingEnabled
      snapToInterval={pageHeight}
      snapToAlignment="start"
      decelerationRate="fast"
      disableIntervalMomentum
      showsVerticalScrollIndicator={false}
      getItemLayout={(_, index) => ({
        length: pageHeight,
        offset: pageHeight * index,
        index,
      })}
      onScrollBeginDrag={handleScrollBeginDrag}
      onMomentumScrollEnd={handleScrollEnd}
      onScrollEndDrag={handleScrollEnd}
    />
  );
}

export const FeedPager = forwardRef(FeedPagerInner) as <T>(
  props: FeedPagerProps<T> & { ref?: React.Ref<FeedPagerHandle> }
) => React.ReactElement;
