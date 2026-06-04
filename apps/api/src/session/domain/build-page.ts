import type { TEndCard, TSessionPage } from '@diu/types';
import { omitTackledPrimarySources } from './filter-tackled-cards.js';
import {
  getFixtureDeck,
  SESSION_DAILY_MAX,
  SESSION_PAGE_SIZE,
} from './fixture-cards.js';
import { getSession, markSessionExhausted } from './session-store.js';
import { getTackledPrimarySources } from './tackle-store.js';

export function buildSessionPage(
  sessionId: string,
  offset: number,
  calendarDay: string
): TSessionPage {
  const deckIndex = getSession(sessionId)?.deckIndex ?? 0;
  const { cards: deckCards, endCard: deckEndCard } = getFixtureDeck(deckIndex);
  const tackled = getTackledPrimarySources(calendarDay);
  const availableCards = omitTackledPrimarySources(deckCards, tackled);
  const sessionCap = Math.min(availableCards.length, SESSION_DAILY_MAX);
  const cards = availableCards.slice(offset, offset + SESSION_PAGE_SIZE);
  const nextOffset = offset + cards.length;
  const hasMore = nextOffset < sessionCap;

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
