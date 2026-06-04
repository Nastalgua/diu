import type { TCard, TPrimarySource } from '@diu/types';
import { isSamePrimarySource } from '@diu/types';

export function omitTackledPrimarySources(
  cards: TCard[],
  tackled: TPrimarySource[]
): TCard[] {
  if (tackled.length === 0) {
    return cards;
  }

  return cards.filter(
    (card) =>
      !tackled.some((t) => isSamePrimarySource(card.primarySource, t))
  );
}
