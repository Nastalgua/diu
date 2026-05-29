import { cards, feedStack, isEndCard } from '@/core/components/feed-card/fake-data';

describe('fake-data feed stack', () => {
  test('ends with an end card after all work cards', () => {
    const last = feedStack[feedStack.length - 1];

    expect(feedStack.length).toBe(cards.length + 1);
    expect(isEndCard(last)).toBe(true);
    if (isEndCard(last)) {
      expect(last.title).toMatch(/caught up/i);
    }
  });
});
