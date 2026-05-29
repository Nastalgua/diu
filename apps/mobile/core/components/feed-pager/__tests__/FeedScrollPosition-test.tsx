import { FeedScrollPosition } from '@/core/components/feed-pager/FeedScrollPosition';

describe('FeedScrollPosition', () => {
  test('canGoBack is false at index 0', () => {
    const position = new FeedScrollPosition('session-1');

    expect(position.getIndex()).toBe(0);
    expect(position.canGoBack()).toBe(false);
  });

  test('markSeen accumulates seen indices', () => {
    const position = new FeedScrollPosition('session-1');

    position.markSeen(0);
    position.markSeen(2);

    expect(position.isSeen(0)).toBe(true);
    expect(position.isSeen(1)).toBe(false);
    expect(position.isSeen(2)).toBe(true);
  });

  test('forward paging marks the departing card as seen', () => {
    const position = new FeedScrollPosition('session-1');

    position.settleIndex(1);

    expect(position.getIndex()).toBe(1);
    expect(position.isSeen(0)).toBe(true);
  });

  test('canGoBack is true after paging forward to the next card', () => {
    const position = new FeedScrollPosition('session-1');

    position.settleIndex(1);

    expect(position.canGoBack()).toBe(true);
  });

  test('cannot swipe back to a card that has not been seen', () => {
    const position = new FeedScrollPosition('session-1', 1);

    expect(position.canGoBack()).toBe(false);
    expect(position.getMinimumIndex()).toBe(1);
  });

  test('swipe-back moves through seen cards in order', () => {
    const position = new FeedScrollPosition('session-1');

    position.settleIndex(1);
    position.settleIndex(2);

    position.settleIndex(1);
    expect(position.getIndex()).toBe(1);
    expect(position.canGoBack()).toBe(true);

    position.settleIndex(0);
    expect(position.getIndex()).toBe(0);
    expect(position.canGoBack()).toBe(false);
  });
});
