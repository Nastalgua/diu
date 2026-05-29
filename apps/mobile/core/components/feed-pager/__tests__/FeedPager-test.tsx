import { createRef } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import {
  FeedPager,
  type FeedPagerHandle,
} from '@/core/components/feed-pager/FeedPager';
import { notifyFeedSwipeStart } from '@/core/components/feed-pager/feedSnapFeedback';

jest.mock('@/core/components/feed-pager/feedSnapFeedback', () => ({
  notifyFeedSwipeStart: jest.fn(),
}));

const PAGE_HEIGHT = 800;
const ITEMS = ['card-a', 'card-b', 'card-c'];

function renderPager(
  overrides: Partial<React.ComponentProps<typeof FeedPager<string>>> = {}
) {
  const { ref, ...rest } = overrides;
  const props = {
    items: ITEMS,
    pageHeight: PAGE_HEIGHT,
    renderPage: (item: string) => <Text>{item}</Text>,
    keyExtractor: (item: string) => item,
    ...rest,
  };

  return render(<FeedPager ref={ref} {...props} />);
}

function scrollPagerTo(offsetY: number) {
  fireEvent.scroll(screen.getByTestId('feed-pager'), {
    nativeEvent: {
      contentOffset: { y: offsetY, x: 0 },
      contentSize: { height: PAGE_HEIGHT * ITEMS.length, width: 375 },
      layoutMeasurement: { height: PAGE_HEIGHT, width: 375 },
    },
  });

  fireEvent(screen.getByTestId('feed-pager'), 'onMomentumScrollEnd', {
    nativeEvent: {
      contentOffset: { y: offsetY, x: 0 },
      contentSize: { height: PAGE_HEIGHT * ITEMS.length, width: 375 },
      layoutMeasurement: { height: PAGE_HEIGHT, width: 375 },
    },
  });
}

describe('FeedPager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rests on the card at initialIndex', () => {
    renderPager({ initialIndex: 1 });

    expect(screen.getByText('card-b')).toBeOnTheScreen();
  });

  test('fires onIndexChange when settling on the next card', () => {
    const onIndexChange = jest.fn();
    renderPager({ onIndexChange });

    scrollPagerTo(PAGE_HEIGHT);

    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  test('changes index by at most one per gesture', () => {
    const onIndexChange = jest.fn();
    renderPager({ onIndexChange });

    scrollPagerTo(PAGE_HEIGHT * 2);

    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(onIndexChange).not.toHaveBeenCalledWith(2);
  });

  test('does not advance before the first card', () => {
    const onIndexChange = jest.fn();
    renderPager({ onIndexChange });

    scrollPagerTo(-PAGE_HEIGHT);

    expect(onIndexChange).not.toHaveBeenCalled();
  });

  test('does not swipe back below minimumIndex', () => {
    const onIndexChange = jest.fn();
    renderPager({ initialIndex: 1, minimumIndex: 1, onIndexChange });

    scrollPagerTo(0);

    expect(onIndexChange).not.toHaveBeenCalled();
  });

  test('advanceToNext moves to the next card', () => {
    const onIndexChange = jest.fn();
    const pagerRef = createRef<FeedPagerHandle>();
    renderPager({ ref: pagerRef, onIndexChange });

    pagerRef.current?.advanceToNext();

    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(screen.getByText('card-b')).toBeOnTheScreen();
  });

  test('does not use pull-to-refresh', () => {
    renderPager();

    expect(screen.getByTestId('feed-pager').props.refreshControl).toBeUndefined();
  });

  test('gives swipe feedback when the user starts dragging', () => {
    renderPager();

    fireEvent(screen.getByTestId('feed-pager'), 'onScrollBeginDrag');

    expect(notifyFeedSwipeStart).toHaveBeenCalledTimes(1);
  });

  test('does not give swipe feedback when advancing programmatically', () => {
    const pagerRef = createRef<FeedPagerHandle>();
    renderPager({ ref: pagerRef });

    pagerRef.current?.advanceToNext();

    expect(notifyFeedSwipeStart).not.toHaveBeenCalled();
  });
});
