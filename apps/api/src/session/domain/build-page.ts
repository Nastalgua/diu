import type { TEndCard, TSessionPage } from '@diu/types';
import {
  getFixtureDeck,
  SESSION_DAILY_MAX,
  SESSION_PAGE_SIZE,
} from './fixture-cards.js';
import { getSession, markSessionExhausted } from './session-store.js';

export function buildSessionPage(
  sessionId: string,
  offset: number
): TSessionPage {
  const deckIndex = getSession(sessionId)?.deckIndex ?? 0;
  const { cards: deckCards, endCard: deckEndCard } = getFixtureDeck(deckIndex);
  const cards = deckCards.slice(offset, offset + SESSION_PAGE_SIZE);
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

  const endCard: TEndCard = deckEndCard;

  return {
    sessionId,
    cards,
    cursor: null,
    hasMore: false,
    endCard,
  };
}
