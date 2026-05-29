import type { TEndCard, TSessionPage } from '@diu/types';
import {
  fixtureCards,
  fixtureEndCard,
  SESSION_DAILY_MAX,
  SESSION_PAGE_SIZE,
} from './fixture-cards.js';
import { markSessionExhausted } from './session-store.js';

export function buildSessionPage(
  sessionId: string,
  offset: number
): TSessionPage {
  const cards = fixtureCards.slice(offset, offset + SESSION_PAGE_SIZE);
  const nextOffset = offset + cards.length;
  const hasMore = nextOffset < SESSION_DAILY_MAX;

  if (hasMore) {
    return {
      sessionId,
      cards,
      cursor: String(nextOffset),
      hasMore: true,
    };
  }

  markSessionExhausted(sessionId);

  const endCard: TEndCard = fixtureEndCard;

  return {
    sessionId,
    cards,
    cursor: null,
    hasMore: false,
    endCard,
  };
}
