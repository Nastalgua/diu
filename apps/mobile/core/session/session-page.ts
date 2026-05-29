import type { TEndCard, TSessionPage } from '@diu/types';

import type { TFeedStackItem } from '@/core/components/feed-card/fake-data';

export function sessionPageToStack(page: TSessionPage): TFeedStackItem[] {
  const items: TFeedStackItem[] = [...page.cards];

  if (!page.hasMore && page.endCard) {
    items.push(page.endCard as TEndCard);
  }

  return items;
}

export function isEndCard(item: TFeedStackItem): item is TEndCard {
  return 'kind' in item && item.kind === 'end';
}
