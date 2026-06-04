import type { TEndCard, TSessionPage } from '@diu/types';

import type { TFeedStackItem } from '@/core/components/feed-card/fake-data';

export function sessionPageToStack(page: TSessionPage): TFeedStackItem[] {
  const items: TFeedStackItem[] = [...page.cards];

  if (!page.hasMore && page.endCard) {
    items.push(page.endCard as TEndCard);
  }

  return items;
}

export function appendSessionPage(
  stack: TFeedStackItem[],
  page: TSessionPage
): TFeedStackItem[] {
  const existingIds = new Set(stack.map((item) => item.id));
  const next = [
    ...stack,
    ...page.cards.filter((card) => !existingIds.has(card.id)),
  ];

  if (!page.hasMore && page.endCard && !existingIds.has(page.endCard.id)) {
    next.push(page.endCard as TEndCard);
  }

  return next;
}

export function isEndCard(item: TFeedStackItem): item is TEndCard {
  return 'kind' in item && item.kind === 'end';
}

export function stackHasEndCard(stack: TFeedStackItem[]): boolean {
  return stack.some(isEndCard);
}
